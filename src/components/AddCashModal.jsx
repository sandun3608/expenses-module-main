import React, { useState } from 'react';
import { X, Wallet, Plus, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import { formatCurrency } from '../utils/storage';

export default function AddCashModal({
  isOpen,
  onClose,
  currency = 'Rs.',
  todayPocketRemaining = 0,
  onAddCash,
}) {
  if (!isOpen) return null;

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    sound.playCash();
    onAddCash({
      amount: val,
      note: note.trim() || 'Cash Received',
    });

    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg">
                Add Cash to Pocket
              </h3>
              <p className="text-[11px] text-slate-400">
                Received cash income or extra money
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Pocket Cash Banner */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500">Current Cash in Hand:</span>
          <span className="text-sm font-black text-slate-800">
            {formatCurrency(todayPocketRemaining, currency)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Cash Amount Received ({currency})
            </label>
            <input
              type="number"
              min="1"
              step="any"
              autoFocus
              required
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError('');
              }}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-xl font-black text-slate-800 outline-none text-center transition"
            />
            {error && <p className="text-xs text-rose-500 font-semibold mt-1 text-center">{error}</p>}
          </div>

          {/* Quick chips */}
          <div className="flex gap-2">
            {[500, 1000, 2000, 5000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(String(amt))}
                className="flex-1 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-bold text-xs border border-slate-200 transition"
              >
                +{amt}
              </button>
            ))}
          </div>

          {/* Note / Source */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Source / Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Returned money, Freelance, Gift"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add to Pocket Cash</span>
          </button>
        </form>

      </div>
    </div>
  );
}
