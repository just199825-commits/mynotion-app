import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Modal, EmptyState } from './UI';
import { uid, todayStr, MOODS, JOURNAL_PROMPTS, MONTHS, DAYS_FULL, today } from '../utils/helpers';

export default function Journal({ journal, setJournal }) {
  const [showAdd, setShowAdd] = useState(false);
  const [mood, setMood] = useState(3);
  const [entry, setEntry] = useState('');
  const [prompt, setPrompt] = useState('');
  const [editId, setEditId] = useState(null);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [expandedEntry, setExpandedEntry] = useState(null);

  const todayEntry = journal.find(j => j.date === todayStr);
  const moodColors = { 5: '#10B981', 4: '#34D399', 3: '#FBBF24', 2: '#F59E0B', 1: '#EF4444' };
  const moodEmoji = (val) => MOODS.find(m => m.value === Math.round(val))?.emoji || '😐';

  const randomPrompt = () => setPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);

  const openAdd = () => {
    if (todayEntry) { setEditId(todayEntry.id); setMood(todayEntry.mood); setEntry(todayEntry.entry); setPrompt(todayEntry.prompt || ''); }
    else { setEditId(null); setMood(3); setEntry(''); randomPrompt(); }
    setShowAdd(true);
  };

  const saveEntry = () => {
    if (editId) { setJournal(prev => prev.map(j => j.id === editId ? { ...j, mood, entry, prompt } : j)); }
    else { setJournal(prev => [...prev, { id: uid(), date: todayStr, mood, entry, prompt }]); }
    setShowAdd(false);
  };

  const monthEntries = journal.filter(j => { const [y, m] = j.date.split('-').map(Number); return y === viewYear && m === viewMonth + 1; }).sort((a, b) => b.date.localeCompare(a.date));
  const avgMood = monthEntries.length ? (monthEntries.reduce((s, j) => s + j.mood, 0) / monthEntries.length).toFixed(1) : '-';
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const getStreak = () => { let s = 0, d = new Date(today); while (true) { const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; if (journal.find(j => j.date === ds)) { s++; d.setDate(d.getDate() - 1); } else if (ds === todayStr) { d.setDate(d.getDate() - 1); } else break; } return s; };

  if (expandedEntry) {
    const e = journal.find(j => j.id === expandedEntry);
    if (!e) { setExpandedEntry(null); return null; }
    const d = new Date(e.date);
    return (
      <div className="animate-slide-right">
        <button onClick={() => setExpandedEntry(null)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 mb-4">← Terug</button>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-sm text-surface-400">{DAYS_FULL[d.getDay()]} · {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}</p>
          <div className="text-5xl mt-3 mb-2">{moodEmoji(e.mood)}</div>
          <p className="text-sm font-medium text-surface-500 mb-4">{MOODS.find(m => m.value === e.mood)?.label}</p>
          {e.prompt && (<div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 mb-4 text-left"><p className="text-xs text-brand-400 font-medium flex items-center gap-1 mb-1"><Sparkles size={12}/> Reflectievraag</p><p className="text-sm text-surface-600 dark:text-surface-400 italic">{e.prompt}</p></div>)}
          <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap text-left">{e.entry}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Journal</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600 transition-colors">
          <Plus size={16}/> {todayEntry ? 'Bewerk vandaag' : 'Schrijf vandaag'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
          <div className="text-3xl mb-1">{avgMood !== '-' ? moodEmoji(parseFloat(avgMood)) : '—'}</div>
          <div className="text-xs text-surface-400">Gem. mood</div>
        </div>
        <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
          <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{monthEntries.length}</div>
          <div className="text-xs text-surface-400">Entries</div>
        </div>
        <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
          <div className="text-2xl font-extrabold text-pink-500">{getStreak()}</div>
          <div className="text-xs text-surface-400">Streak</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={() => { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }} className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500"><ChevronLeft size={16}/></button>
        <span className="text-sm font-bold text-surface-900 dark:text-surface-200 min-w-[100px] text-center">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={() => { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }} className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500"><ChevronRight size={16}/></button>
      </div>

      <div className="flex gap-1 mb-6 justify-center flex-wrap">
        {Array.from({length:daysInMonth},(_,i)=>{
          const ds=`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
          const e=journal.find(j=>j.date===ds);
          return (<div key={i} title={`${i+1} ${MONTHS[viewMonth]}`} onClick={()=>e&&setExpandedEntry(e.id)}
            className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${e?'cursor-pointer hover:scale-110':''} ${ds===todayStr?'ring-1.5 ring-pink-500/40':''}`}
            style={{background:e?moodColors[e.mood]:'rgba(127,127,127,0.08)'}}>
            {e?<span>{moodEmoji(e.mood)}</span>:<span className="text-surface-400">{i+1}</span>}
          </div>);
        })}
      </div>

      <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Entries</h3>
      <div className="flex flex-col gap-2">
        {monthEntries.map(j=>{const d=new Date(j.date);return(
          <button key={j.id} onClick={()=>setExpandedEntry(j.id)} className="text-left p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 hover:border-surface-300 dark:hover:border-surface-600 transition-all">
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{moodEmoji(j.mood)}</span><div><p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{DAYS_FULL[d.getDay()]} {d.getDate()} {MONTHS[d.getMonth()]}</p><p className="text-[10px] text-surface-400">{MOODS.find(m=>m.value===j.mood)?.label}</p></div></div>
            <p className="text-xs text-surface-500 line-clamp-2">{j.entry}</p>
          </button>);})}
        {monthEntries.length===0&&<EmptyState icon="📓" title="Geen entries deze maand" subtitle="Begin met schrijven!"/>}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title={editId?'Entry bewerken':'Hoe was je dag?'} wide>
        <div className="flex flex-col gap-4">
          <div><label className="text-xs font-medium text-surface-500 mb-3 block">Hoe voel je je?</label>
            <div className="flex justify-center gap-3">{MOODS.map(m=>(<button key={m.value} onClick={()=>setMood(m.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${mood===m.value?'bg-pink-500/10 ring-2 ring-pink-500 scale-110':'hover:bg-surface-100 dark:hover:bg-surface-800 hover:scale-105'}`}>
              <span className="text-3xl">{m.emoji}</span><span className="text-[10px] font-medium text-surface-500">{m.label}</span></button>))}</div>
          </div>
          <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-brand-400 font-medium flex items-center gap-1"><Sparkles size={12}/> Reflectievraag</p><button onClick={randomPrompt} className="text-[10px] text-brand-500 hover:underline">Andere vraag</button></div>
            <p className="text-sm text-surface-600 dark:text-surface-400 italic">{prompt}</p>
          </div>
          <textarea value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Schrijf over je dag..." rows={6}
            className="w-full px-4 py-3 text-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-pink-500 resize-none leading-relaxed"/>
          <button onClick={saveEntry} className="w-full py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600 transition-colors">Opslaan</button>
        </div>
      </Modal>
    </div>
  );
}
