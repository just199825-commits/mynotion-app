import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

// ── Modal ──
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div onClick={e => e.stopPropagation()} className={`relative bg-surface-800 dark:bg-surface-800 bg-white rounded-2xl p-6 w-full shadow-2xl border border-surface-700/50 dark:border-surface-700/50 border-surface-200 animate-scale ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700/50 text-surface-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Dropdown ──
export function Dropdown({ value, onChange, options, placeholder, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)} className={`w-full px-3 py-2 text-left text-sm rounded-lg border transition-all flex items-center justify-between gap-2
        ${open
          ? 'border-brand-500 ring-2 ring-brand-500/20'
          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}
        bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200`}>
        <span className={value ? '' : 'text-surface-400'}>{value || placeholder}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden z-50 shadow-xl animate-fade">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors
                ${value === opt ? 'bg-brand-500/10 text-brand-500 font-medium' : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Search Input ──
export function SearchInput({ value, onChange, placeholder = 'Zoeken...' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
    </div>
  );
}

// ── Tag/Badge ──
export function Badge({ children, color, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${className}`}
      style={{ background: `${color}20`, color }}>
      {children}
    </span>
  );
}

// ── Progress Bar ──
export function ProgressBar({ value, color = '#E8563A', height = 6, className = '' }) {
  return (
    <div className={`rounded-full overflow-hidden bg-surface-100 dark:bg-surface-700/50 ${className}`} style={{ height }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

// ── Empty State ──
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-surface-500 dark:text-surface-400 font-medium">{title}</p>
      {subtitle && <p className="text-surface-400 dark:text-surface-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Stat Card ──
export function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <button onClick={onClick} className="text-left p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 hover:border-surface-200 dark:hover:border-surface-600 transition-all group">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">{value}</div>
      <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-surface-400 dark:text-surface-500 mt-1">{sub}</div>}
    </button>
  );
}

// ── Confirm Dialog ──
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-surface-600 dark:text-surface-400 mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">Annuleren</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">Verwijderen</button>
      </div>
    </Modal>
  );
}
