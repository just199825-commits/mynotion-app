import React from 'react';
import { CheckCircle2, ListTodo, Target, Timer, Wallet, Flame, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatCard, ProgressBar, Badge } from './UI';
import { todayStr, DAYS_FULL, MONTHS, today, PRIORITY_COLORS, isOverdue, relativeDate } from '../utils/helpers';

export default function Dashboard({ data, setPage }) {
  const { habits, habitLog, tasks, goals, pomodoro, budget, journal } = data;

  // Stats
  const completedToday = habits.filter(h => habitLog[`${todayStr}_${h.id}`]).length;
  const openTasks = tasks.filter(t => t.status !== 'Afgerond').length;
  const doneTasks = tasks.filter(t => t.status === 'Afgerond').length;
  const urgentTasks = tasks.filter(t => t.status !== 'Afgerond' && t.priority === 'Hoog').slice(0, 4);
  const avgGoalProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  // Streak
  const getStreak = () => {
    let streak = 0;
    let d = new Date(today);
    while (true) {
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const done = habits.filter(h => habitLog[`${ds}_${h.id}`]).length;
      if (done === habits.length && habits.length > 0) { streak++; d.setDate(d.getDate() - 1); }
      else if (ds === todayStr) { d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };
  const streak = getStreak();

  // Pomodoro today
  const pomodoroToday = pomodoro.sessions.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.minutes, 0);

  // Budget month
  const thisMonth = todayStr.slice(0, 7);
  const monthExpenses = Math.abs(budget.transactions.filter(t => t.date.startsWith(thisMonth) && t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  const budgetPct = budget.monthlyBudget ? Math.round(monthExpenses / budget.monthlyBudget * 100) : 0;

  // Today journal
  const todayJournal = journal.find(j => j.date === todayStr);

  // Greeting
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';

  return (
    <div className="animate-slide">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-7 mb-6 text-white">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 left-1/3 w-24 h-24 rounded-full bg-white/5" />
        <p className="text-sm opacity-80 font-medium">
          {DAYS_FULL[today.getDay()]} · {today.getDate()} {MONTHS[today.getMonth()]} {today.getFullYear()}
        </p>
        <h1 className="text-2xl font-extrabold mt-1 tracking-tight">{greeting} 👋</h1>
        <p className="text-sm opacity-70 mt-1">Hier is je dagelijkse overzicht</p>
        {streak > 0 && (
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-white/15 rounded-full text-sm font-semibold">
            <Flame size={16} /> {streak} dagen streak!
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<CheckCircle2 size={18} />} label="Habits vandaag" value={`${completedToday}/${habits.length}`} color="#10B981" onClick={() => setPage('habits')} />
        <StatCard icon={<ListTodo size={18} />} label="Open taken" value={openTasks} sub={`${doneTasks} afgerond`} color="#3A8FE8" onClick={() => setPage('tasks')} />
        <StatCard icon={<Target size={18} />} label="Goals" value={`${avgGoalProgress}%`} color="#8B5CF6" onClick={() => setPage('goals')} />
        <StatCard icon={<Timer size={18} />} label="Focus vandaag" value={`${pomodoroToday}m`} color="#F59E0B" onClick={() => setPage('pomodoro')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Urgente taken</h3>
            <button onClick={() => setPage('tasks')} className="text-xs text-brand-500 font-medium flex items-center gap-1 hover:underline">
              Alles bekijken <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {urgentTasks.length === 0 && (
              <p className="text-sm text-surface-400 dark:text-surface-500 py-4 text-center">Geen urgente taken 🎉</p>
            )}
            {urgentTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/15">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-surface-500">{t.area}</span>
                    {t.deadline && (
                      <span className={`text-xs font-medium ${isOverdue(t.deadline) ? 'text-red-500' : 'text-surface-400'}`}>
                        📅 {relativeDate(t.deadline)}
                      </span>
                    )}
                  </div>
                </div>
                <Badge color={PRIORITY_COLORS.Hoog}>Hoog</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Budget overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Budget deze maand</h3>
            <button onClick={() => setPage('budget')} className="text-xs text-brand-500 font-medium flex items-center gap-1 hover:underline">
              Details <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-surface-500">Uitgegeven</span>
              <span className="text-lg font-bold text-surface-900 dark:text-surface-100">€{monthExpenses.toFixed(0)}<span className="text-sm font-normal text-surface-400"> / €{budget.monthlyBudget}</span></span>
            </div>
            <ProgressBar value={budgetPct} color={budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#10b981'} />
            {budgetPct > 80 && (
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-500">
                <AlertTriangle size={12} /> Let op: {budgetPct}% van je budget gebruikt
              </div>
            )}
          </div>

          {/* Goals preview */}
          <h3 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider mt-5 mb-3">Goals voortgang</h3>
          <div className="flex flex-col gap-2">
            {goals.slice(0, 3).map(g => (
              <div key={g.id} className="p-3 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-surface-900 dark:text-surface-200">{g.title}</span>
                  <span className="text-xs font-bold" style={{ color: g.color }}>{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} color={g.color} height={5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
