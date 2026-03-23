import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, ArrowLeft, Link2, StickyNote, Brain, ListTodo, X } from 'lucide-react';
import { Modal, Dropdown, Badge, EmptyState, ProgressBar } from './UI';
import { uid, todayStr, PROJECT_STATUSES, COLORS, PRIORITY_COLORS } from '../utils/helpers';

export default function Projects({ projects, setProjects, tasks, setTasks }) {
  const [activeProject, setActiveProject] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'Actief', color: COLORS[0] });
  const [newLink, setNewLink] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const resetForm = () => setForm({ name: '', description: '', status: 'Actief', color: COLORS[0] });

  const saveProject = () => {
    if (!form.name.trim()) return;
    if (activeProject && showAdd) {
      setProjects(prev => prev.map(p => p.id === activeProject ? { ...p, ...form } : p));
    } else {
      setProjects(prev => [...prev, { id: uid(), ...form, links: [], braindump: '', createdAt: todayStr }]);
    }
    setShowAdd(false); resetForm();
  };

  const removeProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.map(t => t.project === id ? { ...t, project: null } : t));
    setActiveProject(null);
  };

  const addLink = (projId) => {
    if (!newLink.trim()) return;
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, links: [...(p.links || []), newLink.trim()] } : p));
    setNewLink('');
  };

  const removeLink = (projId, idx) => {
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, links: p.links.filter((_, i) => i !== idx) } : p));
  };

  const updateBraindump = (projId, text) => {
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, braindump: text } : p));
  };

  const updateNotes = (projId, text) => {
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, notes: text } : p));
  };

  const project = projects.find(p => p.id === activeProject);
  const projectTasks = activeProject ? tasks.filter(t => t.project === activeProject) : [];
  const doneTasks = projectTasks.filter(t => t.status === 'Afgerond').length;
  const taskProgress = projectTasks.length ? Math.round(doneTasks / projectTasks.length * 100) : 0;

  // ── Project Detail View ──
  if (project) {
    return (
      <div className="animate-slide-right">
        <button onClick={() => setActiveProject(null)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors mb-4">
          <ArrowLeft size={16} /> Terug naar projecten
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: project.color }}>
              {project.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">{project.name}</h2>
              <Badge color={project.status === 'Actief' ? '#10B981' : project.status === 'On Hold' ? '#F59E0B' : '#64748B'}>{project.status}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setForm({ name: project.name, description: project.description || '', status: project.status, color: project.color }); setShowAdd(true); }}
              className="px-3 py-1.5 text-xs font-medium border border-surface-200 dark:border-surface-700 rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors">
              Bewerken
            </button>
            <button onClick={() => removeProject(project.id)}
              className="px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-900/30 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              Verwijderen
            </button>
          </div>
        </div>

        {project.description && <p className="text-sm text-surface-600 dark:text-surface-400 mb-5">{project.description}</p>}

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/30 border border-surface-100 dark:border-surface-700/50">
          <span className="text-sm text-surface-500">Voortgang</span>
          <ProgressBar value={taskProgress} color={project.color} className="flex-1" />
          <span className="text-sm font-bold" style={{ color: project.color }}>{taskProgress}%</span>
          <span className="text-xs text-surface-400">{doneTasks}/{projectTasks.length} taken</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
          {[
            { id: 'overview', label: 'Taken', icon: ListTodo },
            { id: 'notes', label: 'Notities', icon: StickyNote },
            { id: 'braindump', label: 'Braindump', icon: Brain },
            { id: 'links', label: 'Links', icon: Link2 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all flex-1 justify-center
                ${activeTab === tab.id ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="flex flex-col gap-2">
            {projectTasks.length === 0 && <EmptyState icon="📋" title="Nog geen taken" subtitle="Maak taken aan en koppel ze aan dit project" />}
            {projectTasks.map(t => (
              <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 ${t.status === 'Afgerond' ? 'opacity-50' : ''}`}>
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                  ${t.status === 'Afgerond' ? 'bg-green-500 border-green-500' : 'border-surface-300 dark:border-surface-600'}`}>
                  {t.status === 'Afgerond' && <span className="text-white text-[10px]">✓</span>}
                </span>
                <span className={`text-sm flex-1 ${t.status === 'Afgerond' ? 'line-through text-surface-400' : 'text-surface-900 dark:text-surface-200 font-medium'}`}>{t.title}</span>
                <Badge color={PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
                <span className="text-xs text-surface-400">{t.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <textarea value={project.notes || ''} onChange={e => updateNotes(project.id, e.target.value)}
            placeholder="Project notities..."
            className="w-full h-64 px-4 py-3 text-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 resize-none font-mono" />
        )}

        {activeTab === 'braindump' && (
          <div>
            <p className="text-xs text-surface-400 mb-2">Dump hier al je losse gedachten, ideeën en inspiratie voor dit project.</p>
            <textarea value={project.braindump || ''} onChange={e => updateBraindump(project.id, e.target.value)}
              placeholder="Stort hier je braindump... ✨"
              className="w-full h-64 px-4 py-3 text-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 resize-none" />
          </div>
        )}

        {activeTab === 'links' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://..."
                onKeyDown={e => e.key === 'Enter' && addLink(project.id)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
              <button onClick={() => addLink(project.id)} className="px-3 py-2 bg-surface-100 dark:bg-surface-700 rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(project.links || []).map((link, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50 group">
                  <ExternalLink size={14} className="text-surface-400 flex-shrink-0" />
                  <a href={link} target="_blank" rel="noopener" className="text-sm text-blue-500 hover:underline truncate flex-1">{link}</a>
                  <button onClick={() => removeLink(project.id, i)} className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(project.links || []).length === 0 && <p className="text-sm text-surface-400 text-center py-4">Nog geen links</p>}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Project bewerken">
          <div className="flex flex-col gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Project naam..."
              className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Beschrijving..." rows={3}
              className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 resize-none" />
            <Dropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={PROJECT_STATUSES} placeholder="Status" />
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-surface-800 scale-110' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
            <button onClick={saveProject} className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">Opslaan</button>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Project List View ──
  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Projecten</h2>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">
          <Plus size={16} /> Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.map(p => {
          const pTasks = tasks.filter(t => t.project === p.id);
          const pDone = pTasks.filter(t => t.status === 'Afgerond').length;
          const pProgress = pTasks.length ? Math.round(pDone / pTasks.length * 100) : 0;
          return (
            <button key={p.id} onClick={() => { setActiveProject(p.id); setActiveTab('overview'); }}
              className="text-left p-5 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 hover:border-surface-300 dark:hover:border-surface-600 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: p.color }}>
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 group-hover:text-brand-500 transition-colors truncate">{p.name}</h3>
                  <Badge color={p.status === 'Actief' ? '#10B981' : p.status === 'On Hold' ? '#F59E0B' : '#64748B'}>{p.status}</Badge>
                </div>
              </div>
              {p.description && <p className="text-xs text-surface-500 mb-3 line-clamp-2">{p.description}</p>}
              <ProgressBar value={pProgress} color={p.color} height={4} />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-surface-400">{pDone}/{pTasks.length} taken</span>
                <span className="text-[10px] font-bold" style={{ color: p.color }}>{pProgress}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {projects.length === 0 && <EmptyState icon="📁" title="Geen projecten" subtitle="Maak je eerste project aan" />}

      {/* Add Modal */}
      <Modal open={showAdd && !activeProject} onClose={() => setShowAdd(false)} title="Nieuw Project">
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Project naam..."
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Beschrijving..." rows={3}
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 resize-none" />
          <Dropdown value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={PROJECT_STATUSES} placeholder="Status" />
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
          <button onClick={saveProject} className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">Toevoegen</button>
        </div>
      </Modal>
    </div>
  );
}
