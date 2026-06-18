import type { Lang } from './types';

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Polish dates use the genitive form ("12 września" not "12 Wrzesień").
const MONTHS_PL_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

/** Build a Date from the stored date (YYYY-MM-DD) + time (HH:MM), in local time. */
export function weddingDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time || '00:00'}:00`);
}

export function formatWeddingDate(date: string, lang: Lang): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  const month = (lang === 'pl' ? MONTHS_PL_GEN : MONTHS_EN)[m - 1] ?? '';
  return `${d} ${month} ${y}`;
}

export function formatTime(time: string, lang: Lang): string {
  const [h, mn] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  if (lang === 'pl') return `${String(h).padStart(2, '0')}:${String(mn || 0).padStart(2, '0')}`;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mn || 0).padStart(2, '0')} ${ampm}`;
}

export function formatWeddingDateTime(date: string, time: string, lang: Lang): string {
  return `${formatWeddingDate(date, lang)}, ${formatTime(time, lang)}`;
}
