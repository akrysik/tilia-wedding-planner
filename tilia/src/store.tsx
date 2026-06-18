import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, BiText, Lang } from './types';
import { getDict, type Dict } from './i18n';
import { seedData } from './seed';
import { supabase, isSupabaseConfigured } from './supabase';

const LANG_KEY = 'tilia:lang';
const DEMO_FLAG = 'tilia:demo';

/** Who the data belongs to. `undefined` = still resolving session; `null` = logged out. */
export type Identity =
  | { kind: 'user'; id: string; email: string }
  | { kind: 'demo' };

const dataKey = (id: Identity) => (id.kind === 'demo' ? 'tilia:v1:demo' : `tilia:v1:user:${id.id}`);

function freshSeed(): AppData {
  return structuredClone(seedData);
}

function loadData(key: string): AppData {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const d = JSON.parse(raw) as AppData;
      if (d && Array.isArray(d.tasks)) {
        // Merge in defaults for keys added after this entry was saved (e.g. `wedding`).
        const merged = { ...freshSeed(), ...d, wedding: { ...freshSeed().wedding, ...d.wedding } };
        // Backfill table numbers for entries saved before the field existed.
        merged.tables = merged.tables.map((t, i) => ({ ...t, number: t.number ?? i + 1 }));
        return merged;
      }
    }
  } catch {
    // corrupted entry → fall back to a fresh seeded wedding
  }
  return freshSeed();
}

function loadLang(): Lang {
  return localStorage.getItem(LANG_KEY) === 'pl' ? 'pl' : 'en';
}

interface Store {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: Dict;
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;

  identity: Identity | null | undefined;
  supabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
  enterDemo: () => void;

  toast: (msg: string) => void;
  toastMsg: string | null;
  money: (n: number) => string;
  catName: (c: BiText | { en: string; pl: string }) => string;
}

const AppContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);
  const [identity, setIdentity] = useState<Identity | null | undefined>(undefined);
  // data + the key it was loaded from are kept together so we never persist
  // one identity's data under another's key during a transition.
  const [store, setStore] = useState<{ key: string; data: AppData } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  // Resolve the initial session, then keep identity in sync with Supabase auth.
  useEffect(() => {
    let active = true;

    (async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (session?.user) {
          setIdentity({ kind: 'user', id: session.user.id, email: session.user.email ?? '' });
          return;
        }
      }
      if (!active) return;
      setIdentity(localStorage.getItem(DEMO_FLAG) === '1' ? { kind: 'demo' } : null);
    })();

    let unsub: (() => void) | undefined;
    if (isSupabaseConfigured && supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          localStorage.removeItem(DEMO_FLAG);
          setIdentity({ kind: 'user', id: session.user.id, email: session.user.email ?? '' });
        } else {
          // Supabase signed us out — but don't clobber an active demo session.
          setIdentity((prev) => (prev && prev.kind === 'demo' ? prev : null));
        }
      });
      unsub = () => sub.subscription.unsubscribe();
    }

    return () => { active = false; unsub?.(); };
  }, []);

  // Load the right data whenever the identity changes.
  useEffect(() => {
    if (!identity) { setStore(null); return; }
    const key = dataKey(identity);
    setStore({ key, data: loadData(key) });
  }, [identity]);

  // Persist on every change, always under the key the data was loaded from.
  useEffect(() => {
    if (store) localStorage.setItem(store.key, JSON.stringify(store.data));
  }, [store]);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setStore((s) => (s ? { key: s.key, data: fn(s.data) } : s));
  }, []);

  const toast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: getDict(lang).auth.notConfigured };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: error.message } : {};
  }, [lang]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: getDict(lang).auth.notConfigured };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { error: error.message };
    return { needsConfirm: !data.session };
  }, [lang]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(DEMO_FLAG);
    setIdentity(null);
  }, []);

  const enterDemo = useCallback(() => {
    localStorage.setItem(DEMO_FLAG, '1');
    setIdentity({ kind: 'demo' });
  }, []);

  const ctx = useMemo<Store>(() => ({
    lang,
    setLang,
    tr: getDict(lang),
    data: store?.data ?? seedData,
    update,
    identity,
    supabaseConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    enterDemo,
    toast,
    toastMsg,
    money: (n: number) => n.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB') + ' zł',
    catName: (c) => c[lang] || c.en,
  }), [lang, setLang, store, update, identity, signIn, signUp, signOut, enterDemo, toast, toastMsg]);

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp(): Store {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
}

export const gname = (g: { first: string; last: string }) => (g.first + ' ' + g.last).trim();

/** Keep day-of items chronological; times 00:00–04:59 sort as after midnight. */
export function sortDayOf<T extends { time: string }>(items: T[]): T[] {
  const k = (tm: string) => {
    const h = +tm.slice(0, 2);
    return (h < 5 ? h + 24 : h) * 60 + (+tm.slice(3, 5) || 0);
  };
  return [...items].sort((a, b) => k(a.time) - k(b.time));
}
