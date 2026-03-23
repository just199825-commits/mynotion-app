import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Pin, PinOff, Search, X, Eye, Edit3 } from 'lucide-react';
import { Modal, SearchInput, EmptyState } from './UI';
import { uid, todayStr } from '../utils/helpers';
import { marked } from 'marked';

export default function Notes({ notes, setNotes }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [preview, setPreview] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);

  const allTags = useMemo(() => {
    const t = new Set();
    notes.forEach(n => n.tags?.forEach(tag => t.add(tag)));
    return [...t].sort();
  }, [notes]);

  const openAdd = () => { setEditId(null); setTitle(''); setContent(''); setTags(''); setPreview(false); setShowAdd(true); };
  const openEdit = (n) => { setEditId(n.id); setTitle(n.title); setContent(n.content); setTags((n.tags || []).join(', ')); setPreview(false); setShowAdd(true); };

  const saveNote = () => {
    if (!title.trim() && !content.trim()) return;
    const tagArr = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (editId) {
      setNotes(prev => prev.map(n => n.id === editId ? { ...n, title: title.trim(), content, tags: tagArr, updatedAt: todayStr } : n));
    } else {
      setNotes(prev => [{ id: uid(), title: title.trim(), content, tags: tagArr, pinned: false, createdAt: todayStr, updatedAt: todayStr }, ...prev]);
    }
    setShowAdd(false);
  };

  const togglePin = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const removeNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const filtered = notes.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !(n.tags || []).includes(filterTag)) return false;
    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const renderMarkdown = (md) => {
    try {
      return { __html: marked.parse(md || '', { breaks: true }) };
    } catch {
      return { __html: md };
    }
  };

  // Expanded note view
  if (expandedNote) {
    const note = notes.find(n => n.id === expandedNote);
    if (!note) { setExpandedNote(null); return null; }
    return (
      <div className="animate-slide-right">
        <button onClick={() => setExpandedNote(null)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors mb-4">
          ← Terug
        </button>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">{note.title || 'Geen titel'}</h2>
          <div className="flex gap-2">
            <button onClick={() => { openEdit(note); setExpandedNote(null); }} className="p-2 rounded-lg text-surface-400 hover:text-brand-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
              <Edit3 size={16} />
            </button>
            <button onClick={() => togglePin(note.id)} className="p-2 rounded-lg text-surface-400 hover:text-amber-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
              {note.pinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
          </div>
        </div>
        {(note.tags || []).length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {note.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-medium">#{t}</span>
            ))}
          </div>
        )}
        <div className="prose-sm markdown-content text-surface-700 dark:text-surface-300" dangerouslySetInnerHTML={renderMarkdown(note.content)} />
        <p className="text-[10px] text-surface-400 mt-6">{note.updatedAt || note.createdAt}</p>
      </div>
    );
  }

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Notities</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
          <Plus size={16} /> Notitie
        </button>
      </div>

      {/* Search & Tags */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Zoek in notities..." />
        {allTags.length > 0 && (
          <div className="flex gap-1.5 items-center flex-wrap">
            {allTags.map(t => (
              <button key={t} onClick={() => setFilterTag(filterTag === t ? '' : t)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all
                  ${filterTag === t ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'}`}>
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(n => (
          <button key={n.id} onClick={() => setExpandedNote(n.id)}
            className="text-left p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 hover:border-surface-300 dark:hover:border-surface-600 transition-all group relative">
            {n.pinned && <Pin size={12} className="absolute top-3 right-3 text-amber-500" />}
            <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1.5 truncate pr-6">{n.title || 'Geen titel'}</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-3 mb-3">{n.content?.replace(/[#*_`\[\]]/g, '').slice(0, 150)}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(n.tags || []).slice(0, 3).map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700/50 text-surface-400">#{t}</span>
                ))}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <span onClick={(e) => { e.stopPropagation(); openEdit(n); }} className="p-1 rounded text-surface-400 hover:text-brand-500 cursor-pointer"><Edit3 size={12} /></span>
                <span onClick={(e) => { e.stopPropagation(); removeNote(n.id); }} className="p-1 rounded text-surface-400 hover:text-red-400 cursor-pointer"><Trash2 size={12} /></span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon="📝" title="Geen notities gevonden" subtitle={search ? 'Probeer een andere zoekterm' : 'Maak je eerste notitie'} />}

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editId ? 'Notitie bewerken' : 'Nieuwe Notitie'} wide>
        <div className="flex flex-col gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel..."
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-surface-500">Inhoud (markdown)</label>
              <button onClick={() => setPreview(!preview)} className="text-xs text-brand-500 flex items-center gap-1 hover:underline">
                {preview ? <><Edit3 size={12}/> Bewerken</> : <><Eye size={12}/> Preview</>}
              </button>
            </div>
            {preview ? (
              <div className="min-h-[200px] p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 markdown-content text-sm text-surface-700 dark:text-surface-300"
                dangerouslySetInnerHTML={renderMarkdown(content)} />
            ) : (
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Schrijf je notitie... (markdown ondersteund)" rows={8}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 resize-none font-mono" />
            )}
          </div>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (komma gescheiden, bijv: werk, ideeën)"
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <button onClick={saveNote} className="w-full py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">{editId ? 'Opslaan' : 'Toevoegen'}</button>
        </div>
      </Modal>
    </div>
  );
}
