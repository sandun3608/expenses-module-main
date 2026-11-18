import React, { useState } from 'react';
import { Landmark, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { formatCurrency } from '../utils/storage';

const BANK_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-sky-600 to-cyan-700',
  'from-indigo-600 to-purple-700',
  'from-teal-600 to-emerald-700',
  'from-blue-500 to-sky-600',
];

export default function SetupBanks({ currency = 'Rs.', initialBanks, onBack, onComplete }) {
  // Start with 1 bank by default (Zero dummy text - user types their real bank)
  const [banks, setBanks] = useState(
    initialBanks && initialBanks.length > 0 && initialBanks[0].name
      ? initialBanks.map((b) => ({ id: b.id, name: b.name, balance: b.balance, color: b.color }))
      : [
          { id: 'bank-1', name: '', balance: '', color: BANK_GRADIENTS[0] },
        ]
  );

  const handleBankChange = (index, field, value) => {
    const updated = [...banks];
    if (field === 'balance') {
      const num = parseFloat(value);
      updated[index][field] = value === '' ? '' : isNaN(num) ? 0 : num;
    } else {
      updated[index][field] = value;
    }
    setBanks(updated);
  };

  const handleAddAnotherBank = () => {
    sound.playClick();
    const nextIdx = banks.length;
    const newBank = {
      id: `bank-${Date.now()}`,
      name: '',
      balance: '',
      color: BANK_GRADIENTS[nextIdx % BANK_GRADIENTS.length],
    };
    setBanks([...banks, newBank]);
  };

  const handleRemoveBank = (index) => {
    if (banks.length <= 1) return;
    sound.playClick();
    setBanks(banks.filter((_, idx) => idx !== index));
  };

  const totalBankBalance = banks.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onComplete(banks);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-3.5 sm:p-6">
      <div className="max-w-xl w-full">
        
        {/* Step Indicator & Header (New friendly title, not 'Add your bank account') */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Step 2 of 2: Money Spots & Vaults</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Connect Your <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">Main Bank Funds</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Start with 1 primary bank balance. You can add more banks anytime below if you want!
          </p>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white mb-5 shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-blue-200">
                Total Starting Bank Balance
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                {formatCurrency(totalBankBalance, currency)}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Landmark className="w-6 h-6 text-sky-200" />
            </div>
          </div>
        </div>

        {/* Banks Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {banks.map((bank, idx) => (
            <div
              key={bank.id}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${bank.color} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    {idx === 0 ? 'Primary Bank' : `Bank #${idx + 1}`}
                  </span>
                </div>

                {banks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBank(idx)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Remove this bank"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ONLY Bank Name and Starting Amount (NO card/account details as requested!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bank Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bank.name}
                    onChange={(e) => handleBankChange(idx, 'name', e.target.value)}
                    placeholder="Enter bank name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-800 outline-none transition"
                  />
                </div>

                {/* Starting Balance */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Starting Balance ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={bank.balance === 0 ? '' : bank.balance}
                    onChange={(e) => handleBankChange(idx, 'balance', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-bold text-slate-800 outline-none transition"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* "+ Add Another Bank" Button at bottom (User requirement!) */}
          <button
            type="button"
            onClick={handleAddAnotherBank}
            className="w-full py-2.5 px-4 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 border border-dashed border-blue-300 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Another Bank (Optional)</span>
          </button>

          {/* S1 Notice banner */}
          <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                Setup will complete automatically.
              </p>
              <p className="text-blue-700/80 mt-0.5 leading-relaxed">
                This setup screen won't show again. You can view, add more banks, and deposit money anytime from the <strong>S1 button</strong>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-98 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Save & Go to Pocket Money</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
