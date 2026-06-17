import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when real-looking credentials are present. Lets the app run in
 * demo mode (and render the login UI) before a Supabase project is wired up.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && url.startsWith('http') && !url.includes('YOUR-PROJECT'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
