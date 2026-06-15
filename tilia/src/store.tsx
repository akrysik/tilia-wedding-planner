import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, BiText, Lang } from './types';
import { getDict, type Dict } from './i18n';
import { seedData } from './seed';

const STORAGE_KEY = 'tilia:v1';

interface Persisted {
  lang: Lang;
  loggedIn: boolean;
  data: AppData;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (p && p.data && Array.isArray(p.data.tasks)) return { lang: p.lang === 'pl' ? 'pl' : 'en', loggedIn: p.loggedIn !== false, data: p.data };
    }
  } catch {
    // corrupted storage falls back to seed data
  }
  return { lang: 'en', loggedIn: true, data: seedData };
}

interface Store {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: Dict;
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  money: (n: number) => string;
  catName: (c: BiText | { en: string; pl: string }) => string;
}

const AppContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useRef(load());
  const [lang, setLang] = useState<Lang>(initial.current.lang);
  const [loggedIn, setLoggedIn] = useState(initial.current.loggedIn);
  const [data, setData] = useState<AppData>(initial.current.data);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const p: Persisted = { lang, loggedIn, data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }, [lang, loggedIn, data]);

  const toast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => setData(fn), []);

  const store = useMemo<Store>(() => ({
    lang,
    setLang,
    tr: getDict(lang),
    data,
    update,
    loggedIn,
    setLoggedIn,
    toast,
    toastMsg,
    money: (n: number) => n.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-GB') + ' zł',
    catName: (c) => c[lang] || c.en,
  }), [lang, data, loggedIn, toast, toastMsg, update]);

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp(): Store {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
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
