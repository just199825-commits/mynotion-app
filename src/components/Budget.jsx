import React, { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Modal, Dropdown, ProgressBar, EmptyState } from './UI';
import { uid, todayStr, BUDGET_CATEGORIES, MONTHS, COLORS } from '../utils/helpers';

export default function Budget({ budget, setBudget }) {
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [txForm, setTxForm] = useState({ description: '', amount: '', type: 'expense', category: 'Overig', date: todayStr });
  const [goalForm, setGoalForm] = useState({ name: '', target: '', color: COLORS[0] });
  const [viewMonth, setViewMonth] = useState(todayStr.slice(0, 7)); // YYYY-MM

  const thisMonthTx = budget.transactions.filter(t => t.date.startsWith(viewMonth));
  const income = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  const balance = income - expenses;
  const budgetPct = budget.monthlyBudget ? Math.round(expenses / budget.monthlyBudget * 100) : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const cats = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [thisMonthTx]);
  const maxCat = categoryBreakdown.length ? categoryBreakdown[0][1] : 1;

  const catColors = {
    'Eten & Drinken': '#E8563A', 'Transport': '#3A8FE8', 'Wonen': '#8B5CF6', 'Abonnementen': '#EC4899',
    'Kleding': '#F59E0B', 'Entertainment': '#06B6D4', 'Gezondheid': '#10B981', 'Sparen': '#84CC16', 'Overig': '#64748B'
  };

  const addTransaction = () => {
    if (!txForm.description.trim() || !txForm.amount) return;
    const amount = txForm.type === 'expense' ? -Math.abs(parseFloat(txForm.amount)) : Math.abs(parseFloat(txForm.amount));
    setBudget(prev => ({ ...prev, transactions: [...prev.transactions, { id: uid(), ...txForm, amount }] }));
    setShowAddTx(false); setTxForm({ description: '', amount: '', type: 'expense', category: 'Overig', date: todayStr });
  };

  const removeTransaction = (id) => setBudget(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));

  const addSavingsGoal = () => {
    if (!goalForm.name.trim() || !goalForm.target) return;
    setBudget(prev => ({ ...prev, savingsGoals: [...prev.savingsGoals, { id: uid(), ...goalForm, target: parseFloat(goalForm.target), saved: 0 }] }));
    setShowAddGoal(false); setGoalForm({ name: '', target: '', color: COLORS[0] });
  };

  const updateSaved = (id, delta) => {
    setBudget(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => g.id === id ? { ...g, saved: Math.max(0, g.saved + delta) } : g)
    }));
  };

  const removeSavingsGoal = (id) => setBudget(prev => ({ ...prev, savingsGoals: prev.savingsGoals.filter(g => g.id !== id) }));

  const updateMonthlyBudget = (val) => setBudget(prev => ({ ...prev, monthlyBudget: parseFloat(val) || 0 }));

  // Month navigation
  const [yr, mn] = viewMonth.split('-').map(Number);
  const prevMonth = () => { if (mn === 1) setViewMonth(`${yr-1}-12`); else setViewMonth(`${yr}-${String(mn-1).padStart(2,'0')}`); };
  const nextMonth = () => { if (mn === 12) setViewMonth(`${yr+1}-01`); else setViewMonth(`${yr}-${String(mn+1).padStart(2,'0')}`); };

  return (
    <div className="animate-slide">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-surface-900 dark:text-surface-100 tracking-tight">Budget</h2>
        <button onClick={() => setShowAddTx(true)} className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">
          <Plus size={16} /> Transactie
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500">‹</button>
        <span className="text-sm font-bold text-surface-900 dark:text-surface-200 min-w-[100px] text-center">{MONTHS[mn-1]} {yr}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500">›</button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
          <ArrowUpRight size={16} className="text-green-500 mx-auto mb-1" />
          <div className="text-lg font-extrabold text-green-500">€{income.toFixed(0)}</div>
          <div className="text-[10px] text-surface-400">Inkomsten</div>
        </div>
        <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
          <ArrowDownRight size={16} className="text-red-400 mx-auto mb-1" />
          <div className="text-lg font-extrabold text-red-400">€{expenses.toFixed(0)}</div>
          <div className="text-[10px] text-surface-400">Uitgaven</div>
        </div>
        <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 text-center">
          <div className={`text-lg font-extrabold ${balance >= 0 ? 'text-green-500' : 'text-red-400'}`}>€{balance.toFixed(0)}</div>
          <div className="text-[10px] text-surface-400">Balans</div>
        </div>
      </div>

      {/* Budget progress */}
      <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-surface-500">Maandbudget</span>
          <input type="number" value={budget.monthlyBudget} onChange={e => updateMonthlyBudget(e.target.value)}
            className="w-24 text-right text-sm font-bold text-surface-900 dark:text-surface-200 bg-transparent outline-none" />
        </div>
        <ProgressBar value={budgetPct} color={budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#10b981'} height={8} />
        <p className="text-xs text-surface-400 mt-1.5">{budgetPct}% gebruikt · €{Math.max(0, budget.monthlyBudget - expenses).toFixed(0)} over</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div>
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Per categorie</h3>
          <div className="flex flex-col gap-2">
            {categoryBreakdown.map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: catColors[cat] || '#64748B' }} />
                <span className="text-xs text-surface-600 dark:text-surface-400 flex-1">{cat}</span>
                <div className="w-24 h-2 rounded bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <div className="h-full rounded transition-all" style={{ width: `${(amount / maxCat) * 100}%`, background: catColors[cat] || '#64748B' }} />
                </div>
                <span className="text-xs font-bold text-surface-900 dark:text-surface-200 w-16 text-right">€{amount.toFixed(0)}</span>
              </div>
            ))}
            {categoryBreakdown.length === 0 && <p className="text-xs text-surface-400 text-center py-4">Geen uitgaven</p>}
          </div>
        </div>

        {/* Savings goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Spaardoelen</h3>
            <button onClick={() => setShowAddGoal(true)} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              <Plus size={12} /> Doel
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {budget.savingsGoals.map(g => {
              const pct = g.target ? Math.round(g.saved / g.target * 100) : 0;
              return (
                <div key={g.id} className="p-3 rounded-xl border border-surface-100 dark:border-surface-700/50 bg-white dark:bg-surface-800/30 group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-surface-900 dark:text-surface-200 flex items-center gap-2">
                      <PiggyBank size={14} style={{ color: g.color }} /> {g.name}
                    </span>
                    <button onClick={() => removeSavingsGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <ProgressBar value={pct} color={g.color} className="flex-1" height={6} />
                    <span className="text-xs font-bold" style={{ color: g.color }}>{pct}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-surface-400">€{g.saved.toFixed(0)} / €{g.target.toFixed(0)}</span>
                    <div className="flex gap-1">
                      {[10, 50, 100].map(d => (
                        <button key={d} onClick={() => updateSaved(g.id, d)}
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white transition-all hover:opacity-80"
                          style={{ background: g.color }}>+€{d}</button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mt-6 mb-3">Transacties</h3>
      <div className="flex flex-col gap-1.5">
        {thisMonthTx.sort((a, b) => b.date.localeCompare(a.date)).map(t => (
          <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-400/10 text-red-400'}`}>
              {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-900 dark:text-surface-200 font-medium truncate">{t.description}</p>
              <p className="text-[10px] text-surface-400">{t.category} · {t.date}</p>
            </div>
            <span className={`text-sm font-bold ${t.amount >= 0 ? 'text-green-500' : 'text-red-400'}`}>
              {t.amount >= 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}
            </span>
            <button onClick={() => removeTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-400 transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {thisMonthTx.length === 0 && <EmptyState icon="💰" title="Geen transacties" subtitle="Voeg je eerste transactie toe" />}
      </div>

      {/* Add Transaction Modal */}
      <Modal open={showAddTx} onClose={() => setShowAddTx(false)} title="Nieuwe Transactie">
        <div className="flex flex-col gap-3">
          <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
            {['expense', 'income'].map(t => (
              <button key={t} onClick={() => setTxForm(f => ({ ...f, type: t }))}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all
                  ${txForm.type === t ? 'bg-white dark:bg-surface-700 shadow-sm' : ''}
                  ${txForm.type === t && t === 'expense' ? 'text-red-500' : txForm.type === t ? 'text-green-500' : 'text-surface-500'}`}>
                {t === 'expense' ? 'Uitgave' : 'Inkomst'}
              </button>
            ))}
          </div>
          <input value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} placeholder="Beschrijving..."
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <input type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} placeholder="Bedrag (€)"
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <Dropdown value={txForm.category} onChange={v => setTxForm(f => ({ ...f, category: v }))} options={BUDGET_CATEGORIES} placeholder="Categorie" />
          <input type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))}
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 outline-none [color-scheme:dark]" />
          <button onClick={addTransaction} className="w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">Toevoegen</button>
        </div>
      </Modal>

      {/* Add Savings Goal Modal */}
      <Modal open={showAddGoal} onClose={() => setShowAddGoal(false)} title="Nieuw Spaardoel">
        <div className="flex flex-col gap-3">
          <input value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))} placeholder="Waarvoor spaar je?"
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <input type="number" value={goalForm.target} onChange={e => setGoalForm(f => ({ ...f, target: e.target.value }))} placeholder="Doelbedrag (€)"
            className="px-3 py-2.5 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-surface-200 placeholder-surface-400 outline-none focus:border-brand-500" />
          <div className="flex gap-2">
            {COLORS.slice(0, 6).map(c => (
              <button key={c} onClick={() => setGoalForm(f => ({ ...f, color: c }))}
                className={`w-7 h-7 rounded-full transition-all ${goalForm.color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                style={{ background: c }} />
            ))}
          </div>
          <button onClick={addSavingsGoal} className="w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">Toevoegen</button>
        </div>
      </Modal>
    </div>
  );
}
