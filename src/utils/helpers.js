// Unique ID generator
let _counter = 0;
export const uid = () => `${Date.now()}_${++_counter}_${Math.random().toString(36).slice(2, 7)}`;

// Date helpers
export const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
export const MONTHS_FULL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
export const DAYS_SHORT = ['Ma','Di','Wo','Do','Vr','Za','Zo'];
export const DAYS_FULL = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];

export const today = new Date();
export const todayStr = formatDate(today);

export function formatDate(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
export function getFirstDayOfMonth(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

export function relativeDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((d - now) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Vandaag';
  if (diff === 1) return 'Morgen';
  if (diff === -1) return 'Gisteren';
  if (diff > 1 && diff <= 7) return `Over ${diff} dagen`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} dagen geleden`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(todayStr);
}

// Task categories / areas
export const AREAS = ['Werk', 'Persoonlijk', 'Side Hustle', 'Gezondheid', 'Studie', 'Financiën'];
export const PRIORITIES = ['Hoog', 'Medium', 'Laag'];
export const TASK_STATUSES = ['Backlog', 'To Do', 'Bezig', 'Afgerond'];
export const PROJECT_STATUSES = ['Actief', 'On Hold', 'Afgerond'];
export const GOAL_CATEGORIES = ['Gezondheid', 'Carrière', 'Financieel', 'Persoonlijk', 'Studie', 'Relaties'];
export const BUDGET_CATEGORIES = ['Eten & Drinken', 'Transport', 'Wonen', 'Abonnementen', 'Kleding', 'Entertainment', 'Gezondheid', 'Sparen', 'Overig'];
export const MOODS = [
  { emoji: '😄', label: 'Super', value: 5 },
  { emoji: '🙂', label: 'Goed', value: 4 },
  { emoji: '😐', label: 'Oké', value: 3 },
  { emoji: '😔', label: 'Meh', value: 2 },
  { emoji: '😢', label: 'Slecht', value: 1 },
];

export const JOURNAL_PROMPTS = [
  "Waar ben je vandaag dankbaar voor?",
  "Wat was het hoogtepunt van je dag?",
  "Wat heb je vandaag geleerd?",
  "Waar wil je morgen aan werken?",
  "Wat maakt je op dit moment gelukkig?",
  "Welke uitdaging heb je overwonnen?",
  "Wat zou je anders doen als je vandaag opnieuw kon doen?",
  "Wie heeft vandaag een positieve impact op je gehad?",
  "Wat is één ding dat je trots op jezelf maakt?",
  "Waar kijk je naar uit deze week?",
  "Hoe heb je vandaag voor jezelf gezorgd?",
  "Wat is een probleem waar je tegenaan loopt en hoe kun je het oplossen?",
];

// Color palette for projects/habits
export const COLORS = ['#E8563A','#3A8FE8','#10B981','#8B5CF6','#F59E0B','#EC4899','#06B6D4','#84CC16','#F97316','#6366F1'];

// Priority colors
export const PRIORITY_COLORS = { Hoog: '#ef4444', Medium: '#f59e0b', Laag: '#10b981' };

// Default data
export function getDefaultData() {
  return {
    habits: [
      { id: uid(), name: 'Sporten', emoji: '💪', color: '#E8563A' },
      { id: uid(), name: 'Lezen', emoji: '📖', color: '#3A8FE8' },
      { id: uid(), name: 'Mediteren', emoji: '🧘', color: '#8B5CF6' },
      { id: uid(), name: 'Water drinken', emoji: '💧', color: '#06B6D4' },
      { id: uid(), name: 'Gezond eten', emoji: '🥗', color: '#10B981' },
    ],
    habitLog: {},
    projects: [
      { id: 'proj_1', name: 'Portfolio Website', description: 'Mijn persoonlijke portfolio website herbouwen met een modern design.', status: 'Actief', color: '#3A8FE8', links: ['https://figma.com/design123'], braindump: 'Ideeën:\n- Hero sectie met animatie\n- Project showcase grid\n- Blog integratie', createdAt: todayStr },
      { id: 'proj_2', name: 'Side Hustle', description: 'Freelance design werk opzetten.', status: 'Actief', color: '#10B981', links: [], braindump: '', createdAt: todayStr },
    ],
    tasks: [
      { id: uid(), title: 'Portfolio homepage designen', project: 'proj_1', area: 'Werk', priority: 'Hoog', status: 'Bezig', deadline: '2026-03-28', subtasks: [{id: uid(), text: 'Wireframe maken', done: true},{id: uid(), text: 'Kleuren kiezen', done: false}], timeEstimate: 120, recurring: null, createdAt: todayStr },
      { id: uid(), title: 'Boodschappen doen', project: null, area: 'Persoonlijk', priority: 'Medium', status: 'To Do', deadline: '2026-03-24', subtasks: [], timeEstimate: 30, recurring: 'weekly', createdAt: todayStr },
      { id: uid(), title: 'Belastingaangifte', project: null, area: 'Financiën', priority: 'Hoog', status: 'To Do', deadline: '2026-04-01', subtasks: [], timeEstimate: 180, recurring: null, createdAt: todayStr },
      { id: uid(), title: 'Client wireframes reviewen', project: 'proj_2', area: 'Side Hustle', priority: 'Hoog', status: 'To Do', deadline: '2026-03-26', subtasks: [], timeEstimate: 60, recurring: null, createdAt: todayStr },
      { id: uid(), title: 'Gym membership verlengen', project: null, area: 'Gezondheid', priority: 'Laag', status: 'Backlog', deadline: '2026-03-30', subtasks: [], timeEstimate: 15, recurring: null, createdAt: todayStr },
    ],
    notes: [
      { id: uid(), title: 'Meeting aantekeningen', content: '# Q1 Review\n\n- Resultaten besproken\n- Nieuwe strategie voor Q2\n- **Actiepunt:** rapport afmaken\n- Team briefing plannen', tags: ['werk', 'meetings'], pinned: true, createdAt: todayStr, updatedAt: todayStr },
      { id: uid(), title: 'Boek ideeën', content: '- Atomic Habits\n- Deep Work\n- The Psychology of Money\n- Four Thousand Weeks', tags: ['leeslijst'], pinned: false, createdAt: todayStr, updatedAt: todayStr },
      { id: uid(), title: 'Braindump', content: 'Random ideeën die ik later wil uitwerken:\n\n1. App bouwen voor habit tracking\n2. YouTube kanaal starten\n3. Online cursus maken', tags: ['ideeën', 'braindump'], pinned: false, createdAt: todayStr, updatedAt: todayStr },
    ],
    goals: [
      { id: uid(), title: '10km hardlopen', category: 'Gezondheid', deadline: '2026-06-01', type: 'short', progress: 65, color: '#E8563A' },
      { id: uid(), title: '€5000 sparen', category: 'Financieel', deadline: '2026-12-31', type: 'long', progress: 40, color: '#10B981' },
      { id: uid(), title: 'Spaans leren (B1)', category: 'Persoonlijk', deadline: '2026-09-01', type: 'long', progress: 25, color: '#8B5CF6' },
      { id: uid(), title: 'Promotie krijgen', category: 'Carrière', deadline: '2026-06-01', type: 'long', progress: 50, color: '#3A8FE8' },
    ],
    pomodoro: {
      workMinutes: 25,
      breakMinutes: 5,
      sessions: [],
    },
    budget: {
      monthlyBudget: 2000,
      savingsGoals: [
        { id: uid(), name: 'Vakantie', target: 1500, saved: 600, color: '#F59E0B' },
        { id: uid(), name: 'Noodfonds', target: 5000, saved: 2000, color: '#10B981' },
      ],
      transactions: [
        { id: uid(), description: 'Salaris', amount: 2800, type: 'income', category: 'Overig', date: '2026-03-01' },
        { id: uid(), description: 'Huur', amount: -950, type: 'expense', category: 'Wonen', date: '2026-03-01' },
        { id: uid(), description: 'Albert Heijn', amount: -67.50, type: 'expense', category: 'Eten & Drinken', date: '2026-03-20' },
        { id: uid(), description: 'Spotify', amount: -10.99, type: 'expense', category: 'Abonnementen', date: '2026-03-15' },
        { id: uid(), description: 'NS Flex', amount: -39, type: 'expense', category: 'Transport', date: '2026-03-01' },
      ],
    },
    journal: [
      { id: uid(), date: todayStr, mood: 4, entry: 'Productieve dag gehad. Portfolio website gaat goed vooruit. Moet morgen nog de belastingaangifte afronden.', prompt: 'Wat was het hoogtepunt van je dag?' },
    ],
  };
}
