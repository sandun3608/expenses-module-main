import React, { useState } from 'react';
import { Landmark, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { formatCurrency } from '../utils/storage';

export default function SetupBanks({ currency = 'Rs.', initialBanks, onBack, onComplete }) {
  const [banks, setBanks] = useState(
    initialBanks && initialBanks.length > 0 && initialBanks[0].name
      ? initialBanks.map((b) => ({ id: b.id, name: b.name, balance: b.balance }))
      : [{ id: 'bank-1', name: '', balance: '' }]
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
    setBanks([...banks, { id: `bank-${Date.now()}`, name: '', balance: '' }]);
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
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch {}
    onComplete(banks);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        
        {/* Simple Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Bank Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add your primary bank and starting balance
          </p>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white mb-5 shadow-lg shadow-blue-500/15 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-blue-200">
              Total Bank Balance
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
              {formatCurrency(totalBankBalance, currency)}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* Bank Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {banks.map((bank, idx) => (
            <div
              key={bank.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">
                  {idx === 0 ? 'Primary Bank' : `Bank #${idx + 1}`}
                </span>
                {banks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBank(idx)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={bank.name}
                  onChange={(e) => handleBankChange(idx, 'name', e.target.value)}
                  placeholder="Enter Bank Name"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={bank.balance}
                  onChange={(e) => handleBankChange(idx, 'balance', e.target.value)}
                  placeholder={`Starting Balance (${currency})`}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
                />
              </div>
            </div>
          ))}

          {/* Add Another Bank Button */}
          <button
            type="button"
            onClick={handleAddAnotherBank}
            className="w-full py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Bank (Optional)</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
