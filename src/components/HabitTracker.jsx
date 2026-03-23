import React, { useState } from 'react';
import { Plus, Trash2, Flame, X } from 'lucide-react';
import { Modal } from './UI';
import { uid, todayStr, MONTHS, today, getDaysInMonth, COLORS, formatDate } from '../utils/helpers';

export default function HabitTracker({ habits, setHabits, habitLog, setHabitLog }) {
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [view, setView] = useState('grid'); // grid | heatmap

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const toggleHabit = (habitId, day) => {
    const key = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}_${habitId}`;
    setHabitLog(prev => {
      const n = { ...prev };
      if (n[key]) delete n[key]; else n[key] = true;
      return n;
    });
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits(prev => [...prev, { id: uid(), name: newName.trim(), emoji: newEmoji, color: newColor }]);
    setNewName(''); setNewEmoji('✨'); setShowAdd(false);
  };

  const removeHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));

  const getHabitCount = (habitId) => {
    let c = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}_${habitId}`;
      if (habitLog[key]) c++;
    }
    return c;
  };

  const getStreak = (habitId) => {
    let streak = 0;
    let d = new Date(today);
    while (true) {
      const ds = formatDate(d);
      if (habitLog[`${ds}_${habitId}`]) { streak++; d.setDate(d.getDate() - 1); }
      else if (ds === todayStr) { d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  // Heatmap: last 16 weeks
  const getHeatmapData = (habitId) => {
    const weeks = [];
    const d = new Date(today);
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1)); // start of this week (Monday)
    d.setDate(d.getDate() - 15 * 7); // go back 15 weeks
    for (let w = 0; w < 16; w++) {
      const week = [];
      for (let day = 0; day < 7; day++) {
        const ds = formatDate(d);
        const done = !!habitLog[`${ds}_${habitId}`];
        const isFuture = d > today;
        week.push({ date: ds, done, isFuture });
        d.setDate(d.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const activeDays = Math.min(daysInMonth, viewMonth === today.getMonth() && viewYear === today.getFullYear() ? today.getDate() : daysInMonth);

  const emojis = ['✨','💪','📖','🧘','💧','🥗','🏃','💤','📝','🎯','🎵','💻','🧠','☀️','🫀','💊'];

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Habit Tracker</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
            {['grid', 'heatmap'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === v ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500'}`}>
                {v === 'grid' ? 'Grid' : 'Heatmap'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">
            <Plus size={16} /> Habit
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }}
          className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors">‹</button>
        <span className="text-sm font-bold text-surface-900 dark:text-surface-200 min-w-[100px] text-center">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }}
          className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors">›</button>
      </div>

      {view === 'grid' ? (
        /* ── Grid View ── */
        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: Math.max(500, 140 + daysInMonth * 28) }}>
            {/* Day numbers */}
            <div className="flex gap-0.5 mb-1" style={{ paddingLeft: 140 }}>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                const isToday = ds === todayStr;
                return (
                  <div key={i} className={`w-6 text-center text-[10px] font-medium ${isToday ? 'text-brand-500 font-bold' : 'text-surface-400'}`}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
            {/* Habit rows */}
            {habits.map(h => {
              const count = getHabitCount(h.id);
              const stk = getStreak(h.id);
              return (
                <div key={h.id} className="flex items-center gap-0.5 mb-1">
                  <div className="w-[140px] flex items-center gap-2 pr-2 flex-shrink-0">
                    <span className="text-base">{h.emoji}</span>
                    <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 truncate flex-1">{h.name}</span>
                    {stk > 0 && <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5"><Flame size={10}/>{stk}</span>}
                  </div>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                    const key = `${ds}_${h.id}`;
                    const done = !!habitLog[key];
                    const isToday = ds === todayStr;
                    const isFuture = new Date(viewYear, viewMonth, i + 1) > today;
                    return (
                      <button key={i} onClick={() => !isFuture && toggleHabit(h.id, i + 1)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-all flex-shrink-0
                          ${isFuture ? 'opacity-20 cursor-default' : 'cursor-pointer hover:scale-110'}
                          ${isToday && !done ? 'ring-1.5 ring-brand-500/40' : ''}`}
                        style={{ background: done ? h.color : isToday ? `${h.color}20` : 'rgba(127,127,127,0.08)' }}>
                        {done && <span className="text-white font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Heatmap View ── */
        <div className="flex flex-col gap-6">
          {habits.map(h => {
            const weeks = getHeatmapData(h.id);
            const stk = getStreak(h.id);
            return (
              <div key={h.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{h.emoji}</span>
                  <span className="text-sm font-bold text-surface-900 dark:text-surface-200">{h.name}</span>
                  {stk > 0 && <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><Flame size={12}/>{stk}d</span>}
                </div>
                <div className="flex gap-1">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((day, di) => (
                        <div key={di} title={day.date}
                          className="w-3.5 h-3.5 rounded-sm heatmap-cell transition-all"
                          style={{
                            background: day.isFuture ? 'transparent' : day.done ? h.color : 'rgba(127,127,127,0.1)',
                            opacity: day.isFuture ? 0.15 : 1
                          }} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-surface-400">Minder</span>
                  <div className="flex gap-0.5">
                    {[0.1, 0.3, 0.6, 1].map((op, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: h.color, opacity: op }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-surface-400">Meer</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
        {habits.map(h => {
          const count = getHabitCount(h.id);
          const pct = activeDays ? Math.round(count / activeDays * 100) : 0;
          return (
            <div key={h.id} className="p-3 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">{h.emoji} <span className="font-semibold text-surface-900 dark:text-surface-200">{h.name}</span></span>
                <button onClick={() => removeHabit(h.id)} className="text-surface-300 dark:text-surface-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
              <div className="text-xl font-extrabold" style={{ color: h.color }}>{pct}%</div>
              <div className="h-1 rounded bg-surface-100 dark:bg-surface-700/50 mt-2 overflow-hidden">
                <div className="h-full rounded transition-all duration-700" style={{ width: `${pct}%`, background: h.color }} />
              </div>
              <div className="text-[11px] text-surface-400 mt-1.5">{count}/{activeDays} dagen</div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nieuwe Habit">
        <div className="flex flex-col gap-4">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Habit naam..."
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          <div>
            <label className="text-xs font-medium text-surface-500 mb-2 block">Emoji</label>
            <div className="flex flex-wrap gap-1.5">
              {emojis.map(e => (
                <button key={e} onClick={() => setNewEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all
                    ${newEmoji === e ? 'ring-2 ring-brand-500 bg-brand-500/10' : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 mb-2 block">Kleur</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-800 scale-110' : 'hover:scale-110'}`}
                  style={{ background: c, ringColor: c }} />
              ))}
            </div>
          </div>
          <button onClick={addHabit} className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors mt-1">Toevoegen</button>
        </div>
      </Modal>
    </div>
  );
}
