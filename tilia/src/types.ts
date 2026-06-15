export type Lang = 'en' | 'pl';

/** User-entered text kept in both languages (prototype convention: same string in both). */
export type BiText = { en: string; pl: string };

export type Timeframe = 'm12' | 'm6' | 'm1' | 'w1' | 'd0';
export type Assignee = 'me' | 'partner' | 'couple' | 'family' | 'planner';
export type GuestGroup = 'brideFam' | 'groomFam' | 'friends';
export type Rsvp = 'yes' | 'no' | 'pending';
export type TableShape = 'round' | 'rect';

export interface Task {
  id: number;
  tf: Timeframe;
  en: string;
  pl: string;
  who: Assignee;
  due: string; // YYYY-MM-DD
  done: boolean;
  det?: BiText;
}

export interface DayOfItem {
  id: number;
  time: string; // HH:MM
  en: string;
  pl: string;
  det?: BiText;
}

export interface BudgetCategory {
  key: string;
  en: string;
  pl: string;
  est: number;
}

export interface Expense {
  id: number;
  name: BiText;
  cat: string;
  amt: number;
  paid: boolean;
  note?: BiText;
}

export interface Guest {
  id: number;
  first: string;
  last: string;
  group: GuestGroup;
  phone: string;
  address: string;
  notes: BiText;
  rsvp: Rsvp;
  table: number | null;
  seat?: number;
}

export interface SeatingTable {
  id: number;
  shape: TableShape;
  name: BiText;
  x: number;
  y: number;
}

export interface Vendor {
  id: number;
  cat: BiText;
  name: string;
  contact: string;
  stage: number; // 0–3: Researching / Contacted / Booked / Paid
  docs: BiText[];
  notes: BiText;
  log: { when: string; en: string; pl: string }[];
}

export interface MoodPin {
  c: string;
  en: string;
  pl: string;
}

export interface Notification {
  ico: string;
  en: string;
  pl: string;
  when: BiText;
  read: boolean;
}

export interface AppData {
  tasks: Task[];
  dayOf: DayOfItem[];
  budget: {
    total: number;
    cats: BudgetCategory[];
    expenses: Expense[];
  };
  guests: Guest[];
  tables: SeatingTable[];
  vendors: Vendor[];
  mood: MoodPin[];
  themeNotes: BiText;
  palette: string[];
  notifications: Notification[];
}
