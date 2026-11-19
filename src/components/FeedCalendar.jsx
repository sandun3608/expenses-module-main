import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CreditCard,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  formatCurrency,
  getTodayDateKey,
  formatDisplayDate,
} from '../utils/storage';
import { sound } from '../utils/sound';

export default function FeedCalendar({
  expenses = [],
  inflows = [],
  currency = 'Rs.',
  selectedDate = 'all', // 'all' or 'YYYY-MM-DD'
  onSelectDate,
}) {
  const todayKey = getTodayDateKey();
  const todayDateObj = new Date();

  // Current viewed month & year in the calendar grid
  const [viewYear, setViewYear] = useState(todayDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDateObj.getMonth()); // 0 - 11
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Month navigation
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
    onSelectDate(todayKey);
  };

  // Day navigation (Prev day / Next day)
  const handleStepDay = (step) => {
    sound.playClick();
    const baseDateKey = selectedDate === 'all' ? todayKey : selectedDate;
    const parts = baseDateKey.split('-');
    const current = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    current.setDate(current.getDate() + step);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const newKey = `${y}-${m}-${d}`;
    onSelectDate(newKey);
    // sync month view if jumped outside current month view
    if (current.getFullYear() !== viewYear || current.getMonth() !== viewMonth) {
      setViewYear(current.getFullYear());
      setViewMonth(current.getMonth());
    }
  };

  // Daily totals map
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

  // Calendar Grid Days Builder (Mon - Sun)
  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
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

  // Selected Day Metrics (if a specific day is selected)
  const selectedDayMetrics = selectedDate !== 'all' ? dailyMetricsMap[selectedDate] || {
    spent: 0,
    cash: 0,
    card: 0,
    inflows: 0,
    count: 0,
  } : null;

  // Month Name Formatter
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 transition-all">
      
      {/* 1. Header: Title, Month Controls, Quick Actions & Collapse Toggle */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <CalendarIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight truncate">
                Expense Calendar
              </h3>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                {monthName}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-semibold truncate">
              පසුගිය වියදම් දිනෙන් දින බලන්න (Past Expenses History)
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Prev Month */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Next Month */}
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsCollapsed((prev) => !prev);
            }}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
            title={isCollapsed ? 'Expand Calendar' : 'Collapse Calendar'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

      </div>

      {/* 2. Interactive Calendar Grid (Collapsible) */}
      {!isCollapsed && (
        <div className="space-y-2 pt-0.5 animate-in fade-in duration-150">
          
          {/* Weekday Labels (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
              <div
                key={`${d}-${idx}`}
                className={`text-[10px] font-black uppercase py-0.5 ${
                  idx >= 5 ? 'text-blue-500' : 'text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.dateKey === selectedDate;
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
                    onSelectDate(cell.dateKey);
                  }}
                  className={`relative min-h-[46px] sm:min-h-[50px] p-1 rounded-2xl flex flex-col justify-between items-center transition-all duration-150 active:scale-95 text-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30 scale-[1.04] z-10'
                      : isToday
                      ? 'bg-blue-50/90 text-blue-900 border-2 border-blue-500 font-black'
                      : cell.isCurrentMonth
                      ? hasExpenses
                        ? 'bg-slate-50 hover:bg-blue-50/60 text-slate-800 border border-slate-200/80 font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
                      : 'bg-slate-50/30 text-slate-300 border border-transparent'
                  }`}
                  title={`${cell.dateKey}: ${formatCurrency(cell.metrics.spent, currency)} spent`}
                >
                  {/* Day Number */}
                  <span
                    className={`text-xs sm:text-[12.5px] leading-tight font-black ${
                      isSelected ? 'text-white' : ''
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Indicator / Spent Badge */}
                  <div className="w-full flex items-center justify-center min-h-[14px]">
                    {hasExpenses ? (
                      <div className="flex items-center justify-center gap-0.5">
                        <span
                          className={`text-[8px] sm:text-[9px] font-black truncate max-w-[38px] leading-none ${
                            isSelected
                              ? 'text-white'
                              : cell.metrics.spent > 5000
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {cell.metrics.spent >= 1000
                            ? `${(cell.metrics.spent / 1000).toFixed(cell.metrics.spent >= 10000 ? 0 : 1)}k`
                            : cell.metrics.spent}
                        </span>
                        {!isSelected && (
                          <span className={`w-1.5 h-1.5 rounded-full ${spendDotColor} shrink-0`} />
                        )}
                      </div>
                    ) : hasInflows ? (
                      <span
                        className={`text-[8.5px] font-black leading-none ${
                          isSelected ? 'text-emerald-200' : 'text-emerald-600'
                        }`}
                      >
                        +
                      </span>
                    ) : (
                      <span className="w-1 h-1 rounded-full opacity-0">•</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* 3. Active Date Filter Strip (Controls what the Feed below displays) */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Quick Date Stepper & Status Badge */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {selectedDate !== 'all' && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleStepDay(-1)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
                title="Previous Day"
              >
                <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => handleStepDay(1)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95"
                title="Next Day"
              >
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          )}

          <div className="min-w-0">
            {selectedDate === 'all' ? (
              <p className="text-xs font-black text-slate-800 truncate">
                📋 Showing: <span className="text-blue-700">All Activity Feed</span>
              </p>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-slate-800">
                  📅 {formatDisplayDate(selectedDate)}
                </span>
                {selectedDate === todayKey && (
                  <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded-md uppercase">
                    Today
                  </span>
                )}
                {selectedDayMetrics && selectedDayMetrics.spent > 0 && (
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-100">
                    -{formatCurrency(selectedDayMetrics.spent, currency)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Pills (Today / All History) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Jump Today */}
          <button
            type="button"
            onClick={handleJumpToToday}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition active:scale-95 ${
              selectedDate === todayKey
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Today
          </button>

          {/* Show All History */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectDate('all');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition active:scale-95 ${
              selectedDate === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All History
          </button>
        </div>

      </div>

    </div>
  );
}