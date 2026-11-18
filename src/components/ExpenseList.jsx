import React, { useState } from 'react';
import { Trash2, Search, Clock, CreditCard, Wallet } from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey } from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseList({
  expenses = [],
  currency = 'Rs.',
  onDeleteExpense,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const todayKey = getTodayDateKey();

  const filtered = expenses.filter((e) => {
    if (searchTerm.trim() && !e.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense?')) {
      sound.playClick();
      onDeleteExpense(id);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <span>Expenses Feed</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total: <strong className="text-slate-700 font-black">{formatCurrency(totalFilteredAmount, currency)}</strong>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* Expense List Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
          <Wallet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">No expenses recorded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Add an expense above to see it here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl ${catObj.color || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                    {catObj.label.slice(0, 1)}
                  </div>

                  <div>
                    <p className="font-extrabold text-slate-800 text-sm leading-snug">
                      {item.reason}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{item.time || 'Today'}</span>
                      <span>•</span>
                      {item.paymentMethod === 'card' ? (
                        <span className="font-bold text-blue-600">
                          💳 {item.bankName || 'Bank'}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600">
                          💵 Cash
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete */}
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm sm:text-base text-rose-600 tracking-tight">
                    - {formatCurrency(item.amount, currency)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
