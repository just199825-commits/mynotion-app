import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Clock, Calendar, GripVertical, LayoutGrid, List, Columns3 } from 'lucide-react';
import { Modal, Dropdown, Badge, SearchInput, EmptyState } from './UI';
import { uid, todayStr, AREAS, PRIORITIES, TASK_STATUSES, PRIORITY_COLORS, isOverdue, relativeDate } from '../utils/helpers';

export default function TaskManager({ tasks, setTasks, projects }) {
  const [view, setView] = useState('list'); // list | kanban
  const [filterArea, setFilterArea] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Form state
  const [form, setForm] = useState({ title: '', area: 'Werk', priority: 'Medium', status: 'To Do', deadline: '', project: '', timeEstimate: '', recurring: '', subtasks: [] });
  const [newSubtask, setNewSubtask] = useState('');

  const resetForm = () => setForm({ title: '', area: 'Werk', priority: 'Medium', status: 'To Do', deadline: '', project: '', timeEstimate: '', recurring: '', subtasks: [] });

  const openAdd = () => { resetForm(); setEditTask(null); setShowAdd(true); };
  const openEdit = (t) => {
    setForm({ title: t.title, area: t.area, priority: t.priority, status: t.status, deadline: t.deadline || '', project: t.project || '', timeEstimate: t.timeEstimate || '', recurring: t.recurring || '', subtasks: t.subtasks || [] });
    setEditTask(t.id); setShowAdd(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask ? { ...t, ...form, timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : 0 } : t));
    } else {
      setTasks(prev => [...prev, { id: uid(), ...form, timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : 0, createdAt: todayStr }]);
    }
    setShowAdd(false); resetForm(); setEditTask(null);
  };

  const toggleDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'Afgerond' ? 'To Do' : 'Afgerond' } : t));
  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  const toggleSubtask = (taskId, subId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t));
  const addSubtask = () => { if (!newSubtask.trim()) return; setForm(f => ({ ...f, subtasks: [...f.subtasks, { id: uid(), text: newSubtask.trim(), done: false }] })); setNewSubtask(''); };
  const removeSubtask = (subId) => setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== subId) }));
  const moveTask = (id, newStatus) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

  // Filter & sort
  const filtered = tasks.filter(t => {
    if (filterArea && t.area !== filterArea) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterProject && t.project !== filterProject) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'Afgerond' && b.status !== 'Afgerond') return 1;
    if (b.status === 'Afgerond' && a.status !== 'Afgerond') return -1;
    const p = { Hoog: 0, Medium: 1, Laag: 2 };
    return p[a.priority] - p[b.priority];
  });

  const projectMap = {};
  projects.forEach(p => { projectMap[p.id] = p; });

  const TaskCard = ({ t, compact }) => {
    const proj = t.project ? projectMap[t.project] : null;
    const done = t.status === 'Afgerond';
    const subtasksDone = t.subtasks?.filter(s => s.done).length || 0;
    const subtasksTotal = t.subtasks?.length || 0;

    return (
      <div className={`group p-3 rounded-xl border transition-all ${done ? 'opacity-50' : 'hover:border-surface-300 dark:hover:border-surface-600'}
        border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30`}>
        <div className="flex items-start gap-2.5">
          <button onClick={() => toggleDone(t.id)}
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
              ${done ? 'bg-green-500 border-green-500' : `border-surface-300 dark:border-surface-600 hover:border-brand-500`}`}>
            {done && <span className="text-white text-[10px] font-bold">✓</span>}
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={() => openEdit(t)} className={`text-sm font-semibold text-left w-full truncate transition-colors
              ${done ? 'line-through text-surface-400' : 'text-surface-900 dark:text-surface-100 hover:text-brand-500'}`}>
              {t.title}
            </button>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge color={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
              {t.area && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700/50 text-surface-500 font-medium">{t.area}</span>}
              {proj && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${proj.color}15`, color: proj.color }}>{proj.name}</span>}
              {t.deadline && (
                <span className={`text-[10px] font-medium ${isOverdue(t.deadline) && !done ? 'text-red-500' : 'text-surface-400'}`}>
                  📅 {relativeDate(t.deadline)}
                </span>
              )}
              {t.timeEstimate > 0 && <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Clock size={10}/>{t.timeEstimate}m</span>}
              {t.recurring && <span className="text-[10px] text-purple-400">🔄 {t.recurring}</span>}
              {subtasksTotal > 0 && <span className="text-[10px] text-surface-400">{subtasksDone}/{subtasksTotal} subtaken</span>}
            </div>
            {/* Inline subtasks */}
            {subtasksTotal > 0 && !compact && (
              <div className="mt-2 flex flex-col gap-1">
                {t.subtasks.map(s => (
                  <button key={s.id} onClick={() => toggleSubtask(t.id, s.id)} className="flex items-center gap-2 text-xs group/sub">
                    <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center
                      ${s.done ? 'bg-green-500 border-green-500' : 'border-surface-300 dark:border-surface-600'}`}>
                      {s.done && <span className="text-white text-[8px]">✓</span>}
                    </span>
                    <span className={`${s.done ? 'line-through text-surface-400' : 'text-surface-600 dark:text-surface-400'}`}>{s.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 text-surface-300 dark:text-surface-600 hover:text-red-400 transition-all p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Taken</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
            {[{ v: 'list', icon: List }, { v: 'kanban', icon: Columns3 }].map(({ v, icon: Icon }) => (
              <button key={v} onClick={() => setView(v)}
                className={`p-1.5 rounded-md transition-all ${view === v ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-400'}`}>
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors">
            <Plus size={16} /> Taak
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Zoek taken..." />
        <Dropdown value={filterArea} onChange={v => setFilterArea(filterArea === v ? '' : v)} options={AREAS} placeholder="Gebied" className="min-w-[120px]" />
        <Dropdown value={filterPriority} onChange={v => setFilterPriority(filterPriority === v ? '' : v)} options={PRIORITIES} placeholder="Prioriteit" className="min-w-[110px]" />
        <Dropdown value={filterProject} onChange={v => setFilterProject(filterProject === v ? '' : v)}
          options={projects.map(p => p.id)} placeholder="Project" className="min-w-[120px]" />
        {(filterArea || filterPriority || filterProject || search) && (
          <button onClick={() => { setFilterArea(''); setFilterPriority(''); setFilterProject(''); setSearch(''); }}
            className="px-3 py-2 text-xs font-medium text-surface-500 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-surface-400 mb-3">{sorted.filter(t=>t.status!=='Afgerond').length} open · {sorted.filter(t=>t.status==='Afgerond').length} afgerond</p>

      {view === 'list' ? (
        /* ── List View ── */
        <div className="flex flex-col gap-2">
          {sorted.length === 0 && <EmptyState icon="📋" title="Geen taken gevonden" />}
          {sorted.map(t => <TaskCard key={t.id} t={t} />)}
        </div>
      ) : (
        /* ── Kanban View ── */
        <div className="grid grid-cols-4 gap-3">
          {TASK_STATUSES.map(status => {
            const columnTasks = sorted.filter(t => t.status === status);
            return (
              <div key={status} className="min-h-[200px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">{status}</span>
                  <span className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded-full">{columnTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {columnTasks.map(t => <TaskCard key={t.id} t={t} compact />)}
                  {columnTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-surface-300 dark:text-surface-600 border border-dashed border-surface-200 dark:border-surface-700 rounded-xl">
                      Sleep taken hierheen
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditTask(null); }} title={editTask ? 'Taak bewerken' : 'Nieuwe Taak'} wide>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Wat moet je doen?"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <Dropdown value={form.area} onChange={v => setForm(f => ({ ...f, area: v }))} options={AREAS} placeholder="Gebied" />
          <Dropdown value={form.priority} onChange={v => setForm(f => ({ ...f, priority: v }))} options={PRIORITIES} placeholder="Prioriteit" />
          <Dropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={TASK_STATUSES} placeholder="Status" />
          <Dropdown value={form.project || ''} onChange={v => setForm(f => ({ ...f, project: v }))} options={['', ...projects.map(p => p.id)]} placeholder="Project (optioneel)" />
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 outline-none focus:border-brand-500 [color-scheme:dark]" />
          <div className="flex gap-2">
            <input type="number" value={form.timeEstimate} onChange={e => setForm(f => ({ ...f, timeEstimate: e.target.value }))} placeholder="Min"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
            <Dropdown value={form.recurring} onChange={v => setForm(f => ({ ...f, recurring: form.recurring === v ? '' : v }))} options={['daily', 'weekly', 'monthly']} placeholder="Herhaling" className="flex-1" />
          </div>
          {/* Subtasks */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-surface-500 mb-2 block">Subtaken</label>
            <div className="flex flex-col gap-1.5 mb-2">
              {form.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${s.done ? 'bg-green-500 border-green-500' : 'border-surface-300 dark:border-surface-600'}`}>
                    {s.done && <span className="text-white text-[8px]">✓</span>}
                  </span>
                  <span className="flex-1">{s.text}</span>
                  <button onClick={() => removeSubtask(s.id)} className="text-surface-300 hover:text-red-400"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="Subtaak toevoegen..."
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
              <button onClick={addSubtask} className="px-3 py-2 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded-lg text-sm hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
                <Plus size={16}/>
              </button>
            </div>
          </div>
          <div className="col-span-2">
            <button onClick={saveTask} className="w-full py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors">
              {editTask ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
