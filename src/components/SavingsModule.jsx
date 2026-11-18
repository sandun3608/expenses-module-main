import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Shield,
  Smartphone,
  Plane,
  Car,
  Home,
  Heart,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Trash2,
  Edit3,
  X,
  Wallet,
  Landmark,
  CheckCircle2,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { formatCurrency } from '../utils/storage';

const GOAL_ICONS = {
  Shield: Shield,
  Smartphone: Smartphone,
  Plane: Plane,
  Car: Car,
  Home: Home,
  Heart: Heart,
  PiggyBank: PiggyBank,
};

const COLOR_PRESETS = [
  'from-blue-600 to-indigo-600',
  'from-sky-500 to-teal-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-600 to-pink-600',
  'from-rose-500 to-red-600',
];

export default function SavingsModule({
  currency = 'Rs.',
  savingsGoals = [],
  banks = [],
  todayPocketRemaining = 0,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositToGoal,
  onWithdrawFromGoal,
}) {
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newInitial, setNewInitial] = useState('');
  const [newIcon, setNewIcon] = useState('PiggyBank');
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);
  const [newNote, setNewNote] = useState('');

  // Transfer modal state (Deposit or Withdraw)
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    goal: null,
    type: 'deposit', // 'deposit' or 'withdraw'
    amount: '',
    source: 'pocket', // 'pocket' or 'bank'
    selectedBankId: banks[0]?.id || '',
    error: '',
  });

  // Calculate totals
  const totalSaved = savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const targetVal = parseFloat(newTarget);
    const initialVal = parseFloat(newInitial) || 0;
    if (isNaN(targetVal) || targetVal <= 0) return;
    if (!newTitle.trim()) return;

    sound.playSuccess();
    onAddGoal({
      id: 'save-' + Date.now(),
      title: newTitle.trim(),
      targetAmount: targetVal,
      currentAmount: initialVal,
      icon: newIcon,
      color: newColor,
      note: newNote.trim(),
    });

    setNewTitle('');
    setNewTarget('');
    setNewInitial('');
    setNewNote('');
    setIsCreateOpen(false);
  };

  const openDepositModal = (goal) => {
    setTransferModal({
      isOpen: true,
      goal,
      type: 'deposit',
      amount: '',
      source: 'pocket',
      selectedBankId: banks[0]?.id || '',
      error: '',
    });
  };

  const openWithdrawModal = (goal) => {
    setTransferModal({
      isOpen: true,
      goal,
      type: 'withdraw',
      amount: '',
      source: 'pocket',
      selectedBankId: banks[0]?.id || '',
      error: '',
    });
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(transferModal.amount);
    const { goal, type, source, selectedBankId } = transferModal;

    if (isNaN(amt) || amt <= 0) {
      setTransferModal((prev) => ({ ...prev, error: 'Please enter a valid amount' }));
      return;
    }

    if (type === 'deposit') {
      // Validate source balance
      if (source === 'pocket' && amt > todayPocketRemaining) {
        setTransferModal((prev) => ({
          ...prev,
          error: `Exceeds today's pocket cash (${formatCurrency(todayPocketRemaining, currency)})`,
        }));
        return;
      }
      if (source === 'bank') {
        const bank = banks.find((b) => b.id === selectedBankId);
        if (bank && amt > bank.balance) {
          setTransferModal((prev) => ({
            ...prev,
            error: `Exceeds ${bank.name} balance (${formatCurrency(bank.balance, currency)})`,
          }));
          return;
        }
      }

      sound.playCash();
      onDepositToGoal({
        goalId: goal.id,
        amount: amt,
        source, // 'pocket' or 'bank'
        bankId: source === 'bank' ? selectedBankId : null,
      });

      // Check if this deposit completed the goal!
      if (goal.currentAmount + amt >= goal.targetAmount) {
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    } else {
      // Withdraw validation
      if (amt > goal.currentAmount) {
        setTransferModal((prev) => ({
          ...prev,
          error: `Cannot withdraw more than saved (${formatCurrency(goal.currentAmount, currency)})`,
        }));
        return;
      }

      sound.playCash();
      onWithdrawFromGoal({
        goalId: goal.id,
        amount: amt,
        destination: source, // 'pocket' or 'bank'
        bankId: source === 'bank' ? selectedBankId : null,
      });
    }

    setTransferModal({ isOpen: false, goal: null, type: 'deposit', amount: '', source: 'pocket', selectedBankId: '', error: '' });
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Header & Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 p-5 sm:p-7 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-200 text-xs font-bold uppercase tracking-wider mb-1">
              <PiggyBank className="w-4 h-4" />
              <span>Smart Savings & Piggy Vault</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatCurrency(totalSaved, currency)}
            </h2>
            <p className="text-xs text-sky-100/90 mt-1">
              Target: <strong className="text-white">{formatCurrency(totalTarget, currency)}</strong> ({overallPercent}% reached)
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-sky-50 text-blue-700 font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition self-start sm:self-center"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Overall Progress Meter */}
        <div className="mt-5 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-blue-100 font-semibold mb-1.5">
            <span>Overall Goals Completion</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-300 to-emerald-300 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Active Savings Goals List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <span>Your Savings Goals</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {savingsGoals.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400">Transfer from Pocket or Bank</span>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <PiggyBank className="w-10 h-10 mx-auto text-blue-400 mb-2" />
            <p className="font-bold text-slate-700 text-sm">No savings goals yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Start a new goal to stash away money for emergencies or dreams!</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const GoalIconComponent = GOAL_ICONS[goal.icon] || PiggyBank;
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isFinished = percent >= 100;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-blue-300 shadow-xl shadow-blue-500/5 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${goal.color || COLOR_PRESETS[0]} text-white flex items-center justify-center shadow-xs`}>
                          <GoalIconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                            {goal.title}
                          </h4>
                          {goal.note && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{goal.note}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${goal.title}" savings goal?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Numbers */}
                    <div className="my-3">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                          {formatCurrency(goal.currentAmount, currency)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          / {formatCurrency(goal.targetAmount, currency)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${goal.color || COLOR_PRESETS[0]}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold mt-1.5 text-slate-500">
                        <span>{percent}% Completed</span>
                        {isFinished && (
                          <span className="text-emerald-600 flex items-center gap-1 font-extrabold">
                            <Award className="w-3.5 h-3.5" /> Goal Reached!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Deposit & Withdraw) */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openDepositModal(goal)}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Deposit</span>
                    </button>

                    <button
                      onClick={() => openWithdrawModal(goal)}
                      disabled={goal.currentAmount <= 0}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Modal: Create New Goal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                  Create Savings Goal
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Goal Name / Purpose
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter goal name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Initial Deposit (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newInitial}
                    onChange={(e) => setNewInitial(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Choose Icon
                </label>
                <div className="flex gap-2">
                  {Object.keys(GOAL_ICONS).map((iconKey) => {
                    const Comp = GOAL_ICONS[iconKey];
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setNewIcon(iconKey)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                          newIcon === iconKey
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Comp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Preset Picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Color Theme
                </label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((grad, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewColor(grad)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-r ${grad} transition ${
                        newColor === grad ? 'ring-2 ring-blue-600 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Note / Deadline (optional)
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Optional note"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition active:scale-98"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Deposit or Withdraw Money */}
      {transferModal.isOpen && transferModal.goal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {transferModal.type === 'deposit' ? 'Deposit to' : 'Withdraw from'}{' '}
                  <span className="text-blue-600">{transferModal.goal.title}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Current saved: {formatCurrency(transferModal.goal.currentAmount, currency)}
                </p>
              </div>
              <button
                onClick={() => setTransferModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3.5">
              {/* Transfer Source / Destination Toggle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {transferModal.type === 'deposit' ? 'Fund From' : 'Transfer To'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferModal((prev) => ({ ...prev, source: 'pocket', error: '' }))}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      transferModal.source === 'pocket'
                        ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Pocket Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferModal((prev) => ({ ...prev, source: 'bank', error: '' }))}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      transferModal.source === 'bank'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Bank Balance</span>
                  </button>
                </div>
              </div>

              {/* If Bank selected, pick which bank */}
              {transferModal.source === 'bank' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Select Bank
                  </label>
                  <select
                    value={transferModal.selectedBankId}
                    onChange={(e) =>
                      setTransferModal((prev) => ({ ...prev, selectedBankId: e.target.value, error: '' }))
                    }
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({formatCurrency(b.balance, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={transferModal.amount}
                  onChange={(e) =>
                    setTransferModal((prev) => ({ ...prev, amount: e.target.value, error: '' }))
                  }
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-lg font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {transferModal.error && (
                <p className="text-xs text-rose-500 font-semibold">{transferModal.error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-98"
              >
                {transferModal.type === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
