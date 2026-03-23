import React, { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { Modal, Dropdown, Badge, ProgressBar, EmptyState } from './UI';
import { uid, GOAL_CATEGORIES, COLORS, relativeDate } from '../utils/helpers';

export default function Goals({ goals, setGoals }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Persoonlijk', deadline: '', type: 'short', color: COLORS[0] });
  const [filter, setFilter] = useState('all'); // all | short | long

  const resetForm = () => setForm({ title: '', category: 'Persoonlijk', deadline: '', type: 'short', color: COLORS[0] });

  const addGoal = () => {
    if (!form.title.trim()) return;
    setGoals(prev => [...prev, { id: uid(), ...form, progress: 0 }]);
    setShowAdd(false); resetForm();
  };

  const updateProgress = (id, delta) => setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: Math.max(0, Math.min(100, g.progress + delta)) } : g));
  const removeGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  const filtered = goals.filter(g => filter === 'all' || g.type === filter);
  const avgProgress = filtered.length ? Math.round(filtered.reduce((s, g) => s + g.progress, 0) / filtered.length) : 0;

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Goals</h2>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors">
          <Plus size={16} /> Goal
        </button>
      </div>

      {/* Overview stat */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/15 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-surface-500">Gemiddelde voortgang</span>
          <span className="text-lg font-extrabold text-purple-500">{avgProgress}%</span>
        </div>
        <ProgressBar value={avgProgress} color="#8B5CF6" height={8} />
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-5 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
        {[{ id: 'all', label: 'Alles' }, { id: 'short', label: 'Korte termijn' }, { id: 'long', label: 'Lange termijn' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all
              ${filter === f.id ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Goals list */}
      <div className="flex flex-col gap-3">
        {filtered.map(g => (
          <div key={g.id} className="p-5 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">{g.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={g.color}>{g.category}</Badge>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700/50 text-surface-400 font-medium">
                    {g.type === 'short' ? 'Kort' : 'Lang'}
                  </span>
                  {g.deadline && <span className="text-xs text-surface-400">🎯 {relativeDate(g.deadline)}</span>}
                </div>
              </div>
              <button onClick={() => removeGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <ProgressBar value={g.progress} color={g.color} height={10} className="flex-1" />
              <span className="text-sm font-extrabold min-w-[40px] text-right" style={{ color: g.color }}>{g.progress}%</span>
            </div>

            <div className="flex gap-1.5">
              {[-10, -5, 5, 10].map(d => (
                <button key={d} onClick={() => updateProgress(g.id, d)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all
                    ${d > 0
                      ? 'border-transparent text-white hover:opacity-80'
                      : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'}`}
                  style={d > 0 ? { background: g.color } : {}}>
                  {d > 0 ? `+${d}%` : `${d}%`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon="🎯" title="Geen goals" subtitle="Stel je eerste doel" />}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nieuw Goal">
        <div className="flex flex-col gap-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Wat wil je bereiken?"
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <Dropdown value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={GOAL_CATEGORIES} placeholder="Categorie" />
          <Dropdown value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={['short', 'long']} placeholder="Type" />
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 outline-none focus:border-brand-500 [color-scheme:dark]" />
          <div>
            <label className="text-xs font-medium text-surface-500 mb-2 block">Kleur</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-800 scale-110' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <button onClick={addGoal} className="w-full py-2.5 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors">Toevoegen</button>
        </div>
      </Modal>
    </div>
  );
}
