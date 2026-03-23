import React from 'react';
import { Home, CheckCircle2, ListTodo, FolderKanban, FileText, Target, Timer, Wallet, BookHeart, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'habits', label: 'Habits', icon: CheckCircle2 },
  { id: 'tasks', label: 'Taken', icon: ListTodo },
  { id: 'projects', label: 'Projecten', icon: FolderKanban },
  { id: 'notes', label: 'Notities', icon: FileText },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'journal', label: 'Journal', icon: BookHeart },
];

export default function Sidebar({ page, setPage, dark, setDark, collapsed, setCollapsed }) {
  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r transition-all duration-300
      ${collapsed ? 'w-[68px]' : 'w-[220px]'}
      bg-white dark:bg-surface-950 border-surface-100 dark:border-surface-800`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 pt-5 pb-4 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
          N
        </div>
        {!collapsed && <span className="text-base font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">MyNotion</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map(item => {
          const active = page === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${collapsed ? 'justify-center' : ''}
                ${active
                  ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
                }`}
              title={collapsed ? item.label : undefined}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 flex flex-col gap-1">
        <button onClick={() => setDark(!dark)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sidebar uitklappen' : 'Sidebar inklappen'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Inklappen</span>}
        </button>
      </div>
    </aside>
  );
}
