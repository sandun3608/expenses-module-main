import React, { useState } from 'react';
import { Trash2, Search, Filter, Clock, CreditCard, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey } from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseList({
  expenses = [],
  currency = 'Rs.',
  onDeleteExpense,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('all'); // 'all', 'cash', 'card'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('today'); // 'today', 'all'

  const todayKey = getTodayDateKey();

  const filtered = expenses.filter((e) => {
    // Search filter
    if (searchTerm.trim() && !e.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Payment method filter
    if (filterPayment !== 'all' && e.paymentMethod !== filterPayment) {
      return false;
    }
    // Category filter
    if (filterCategory !== 'all' && e.category !== filterCategory) {
      return false;
    }
    // Date filter
    if (filterDate === 'today' && e.date !== todayKey) {
      return false;
    }
    return true;
  });

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      sound.playClick();
      onDeleteExpense(id);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-500/5 border border-blue-100">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <span>Expenses Record</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total listed: <strong className="text-blue-700 font-extrabold">{formatCurrency(totalFilteredAmount, currency)}</strong>
          </p>
        </div>

        {/* Date scope pill toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterDate('today')}
            className={`px-3 py-1 rounded-lg transition ${
              filterDate === 'today' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Today Only
          </button>
          <button
            type="button"
            onClick={() => setFilterDate('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filterDate === 'all' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        {/* Search Input */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reasons..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        {/* Payment Filter */}
        <div className="flex gap-1.5">
          {['all', 'cash', 'card'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setFilterPayment(method)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition border ${
                filterPayment === method
                  ? 'bg-blue-50 text-blue-700 border-blue-400'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {method === 'all' ? 'All' : method === 'cash' ? '💵 Cash' : '💳 Card'}
            </button>
          ))}
        </div>

        {/* Category Filter Dropdown */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 outline-none font-medium"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">No expenses recorded yet</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {searchTerm || filterPayment !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first expense above to start tracking!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
            const isToday = item.date === todayKey;

            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-blue-200 shadow-2xs hover:shadow-xs transition"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${catObj.color || 'bg-blue-500'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                    {catObj.label.slice(0, 1)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                        {item.reason}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-md hidden sm:inline">
                        {catObj.label.split('&')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.time || 'Today'}</span>
                      </span>

                      {!isToday && (
                        <span>• {item.date}</span>
                      )}

                      <span>•</span>

                      {/* Payment source badge */}
                      {item.paymentMethod === 'card' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                          <CreditCard className="w-3 h-3" />
                          <span>{item.bankName || 'Bank Card'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Wallet className="w-3 h-3 text-emerald-600" />
                          <span>Pocket Cash</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-extrabold text-sm sm:text-base text-rose-600 tracking-tight">
                      - {formatCurrency(item.amount, currency)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
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
