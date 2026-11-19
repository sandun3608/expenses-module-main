import React, { useState } from 'react';
import { Trash2, Search, ArrowDownLeft, ArrowUpRight, Clock, Wallet, Landmark, HandCoins, Receipt, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey, formatDisplayDate } from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseList({
  expenses = [],
  inflows = [],
  currency = 'Rs.',
  onDeleteExpense,
  onDeleteInflow,
  onToggleSettledExpense,
  onOpenCalendar,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income' | 'loans'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today'
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

  // Filter feed
  const filtered = combinedFeed.filter((item) => {
    if (dateFilter === 'today' && item.date !== todayKey) return false;
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

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalInflows = inflows.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

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
          <h2 className="font-black text-slate-800 text-base sm:text-lg">
            Activity & Expenses Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spacious chronological transaction history
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

        {/* Search & Date Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reason or person..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-semibold text-slate-700"
            />
          </div>

          {/* Quick Date Filter Pill */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setDateFilter((prev) => (prev === 'all' ? 'today' : 'all'));
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
              dateFilter === 'today'
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Toggle between Today's transactions and All transactions"
          >
            <span>{dateFilter === 'today' ? 'Today Only' : 'All Dates'}</span>
          </button>

          {/* Open Calendar button */}
          {onOpenCalendar && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenCalendar();
              }}
              className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs active:scale-95 whitespace-nowrap"
              title="Open Day-by-Day Calendar View"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Spacious Feed Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
          <Wallet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">No transactions recorded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Expenses, loans, and received money will appear here cleanly</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isIncome = item.feedType === 'income';
            const isLoan = item.category === 'loan';
            const isBill = item.category === 'bills';
            const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition shadow-2xs gap-2 sm:gap-3"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
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
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : isLoan ? (
                      <HandCoins className="w-5 h-5 stroke-[2.2]" />
                    ) : isBill ? (
                      <Receipt className="w-5 h-5 stroke-[2.2]" />
                    ) : (
                      catObj.label.slice(0, 1)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug truncate">
                      {item.reason}
                    </p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-slate-600">
                        {item.date === todayKey ? 'Today' : formatDisplayDate(item.date)}
                      </span>
                      {item.time && <span>• {item.time}</span>}
                      <span>•</span>

                      {/* Source tag */}
                      {isIncome ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                          {item.destination === 'pocket' ? '💵 Cash Inflow' : `🏦 Bank: ${item.bankName || 'Deposit'}`}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md text-[10px]">
                          {item.paymentMethod === 'card' ? `💳 ${item.bankName || 'Bank'}` : '💵 Pocket Cash'}
                        </span>
                      )}

                      {/* Loan / Bill Person Name Badge */}
                      {item.recipientName && (
                        <span className="font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md text-[10.5px]">
                          👤 {item.recipientName}
                        </span>
                      )}

                      {/* Due Date Badge */}
                      {item.dueDate && (
                        <span className="font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md text-[10px]">
                          📅 Due: {item.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Settled Toggle, and Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  {/* Settled / Mark Paid Button for Loans and Bills */}
                  {(isLoan || isBill) && onToggleSettledExpense && (
                    <button
                      type="button"
                      onClick={() => onToggleSettledExpense(item.id)}
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-black transition flex items-center gap-1 active:scale-95 ${
                        item.isSettled
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                      title={item.isSettled ? 'Mark as Unsettled' : 'Mark as Settled / Paid'}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.isSettled ? 'Settled ✓' : 'Mark Settled'}</span>
                    </button>
                  )}

                  <span
                    className={`font-black text-sm sm:text-base tracking-tight ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(item.amount, currency)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
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
