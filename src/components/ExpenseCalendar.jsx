import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Receipt,
  CheckCircle2,
  Trash2,
  Sparkles,
  Clock,
  TrendingDown,
  TrendingUp,
  X,
  User,
} from 'lucide-react';
import {
  CATEGORIES,
  formatCurrency,
  getTodayDateKey,
  formatDisplayDate,
} from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseCalendar({
  expenses = [],
  inflows = [],
  currency = 'Rs.',
  banks = [],
  frequentReasons = [],
  onAddExpense,
  onDeleteExpense,
  onDeleteInflow,
  onToggleSettledExpense,
  todayPocketRemaining = 0,
}) {
  const todayKey = getTodayDateKey();
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  // Month & Year state
  const todayDateObj = new Date();
  const [viewYear, setViewYear] = useState(todayDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDateObj.getMonth()); // 0 - 11

  // Modal to add expense for selected date
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState('');
  const [modalReason, setModalReason] = useState('');
  const [modalCategory, setModalCategory] = useState(CATEGORIES[0].id);
  const [modalPaymentMethod, setModalPaymentMethod] = useState('cash');
  const [modalBankId, setModalBankId] = useState(banks[0]?.id || '');
  const [modalRecipient, setModalRecipient] = useState('');
  const [modalDueDate, setModalDueDate] = useState('');

  // Month navigation helpers
  const handlePrevMonth = () => {
    sound.playClick();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    sound.playClick();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    sound.playClick();
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateKey(todayKey);
  };

  // Day navigation (Prev day / Next day)
  const handleStepDay = (step) => {
    sound.playClick();
    const parts = selectedDateKey.split('-');
    const current = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    current.setDate(current.getDate() + step);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const newKey = `${y}-${m}-${d}`;
    setSelectedDateKey(newKey);
    // sync month view if jumped outside current month view
    if (current.getFullYear() !== viewYear || current.getMonth() !== viewMonth) {
      setViewYear(current.getFullYear());
      setViewMonth(current.getMonth());
    }
  };

  // Map of daily totals for fast lookup: { 'YYYY-MM-DD': { spent: X, cash: Y, card: Z, inflows: W, count: C } }
  const dailyMetricsMap = useMemo(() => {
    const map = {};

    expenses.forEach((e) => {
      const date = e.date;
      if (!map[date]) {
        map[date] = { spent: 0, cash: 0, card: 0, inflows: 0, count: 0 };
      }
      const amt = Number(e.amount) || 0;
      map[date].spent += amt;
      map[date].count += 1;
      if (e.paymentMethod === 'card') {
        map[date].card += amt;
      } else {
        map[date].cash += amt;
      }
    });

    inflows.forEach((inf) => {
      const date = inf.date;
      if (!map[date]) {
        map[date] = { spent: 0, cash: 0, card: 0, inflows: 0, count: 0 };
      }
      map[date].inflows += Number(inf.amount) || 0;
    });

    return map;
  }, [expenses, inflows]);

  // Month Statistics
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthStats = useMemo(() => {
    let totalSpent = 0;
    let totalInflow = 0;
    let activeDays = 0;
    let highestDayAmount = 0;
    let highestDayDate = null;

    Object.entries(dailyMetricsMap).forEach(([date, data]) => {
      if (date.startsWith(monthPrefix)) {
        if (data.spent > 0) {
          totalSpent += data.spent;
          activeDays += 1;
          if (data.spent > highestDayAmount) {
            highestDayAmount = data.spent;
            highestDayDate = date;
          }
        }
        totalInflow += data.inflows;
      }
    });

    const dailyAvg = activeDays > 0 ? Math.round(totalSpent / activeDays) : 0;

    return {
      totalSpent,
      totalInflow,
      activeDays,
      dailyAvg,
      highestDayAmount,
      highestDayDate,
    };
  }, [dailyMetricsMap, monthPrefix]);

  // Calendar Grid Days Builder (Mon - Sun)
  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    // Monday as index 0:
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // 1. Prev month trailing days
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const key = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateKey: key,
        isCurrentMonth: false,
        metrics: dailyMetricsMap[key] || { spent: 0, cash: 0, card: 0, inflows: 0, count: 0 },
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateKey: key,
        isCurrentMonth: true,
        metrics: dailyMetricsMap[key] || { spent: 0, cash: 0, card: 0, inflows: 0, count: 0 },
      });
    }

    // 3. Next month leading days to complete grid rows
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const key = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNum,
        dateKey: key,
        isCurrentMonth: false,
        metrics: dailyMetricsMap[key] || { spent: 0, cash: 0, card: 0, inflows: 0, count: 0 },
      });
    }

    return cells;
  }, [viewYear, viewMonth, dailyMetricsMap]);

  // Selected Day Items
  const selectedDayExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === selectedDateKey);
  }, [expenses, selectedDateKey]);

  const selectedDayInflows = useMemo(() => {
    return inflows.filter((inf) => inf.date === selectedDateKey);
  }, [inflows, selectedDateKey]);

  const selectedDayMetrics = dailyMetricsMap[selectedDateKey] || {
    spent: 0,
    cash: 0,
    card: 0,
    inflows: 0,
    count: 0,
  };

  // Category breakdown for selected day
  const selectedDayCategoryBreakdown = useMemo(() => {
    const map = {};
    selectedDayExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    });
    return Object.entries(map).map(([catId, amount]) => {
      const catObj = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
      return { catId, label: catObj.label, color: catObj.color, amount };
    });
  }, [selectedDayExpenses]);

  // Handle Add Expense from Modal
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(modalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!modalReason.trim()) return;

    sound.playSuccess();

    const selectedBank = banks.find((b) => b.id === modalBankId) || banks[0];
    const isLoanOrBill = modalCategory === 'loan' || modalCategory === 'bills';

    onAddExpense({
      amount: parsedAmount,
      reason: modalReason.trim(),
      category: modalCategory,
      paymentMethod: modalPaymentMethod,
      bankId: modalPaymentMethod === 'card' ? selectedBank?.id : null,
      bankName: modalPaymentMethod === 'card' ? selectedBank?.name : null,
      recipientName: isLoanOrBill ? modalRecipient.trim() : null,
      dueDate: isLoanOrBill && modalDueDate ? modalDueDate : null,
      date: selectedDateKey,
    });

    setModalAmount('');
    setModalReason('');
    setModalRecipient('');
    setModalDueDate('');
    setIsAddModalOpen(false);
  };

  // Month Title Formatter
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      
      {/* 1. CALENDAR CARD */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        
        {/* Top Header: Month title, Controls, Jump Today */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base sm:text-lg leading-tight">
                {monthName}
              </h2>
              <p className="text-[10.5px] font-semibold text-slate-400">
                Expense Calendar & Day Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleJumpToToday}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition active:scale-95 ${
                selectedDateKey === todayKey && viewMonth === todayDateObj.getMonth() && viewYear === todayDateObj.getFullYear()
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Jump to today's date"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Month Summary Highlights Pills */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: Month Total Spent */}
          <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-100/90 text-center">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-600 flex items-center justify-center gap-1 mb-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>Month Spent</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-rose-950 truncate">
              {formatCurrency(monthStats.totalSpent, currency)}
            </p>
          </div>

          {/* Card 2: Daily Avg */}
          <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-100/90 text-center">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-600 flex items-center justify-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Daily Avg</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-blue-950 truncate">
              {formatCurrency(monthStats.dailyAvg, currency)}
            </p>
          </div>

          {/* Card 3: Active Days */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-100/90 text-center">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-600 flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Month Inflow</span>
            </span>
            <p className="text-xs sm:text-sm font-black text-emerald-950 truncate">
              +{formatCurrency(monthStats.totalInflow, currency)}
            </p>
          </div>
        </div>

        {/* 2. CALENDAR GRID */}
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, idx) => (
              <div
                key={d}
                className={`text-[10px] sm:text-[11px] font-black tracking-wider uppercase py-1 ${
                  idx >= 5 ? 'text-blue-500' : 'text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.dateKey === selectedDateKey;
              const isToday = cell.dateKey === todayKey;
              const hasExpenses = cell.metrics.spent > 0;
              const hasInflows = cell.metrics.inflows > 0;

              // Color dot coding for spending levels
              let spendDotColor = 'bg-emerald-500';
              if (cell.metrics.spent > 5000) {
                spendDotColor = 'bg-rose-500';
              } else if (cell.metrics.spent > 1000) {
                spendDotColor = 'bg-amber-500';
              }

              return (
                <button
                  key={`${cell.dateKey}-${idx}`}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedDateKey(cell.dateKey);
                  }}
                  className={`relative min-h-[52px] sm:min-h-[58px] p-1 rounded-2xl flex flex-col justify-between items-center transition-all duration-150 active:scale-95 text-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30 scale-[1.03] z-10'
                      : isToday
                      ? 'bg-blue-50/90 text-blue-900 border-2 border-blue-500 font-black'
                      : cell.isCurrentMonth
                      ? hasExpenses
                        ? 'bg-slate-50 hover:bg-blue-50/60 text-slate-800 border border-slate-200/70 font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
                      : 'bg-slate-50/40 text-slate-300 border border-transparent'
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-center w-full">
                    <span
                      className={`text-xs sm:text-[13px] leading-tight font-black ${
                        isSelected ? 'text-white' : ''
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                  </div>

                  {/* Indicators / Amounts */}
                  <div className="w-full flex flex-col items-center justify-end min-h-[18px]">
                    {hasExpenses ? (
                      <div className="w-full flex items-center justify-center gap-0.5">
                        <span
                          className={`text-[8.5px] sm:text-[9.5px] font-black truncate max-w-[42px] leading-tight ${
                            isSelected
                              ? 'text-white'
                              : cell.metrics.spent > 5000
                              ? 'text-rose-600 font-black'
                              : 'text-slate-600 font-extrabold'
                          }`}
                        >
                          {cell.metrics.spent >= 1000
                            ? `${(cell.metrics.spent / 1000).toFixed(cell.metrics.spent >= 10000 ? 0 : 1)}k`
                            : cell.metrics.spent}
                        </span>
                        {!isSelected && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${spendDotColor} shrink-0`}
                          />
                        )}
                      </div>
                    ) : hasInflows ? (
                      <div className="w-full flex items-center justify-center">
                        <span
                          className={`text-[9px] font-black ${
                            isSelected ? 'text-emerald-200' : 'text-emerald-600'
                          }`}
                        >
                          +{cell.metrics.inflows >= 1000 ? `${(cell.metrics.inflows / 1000).toFixed(0)}k` : cell.metrics.inflows}
                        </span>
                      </div>
                    ) : (
                      <span className="w-1 h-1 rounded-full opacity-0">•</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] text-slate-400 font-bold border-t border-slate-100">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>&lt; 1,000</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>1,000 - 5,000</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>&gt; 5,000 (High)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Selected</span>
          </div>
        </div>

      </div>

      {/* 3. SELECTED DAY INSPECTOR & TRANSACTION BREAKDOWN */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        
        {/* Selected Date Header with Prev/Next Day navigation and Add button */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStepDay(-1)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                  {formatDisplayDate(selectedDateKey)}
                </h3>
                {selectedDateKey === todayKey && (
                  <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                    Today
                  </span>
                )}
              </div>
              <p className="text-[10.5px] font-bold text-slate-400">
                {selectedDayMetrics.count} {selectedDayMetrics.count === 1 ? 'Expense' : 'Expenses'} recorded
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleStepDay(1)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Add Expense button for this date */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsAddModalOpen(true);
            }}
            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-2xs flex items-center gap-1 transition active:scale-95 shrink-0"
            title="Add expense for this selected date"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Selected Day Stats: Total Spent, Cash, Card, Inflow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Box 1: Total Spent */}
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
            <span className="text-[10px] font-extrabold uppercase text-rose-600 flex items-center gap-1 mb-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>Day Total</span>
            </span>
            <p className="text-sm sm:text-base font-black text-rose-950 truncate">
              {formatCurrency(selectedDayMetrics.spent, currency)}
            </p>
          </div>

          {/* Box 2: Cash Spent */}
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100">
            <span className="text-[10px] font-extrabold uppercase text-sky-600 flex items-center gap-1 mb-0.5">
              <Wallet className="w-3 h-3" />
              <span>Pocket Cash</span>
            </span>
            <p className="text-sm sm:text-base font-black text-sky-950 truncate">
              {formatCurrency(selectedDayMetrics.cash, currency)}
            </p>
          </div>

          {/* Box 3: Card Spent */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 flex items-center gap-1 mb-0.5">
              <CreditCard className="w-3 h-3" />
              <span>Bank Card</span>
            </span>
            <p className="text-sm sm:text-base font-black text-indigo-950 truncate">
              {formatCurrency(selectedDayMetrics.card, currency)}
            </p>
          </div>

          {/* Box 4: Received / Inflow */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 flex items-center gap-1 mb-0.5">
              <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
              <span>Received</span>
            </span>
            <p className="text-sm sm:text-base font-black text-emerald-950 truncate">
              +{formatCurrency(selectedDayMetrics.inflows, currency)}
            </p>
          </div>
        </div>

        {/* Category Breakdown Chips for this day */}
        {selectedDayCategoryBreakdown.length > 0 && (
          <div className="pt-1">
            <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Category Breakdown
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedDayCategoryBreakdown.map((cat) => (
                <div
                  key={cat.catId}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center gap-1.5 text-xs font-bold text-slate-700"
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color || 'bg-blue-500'}`} />
                  <span className="text-slate-600">{cat.label.split('&')[0]}:</span>
                  <span className="font-black text-slate-900">{formatCurrency(cat.amount, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions List for this Date */}
        <div className="space-y-2 pt-1">
          <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
            Transactions for {formatDisplayDate(selectedDateKey)}
          </p>

          {selectedDayExpenses.length === 0 && selectedDayInflows.length === 0 ? (
            /* Clean Empty State */
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-slate-700 text-sm">
                No transactions recorded on this date 🎉
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No transactions recorded on this day. Tap "Add Expense" to log an expense.
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsAddModalOpen(true);
                }}
                className="mt-2 py-1.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs hover:bg-blue-700 active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Expense for This Day</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {/* Render Inflows */}
              {selectedDayInflows.map((inf) => (
                <div
                  key={inf.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/90 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 text-xs sm:text-sm truncate">
                        {inf.note || (inf.destination === 'pocket' ? 'Cash Added to Pocket' : 'Bank Deposit')}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{inf.time || 'Logged'}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">
                          {inf.destination === 'pocket' ? '💵 Pocket' : `🏦 ${inf.bankName || 'Bank'}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-emerald-700 text-xs sm:text-sm">
                      +{formatCurrency(inf.amount, currency)}
                    </span>
                    {onDeleteInflow && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this inflow record?')) {
                            sound.playClick();
                            onDeleteInflow(inf.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                        title="Delete Inflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Render Expenses */}
              {selectedDayExpenses.map((exp) => {
                const isLoan = exp.category === 'loan';
                const isBill = exp.category === 'bills';
                const catObj = CATEGORIES.find((c) => c.id === exp.category) || CATEGORIES[CATEGORIES.length - 1];

                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 hover:border-slate-200 transition shadow-2xs gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                          isLoan
                            ? 'bg-amber-100 text-amber-700'
                            : isBill
                            ? 'bg-rose-100 text-rose-700'
                            : `${catObj.color || 'bg-blue-600'} text-white`
                        }`}
                      >
                        {isLoan ? (
                          <HandCoins className="w-4 h-4 stroke-[2.2]" />
                        ) : isBill ? (
                          <Receipt className="w-4 h-4 stroke-[2.2]" />
                        ) : (
                          catObj.label.slice(0, 1)
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-black text-slate-800 text-xs sm:text-sm truncate">
                            {exp.reason}
                          </p>
                          {exp.recipientName && (
                            <span className="font-bold text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                              👤 {exp.recipientName}
                            </span>
                          )}
                          {isLoan && exp.isSettled && (
                            <span className="font-bold text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-md">
                              Repaid ✓
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{exp.time || 'Logged'}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">
                            {exp.paymentMethod === 'card' ? `💳 ${exp.bankName || 'Bank'}` : '💵 Cash'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-rose-600 text-xs sm:text-sm">
                        -{formatCurrency(exp.amount, currency)}
                      </span>

                      {/* Settle Toggle (Loans / Bills) */}
                      {(isLoan || isBill) && onToggleSettledExpense && (
                        <button
                          type="button"
                          onClick={() => onToggleSettledExpense(exp.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                            exp.isSettled
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-400 hover:text-emerald-600'
                          }`}
                          title={exp.isSettled ? 'Mark as Unpaid' : 'Mark as Settled / Repaid'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      {onDeleteExpense && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this expense?')) {
                              sound.playClick();
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 4. MODAL: ADD EXPENSE FOR SELECTED DATE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200/90 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Add Expense
                </h3>
                <p className="text-xs font-bold text-blue-600">
                  📅 {formatDisplayDate(selectedDateKey)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              {/* Amount */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base font-black text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Reason / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lunch, Bus ticket, Electricity"
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setModalPaymentMethod('cash');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition ${
                      modalPaymentMethod === 'cash'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Pocket Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setModalPaymentMethod('card');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition ${
                      modalPaymentMethod === 'card'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bank / Card</span>
                  </button>
                </div>
              </div>

              {/* If Card: Select Bank */}
              {modalPaymentMethod === 'card' && banks.length > 0 && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Select Bank
                  </label>
                  <select
                    value={modalBankId}
                    onChange={(e) => setModalBankId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                  >
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({formatCurrency(b.balance, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* If Loan or Bill */}
              {(modalCategory === 'loan' || modalCategory === 'bills') && (
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Person Name / Biller
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kasun, Dialog, CEB"
                    value={modalRecipient}
                    onChange={(e) => setModalRecipient(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
                >
                  Save Expense
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}