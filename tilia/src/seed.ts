import type { AppData } from './types';

export const WEDDING_DATE = new Date('2026-09-12T15:00:00');
export const ROUND_MAX = 10;
export const ROUND_MIN = 6;

export const PIE_COLORS = ['#356B4F', '#D98E04', '#C0563B', '#8A9B6E', '#5B7E9E', '#A06B8A', '#7B6A4F', '#C9A36A', '#4A7A52', '#9C8458'];
export const SWATCHES = ['#D6456B', '#E8A0B4', '#FFFFFF', '#EADDC4', '#C9A36A', '#8A9B6E', '#4A7A52', '#7B6A4F', '#D98E04', '#1C1813'];

export const seedData: AppData = {
  tasks: [
    { id: 1, tf: 'm12', en: 'Book the venue', pl: 'Zarezerwuj salę weselną', who: 'partner', due: '2025-10-01', done: true },
    { id: 2, tf: 'm12', en: 'Set the budget', pl: 'Ustal budżet', who: 'couple', due: '2025-10-10', done: true },
    { id: 3, tf: 'm12', en: 'Draft the guest list', pl: 'Przygotuj wstępną listę gości', who: 'couple', due: '2025-11-01', done: true },
    { id: 4, tf: 'm6', en: 'Book photographer', pl: 'Zarezerwuj fotografa', who: 'me', due: '2026-03-15', done: true },
    { id: 5, tf: 'm6', en: 'Order invitations', pl: 'Zamów zaproszenia', who: 'me', due: '2026-06-20', done: false, det: { en: '80 pcs, beige linen paper, RSVP card included', pl: '80 szt., beżowy papier lniany, z kartą RSVP' } },
    { id: 6, tf: 'm6', en: 'Choose the menu with caterer', pl: 'Wybierz menu z cateringiem', who: 'partner', due: '2026-06-26', done: false },
    { id: 7, tf: 'm1', en: 'Final dress fitting', pl: 'Ostatnia przymiarka sukni', who: 'me', due: '2026-08-14', done: false, det: { en: 'Salon Biel, 12:00, bring the shoes', pl: 'Salon Biel, 12:00, zabrać buty' } },
    { id: 8, tf: 'm1', en: 'Confirm headcount with venue', pl: 'Potwierdź liczbę gości z salą', who: 'planner', due: '2026-08-20', done: false },
    { id: 9, tf: 'w1', en: 'Pick up the rings', pl: 'Odbierz obrączki', who: 'partner', due: '2026-09-07', done: false, det: { en: 'Jeweller on Świdnicka St., paid in full', pl: 'Jubiler na Świdnickiej, opłacone w całości' } },
    { id: 10, tf: 'w1', en: 'Pack day-of emergency kit', pl: 'Spakuj zestaw awaryjny na dzień ślubu', who: 'family', due: '2026-09-10', done: false },
    { id: 11, tf: 'd0', en: 'Hand envelopes to vendors', pl: 'Przekaż koperty usługodawcom', who: 'family', due: '2026-09-12', done: false },
  ],
  dayOf: [
    { id: 1, time: '12:00', en: 'Hair & makeup', pl: 'Fryzjer i makijaż', det: { en: 'Bride suite, 1st floor · stylist: Marta', pl: 'Apartament panny młodej, 1. piętro · stylistka: Marta' } },
    { id: 2, time: '14:00', en: 'First look & couple photos', pl: 'First look i sesja pary', det: { en: 'Old oak alley behind the manor · Anna Frame Studio', pl: 'Aleja dębowa za dworem · Anna Frame Studio' } },
    { id: 3, time: '15:00', en: 'Ceremony begins', pl: 'Początek ceremonii', det: { en: 'Garden gazebo · guests seated by 14:45', pl: 'Altana w ogrodzie · goście na miejscach do 14:45' } },
    { id: 4, time: '16:30', en: 'Welcome toast & dinner', pl: 'Toast powitalny i obiad', det: { en: 'Main hall · speeches: dad of the bride, best man', pl: 'Sala główna · przemowy: tata panny młodej, świadek' } },
    { id: 5, time: '19:00', en: 'First dance', pl: 'Pierwszy taniec', det: { en: '"At Last" — rehearsed version, band live', pl: '„At Last" — wersja z prób, zespół na żywo' } },
    { id: 6, time: '21:00', en: 'Cake cutting', pl: 'Krojenie tortu', det: { en: '3-tier vanilla-raspberry · sparklers ready', pl: '3 piętra, wanilia-malina · zimne ognie gotowe' } },
    { id: 7, time: '00:00', en: 'Oczepiny / midnight games', pl: 'Oczepiny', det: { en: 'DJ takes over from the band', pl: 'DJ przejmuje po zespole' } },
  ],
  budget: {
    total: 90000,
    cats: [
      { key: 'venue', en: 'Venue', pl: 'Sala', est: 30000 },
      { key: 'catering', en: 'Catering', pl: 'Catering', est: 25000 },
      { key: 'attire', en: 'Attire', pl: 'Stroje', est: 8000 },
      { key: 'photo', en: 'Photography', pl: 'Fotografia', est: 9000 },
      { key: 'flowers', en: 'Flowers & decor', pl: 'Kwiaty i dekoracje', est: 6000 },
      { key: 'music', en: 'Music / band', pl: 'Muzyka / zespół', est: 7000 },
      { key: 'other', en: 'Other', pl: 'Inne', est: 5000 },
    ],
    expenses: [
      { id: 1, name: { en: 'Venue deposit', pl: 'Zaliczka za salę' }, cat: 'venue', amt: 16500, paid: true, note: { en: 'Invoice FV/102/2025', pl: 'Faktura FV/102/2025' } },
      { id: 2, name: { en: 'Venue — final payment', pl: 'Sala — płatność końcowa' }, cat: 'venue', amt: 15000, paid: false },
      { id: 3, name: { en: 'Catering deposit', pl: 'Zaliczka za catering' }, cat: 'catering', amt: 12000, paid: true },
      { id: 4, name: { en: 'Catering balance', pl: 'Catering — reszta' }, cat: 'catering', amt: 12200, paid: false },
      { id: 5, name: { en: 'Wedding dress', pl: 'Suknia ślubna' }, cat: 'attire', amt: 5200, paid: true },
      { id: 6, name: { en: 'Suit', pl: 'Garnitur' }, cat: 'attire', amt: 1700, paid: true },
      { id: 7, name: { en: 'Photographer deposit', pl: 'Zaliczka dla fotografa' }, cat: 'photo', amt: 4500, paid: true },
      { id: 8, name: { en: 'Photographer — final', pl: 'Fotograf — płatność końcowa' }, cat: 'photo', amt: 4500, paid: false },
      { id: 9, name: { en: 'Florist deposit', pl: 'Zaliczka — kwiaciarnia' }, cat: 'flowers', amt: 2000, paid: true },
      { id: 10, name: { en: 'Centerpieces', pl: 'Dekoracje stołów' }, cat: 'flowers', amt: 2100, paid: false },
      { id: 11, name: { en: 'Band deposit', pl: 'Zaliczka dla zespołu' }, cat: 'music', amt: 2000, paid: true },
      { id: 12, name: { en: 'Band — final', pl: 'Zespół — płatność końcowa' }, cat: 'music', amt: 5500, paid: false },
      { id: 13, name: { en: 'Wedding favors', pl: 'Podziękowania dla gości' }, cat: 'other', amt: 1800, paid: true },
    ],
  },
  guests: [
    { id: 1, first: 'Maria', last: 'Kowalska', group: 'brideFam', phone: '+48 600 100 200', address: 'ul. Lipowa 4, Wrocław', notes: { en: 'Vegetarian', pl: 'Wegetarianka' }, rsvp: 'yes', table: 1, seat: 1 },
    { id: 2, first: 'Jan', last: 'Kowalski', group: 'brideFam', phone: '+48 600 100 201', address: 'ul. Lipowa 4, Wrocław', notes: { en: '', pl: '' }, rsvp: 'yes', table: 1, seat: 2 },
    { id: 3, first: 'Kasia', last: 'Nowak', group: 'friends', phone: '+48 511 222 333', address: 'ul. Polna 12, Kraków', notes: { en: '+1 possible', pl: 'Możliwa osoba tow.' }, rsvp: 'pending', table: null },
    { id: 4, first: 'Tom', last: 'Harris', group: 'friends', phone: '+44 7700 900123', address: '12 King St, London', notes: { en: 'Needs hotel', pl: 'Potrzebuje hotelu' }, rsvp: 'yes', table: 2, seat: 1 },
    { id: 5, first: 'Ola', last: 'Wiśniewska', group: 'friends', phone: '+48 512 333 444', address: 'ul. Miła 8, Poznań', notes: { en: '', pl: '' }, rsvp: 'no', table: null },
    { id: 6, first: 'Piotr', last: 'Zieliński', group: 'groomFam', phone: '+48 690 555 666', address: 'ul. Krótka 2, Opole', notes: { en: 'Gluten-free', pl: 'Bez glutenu' }, rsvp: 'yes', table: 1, seat: 3 },
    { id: 7, first: 'Emma', last: 'Clark', group: 'friends', phone: '+44 7700 900456', address: '3 Rose Ln, Leeds', notes: { en: '', pl: '' }, rsvp: 'pending', table: null },
    { id: 8, first: 'Basia', last: 'Lis', group: 'groomFam', phone: '+48 691 777 888', address: 'ul. Dębowa 9, Wrocław', notes: { en: 'Brings kids (2)', pl: 'Przyjedzie z dziećmi (2)' }, rsvp: 'yes', table: 3, seat: 1 },
    { id: 9, first: 'Adam', last: 'Mazur', group: 'groomFam', phone: '+48 602 444 111', address: 'ul. Jasna 5, Wrocław', notes: { en: '', pl: '' }, rsvp: 'yes', table: null },
    { id: 10, first: 'Zofia', last: 'Krawczyk', group: 'brideFam', phone: '+48 604 222 999', address: 'ul. Ogrodowa 1, Łódź', notes: { en: 'Allergic to nuts', pl: 'Alergia na orzechy' }, rsvp: 'yes', table: null },
  ],
  tables: [
    { id: 1, shape: 'round', name: { en: 'Family', pl: 'Rodzina' }, x: 30, y: 30 },
    { id: 2, shape: 'rect', name: { en: 'Head table', pl: 'Stół pary' }, x: 330, y: 50 },
    { id: 3, shape: 'round', name: { en: 'Friends', pl: 'Przyjaciele' }, x: 90, y: 280 },
    { id: 4, shape: 'rect', name: { en: 'Work', pl: 'Praca' }, x: 400, y: 300 },
  ],
  vendors: [
    {
      id: 1, cat: { en: 'Venue', pl: 'Sala' }, name: 'Dwór Lipowy', contact: 'kontakt@dworlipowy.pl', stage: 3,
      docs: [{ en: 'Contract.pdf', pl: 'Umowa.pdf' }], notes: { en: 'Includes accommodation for 20 guests.', pl: 'W cenie noclegi dla 20 gości.' },
      log: [{ when: '02.06', en: 'Confirmed menu tasting for June 20', pl: 'Potwierdzona degustacja menu 20.06' }],
    },
    {
      id: 2, cat: { en: 'Photography', pl: 'Fotografia' }, name: 'Anna Frame Studio', contact: 'hello@annaframe.com', stage: 2,
      docs: [{ en: 'Offer.pdf', pl: 'Oferta.pdf' }], notes: { en: '12h coverage, second shooter optional.', pl: '12h pracy, drugi fotograf opcjonalnie.' },
      log: [{ when: '28.05', en: 'Sent shot list draft', pl: 'Wysłano wstępną listę ujęć' }],
    },
    {
      id: 3, cat: { en: 'Music', pl: 'Muzyka' }, name: 'The Golden Hours Band', contact: 'booking@goldenhours.pl', stage: 1,
      docs: [], notes: { en: 'Plays both Polish and English sets.', pl: 'Repertuar polski i angielski.' },
      log: [{ when: '25.05', en: 'Asked for September availability', pl: 'Zapytanie o dostępność we wrześniu' }],
    },
    {
      id: 4, cat: { en: 'Flowers', pl: 'Kwiaty' }, name: 'Pracownia Pełnia', contact: 'pelnia@kwiaty.pl', stage: 0,
      docs: [], notes: { en: 'Shortlisted from Instagram.', pl: 'Wybrana wstępnie z Instagrama.' },
      log: [],
    },
  ],
  mood: [
    { c: '#C9A36A', en: 'Dried grass & beige linen', pl: 'Suche trawy i beżowy len' },
    { c: '#8A9B6E', en: 'Olive greenery arches', pl: 'Łuki z oliwnej zieleni' },
    { c: '#D6456B', en: 'Single bold rose accents', pl: 'Pojedyncze akcenty róży' },
    { c: '#B98A52', en: 'Warm candlelight tables', pl: 'Stoły w cieple świec' },
    { c: '#E3CDA8', en: 'Handwritten place cards', pl: 'Ręcznie pisane winietki' },
    { c: '#7B6A4F', en: 'Vintage wooden chairs', pl: 'Drewniane krzesła vintage' },
  ],
  themeNotes: {
    en: 'Rustic-elegant: beige linen, olive greenery, warm candlelight. One vibrant rose accent per table. No balloons, no neon.',
    pl: 'Rustykalna elegancja: beżowy len, oliwna zieleń, ciepłe światło świec. Jeden różowy akcent na stół. Bez balonów, bez neonów.',
  },
  palette: ['#356B4F', '#FFFFFF', '#C9A36A'],
  notifications: [
    { ico: '💌', en: 'Kasia Nowak confirmed her RSVP', pl: 'Kasia Nowak potwierdziła przybycie', when: { en: '2 h ago', pl: '2 godz. temu' }, read: false },
    { ico: '💸', en: 'Payment due in 3 days: Band — final (5 500 zł)', pl: 'Płatność za 3 dni: Zespół — końcowa (5 500 zł)', when: { en: '5 h ago', pl: '5 godz. temu' }, read: false },
    { ico: '✉️', en: 'Anna Frame Studio replied to your message', pl: 'Anna Frame Studio odpowiedziało na wiadomość', when: { en: 'yesterday', pl: 'wczoraj' }, read: false },
    { ico: '✅', en: 'Task completed: Book photographer', pl: 'Zadanie ukończone: Zarezerwuj fotografa', when: { en: '2 days ago', pl: '2 dni temu' }, read: true },
  ],
};
