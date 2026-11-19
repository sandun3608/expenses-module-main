import React, { useState } from 'react';
import { Trash2, Search, ArrowDownLeft, ArrowUpRight, Clock, Wallet, Landmark, HandCoins, Receipt, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey, formatDisplayDate } from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseList({
  expenses = [],
  inflows = [],
  currency = 'Rs.',
  selectedDate = 'all',
  onSelectDate,
  onDeleteExpense,
  onDeleteInflow,
  onToggleSettledExpense,
  onOpenCalendar,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income' | 'loans'
  const todayKey = getTodayDateKey();

  // Combine expenses and inflows into a unified chronological feed
  const combinedFeed = [
    ...expenses.map((e) => ({
      ...e,
      feedType: 'expense',
    })),
    ...inflows.map((inf) => ({
      ...inf,
      feedType: 'income',
      reason: inf.note || (inf.destination === 'pocket' ? 'Cash Received' : 'Bank Deposit'),
      category: 'income',
    })),
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Filter feed by selectedDate (from calendar above) and filterType and search
  const filtered = combinedFeed.filter((item) => {
    if (selectedDate && selectedDate !== 'all' && item.date !== selectedDate) return false;
    if (filterType === 'expense' && item.feedType !== 'expense') return false;
    if (filterType === 'income' && item.feedType !== 'income') return false;
    if (filterType === 'loans' && !(item.category === 'loan' || item.category === 'bills')) return false;
    if (searchTerm.trim()) {
      const matchReason = item.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRecipient = item.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchReason && !matchRecipient) return false;
    }
    return true;
  });

  // Calculate totals for active filtered set
  const totalExpenses = filtered
    .filter((i) => i.feedType === 'expense')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalInflows = filtered
    .filter((i) => i.feedType === 'income')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const handleDelete = (item) => {
    if (item.feedType === 'income') {
      if (window.confirm('Delete this received money entry?')) {
        sound.playClick();
        onDeleteInflow(item.id);
      }
    } else {
      if (window.confirm('Delete this expense?')) {
        sound.playClick();
        onDeleteExpense(item.id);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      
      {/* 1. Header with Inflow vs Expense mini totals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-black text-slate-800 text-base sm:text-lg">
              {selectedDate === 'all'
                ? 'Activity & Expenses Feed'
                : `Feed: ${formatDisplayDate(selectedDate)}`}
            </h2>
            {selectedDate !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectDate && onSelectDate('all');
                }}
                className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 hover:bg-blue-100 flex items-center gap-1 transition active:scale-95"
                title="Clear date filter to show all history"
              >
                <span>Clear Date ✕</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedDate === 'all'
              ? 'Spacious chronological transaction history'
              : `Showing expenses recorded on ${formatDisplayDate(selectedDate)}`}
          </p>
        </div>

        {/* Mini stats pills */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            +{formatCurrency(totalInflows, currency)}
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
            -{formatCurrency(totalExpenses, currency)}
          </div>
        </div>
      </div>

      {/* 2. Filter Pills & Search */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterType === 'all'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterType === 'expense'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Expenses (-)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterType === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Received (+)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('loans')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterType === 'loans'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Loans & Bills 📑
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reason or person name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* 3. Spacious Feed Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
          <Wallet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-700">
            {selectedDate !== 'all'
              ? `No transactions on ${formatDisplayDate(selectedDate)}`
              : 'No transactions recorded yet'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {selectedDate !== 'all'
              ? 'No expenses or income recorded on this date.'
              : 'Expenses, loans, and received money will appear here cleanly'}
          </p>
          {selectedDate !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectDate && onSelectDate('all')}
              className="mt-3 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition active:scale-95 shadow-2xs"
            >
              Show All History Feed
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isIncome = item.feedType === 'income';
            const isLoan = item.category === 'loan';
            const isBill = item.category === 'bills';
            const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition shadow-2xs gap-2.5 sm:gap-3 group"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-700'
                        : isLoan
                        ? 'bg-amber-100 text-amber-700'
                        : isBill
                        ? 'bg-rose-100 text-rose-700'
                        : `${catObj.color || 'bg-blue-600'} text-white`
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                    ) : isLoan ? (
                      <HandCoins className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                    ) : isBill ? (
                      <Receipt className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                    ) : (
                      catObj.label.slice(0, 1)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-extrabold text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                        {item.reason}
                      </p>
                      {item.recipientName && (
                        <span className="font-bold text-[9.5px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md shrink-0">
                          👤 {item.recipientName}
                        </span>
                      )}
                      {isLoan && item.isSettled && (
                        <span className="font-bold text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md shrink-0">
                          Repaid ✓
                        </span>
                      )}
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[10.5px] text-slate-400 font-semibold mt-0.5 truncate">
                      <span>{item.date === todayKey ? (item.time || 'Today') : formatDisplayDate(item.date)}</span>
                      <span>•</span>
                      {isIncome ? (
                        <span className="text-emerald-700 font-bold">
                          {item.destination === 'pocket' ? '💵 Cash' : `🏦 ${item.bankName || 'Bank'}`}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-semibold">
                          {item.paymentMethod === 'card' ? `💳 ${item.bankName || 'Bank'}` : '💵 Cash'}
                        </span>
                      )}
                      {item.dueDate && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">Due: {item.dueDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Action Micro-Buttons */}
                <div className="flex flex-col items-end justify-center shrink-0 text-right pl-2">
                  <span
                    className={`font-black text-xs sm:text-sm tracking-tight leading-tight ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
                  </span>

                  <div className="flex items-center gap-1 mt-1">
                    {/* Settle / Repay Toggle for Loans & Bills */}
                    {(isLoan || isBill) && onToggleSettledExpense && (
                      <button
                        type="button"
                        onClick={() => onToggleSettledExpense(item.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                          item.isSettled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={item.isSettled ? 'Mark as Unsettled' : 'Mark as Settled / Paid'}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="w-5 h-5 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
