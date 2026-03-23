import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, BarChart3 } from 'lucide-react';
import { Modal, Dropdown, EmptyState } from './UI';
import { uid, todayStr, MONTHS } from '../utils/helpers';

export default function Pomodoro({ pomodoro, setPomodoro, tasks, projects }) {
  const [mode, setMode] = useState('work'); // work | break
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoro.workMinutes * 60);
  const [linkedTask, setLinkedTask] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [workMin, setWorkMin] = useState(pomodoro.workMinutes);
  const [breakMin, setBreakMin] = useState(pomodoro.breakMinutes);
  const [view, setView] = useState('timer'); // timer | stats
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Log session if work mode
      if (mode === 'work') {
        const session = { id: uid(), date: todayStr, minutes: pomodoro.workMinutes, task: linkedTask || null, completedAt: new Date().toISOString() };
        setPomodoro(prev => ({ ...prev, sessions: [...prev.sessions, session] }));
      }
      // Switch mode
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(pomodoro.breakMinutes * 60);
      } else {
        setMode('work');
        setTimeLeft(pomodoro.workMinutes * 60);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => { setIsRunning(false); setTimeLeft(mode === 'work' ? pomodoro.workMinutes * 60 : pomodoro.breakMinutes * 60); };

  const saveSettings = () => {
    setPomodoro(prev => ({ ...prev, workMinutes: parseInt(workMin) || 25, breakMinutes: parseInt(breakMin) || 5 }));
    setTimeLeft((mode === 'work' ? parseInt(workMin) || 25 : parseInt(breakMin) || 5) * 60);
    setIsRunning(false);
    setShowSettings(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = mode === 'work' ? pomodoro.workMinutes * 60 : pomodoro.breakMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const dashoffset = circumference - (progress / 100) * circumference;

  // Stats
  const todaySessions = pomodoro.sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((s, sess) => s + sess.minutes, 0);
  const weekSessions = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const weekAgo = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return pomodoro.sessions.filter(s => s.date >= weekAgo);
  })();
  const weekMinutes = weekSessions.reduce((s, sess) => s + sess.minutes, 0);

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dayMin = pomodoro.sessions.filter(s => s.date === ds).reduce((s, sess) => s + sess.minutes, 0);
    return { day: ['Zo','Ma','Di','Wo','Do','Vr','Za'][d.getDay()], minutes: dayMin, date: ds };
  });
  const maxMin = Math.max(...last7Days.map(d => d.minutes), 1);

  const openTasks = tasks.filter(t => t.status !== 'Afgerond');

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Pomodoro</h2>
        <div className="flex gap-2">
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
            {[{ v: 'timer', label: 'Timer' }, { v: 'stats', label: 'Stats' }].map(({ v, label }) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                  ${view === v ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => { setWorkMin(pomodoro.workMinutes); setBreakMin(pomodoro.breakMinutes); setShowSettings(true); }}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {view === 'timer' ? (
        <div className="flex flex-col items-center">
          {/* Timer circle */}
          <div className="relative w-64 h-64 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r="120" fill="none" strokeWidth="6"
                className="stroke-surface-100 dark:stroke-surface-800" />
              <circle cx="130" cy="130" r="120" fill="none" strokeWidth="6"
                stroke={mode === 'work' ? '#E8563A' : '#10B981'}
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashoffset}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">{mode === 'work' ? 'Focus' : 'Pauze'}</span>
              <span className="text-5xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tighter font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={reset} className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-all">
              <RotateCcw size={20} />
            </button>
            <button onClick={toggle}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg
                ${mode === 'work' ? 'bg-brand-500 hover:bg-brand-600' : 'bg-green-500 hover:bg-green-600'}`}>
              {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
            </button>
            <div className="w-12 h-12" /> {/* spacer */}
          </div>

          {/* Link to task */}
          <div className="w-full max-w-sm">
            <Dropdown value={linkedTask} onChange={setLinkedTask}
              options={['', ...openTasks.map(t => t.id)]}
              placeholder="Koppel aan taak (optioneel)" />
            {linkedTask && (
              <p className="text-xs text-surface-400 mt-1 text-center">
                Werken aan: {openTasks.find(t => t.id === linkedTask)?.title}
              </p>
            )}
          </div>

          {/* Today stats */}
          <div className="flex gap-6 mt-8 text-center">
            <div>
              <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{todaySessions.length}</div>
              <div className="text-xs text-surface-400">Sessies vandaag</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-brand-500">{todayMinutes}m</div>
              <div className="text-xs text-surface-400">Focus vandaag</div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Stats View ── */
        <div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
              <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{todayMinutes}m</div>
              <div className="text-xs text-surface-400 mt-1">Vandaag</div>
            </div>
            <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
              <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{weekMinutes}m</div>
              <div className="text-xs text-surface-400 mt-1">Deze week</div>
            </div>
            <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
              <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{todaySessions.length}</div>
              <div className="text-xs text-surface-400 mt-1">Sessies vandaag</div>
            </div>
            <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
              <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100">{weekSessions.length}</div>
              <div className="text-xs text-surface-400 mt-1">Sessies week</div>
            </div>
          </div>

          {/* Bar chart */}
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Afgelopen 7 dagen</h3>
          <div className="flex items-end gap-2 h-40 p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30">
            {last7Days.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] font-bold text-brand-500">{d.minutes > 0 ? `${d.minutes}m` : ''}</span>
                <div className="w-full rounded-t-md bg-brand-500/80 transition-all duration-500" style={{ height: `${Math.max(2, (d.minutes / maxMin) * 100)}%` }} />
                <span className={`text-[10px] font-medium ${d.date === todayStr ? 'text-brand-500' : 'text-surface-400'}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Timer instellingen">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Focus tijd (minuten)</label>
            <input type="number" value={workMin} onChange={e => setWorkMin(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1 block">Pauze tijd (minuten)</label>
            <input type="number" value={breakMin} onChange={e => setBreakMin(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 outline-none focus:border-brand-500" />
          </div>
          <button onClick={saveSettings} className="w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors">Opslaan</button>
        </div>
      </Modal>
    </div>
  );
}
