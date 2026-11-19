import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Receipt,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey } from '../utils/storage';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

export default function AnalyticsCharts({
  currency = 'Rs.',
  startingPocketMoney = 0,
  todayCashSpent = 0,
  todayCardSpent = 0,
  todayPocketRemaining = 0,
  expenses = [],
  inflows = [],
  onToggleSettledExpense,
}) {
  const todayKey = getTodayDateKey();

  // Inflows today
  const todayInflows = inflows
    .filter((i) => i.date === todayKey)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const todayTotalSpent = todayCashSpent + todayCardSpent;

  // Percentage of daily pocket cash spent
  const totalAvailablePocket = startingPocketMoney;
  const cashSpendPercent = totalAvailablePocket > 0
    ? Math.min(100, Math.round((todayCashSpent / totalAvailablePocket) * 100))
    : 0;

  // Loans and Bills Data Filter
  const loanAndBillItems = useMemo(() => {
    return expenses.filter(
      (e) => e.category === 'loan' || e.category === 'bills' || e.recipientName || e.dueDate
    );
  }, [expenses]);

  const totalLoansGiven = loanAndBillItems
    .filter((e) => e.category === 'loan')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalPendingBills = loanAndBillItems
    .filter((e) => e.category === 'bills' && !e.isSettled)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalPendingLoans = loanAndBillItems
    .filter((e) => e.category === 'loan' && !e.isSettled)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Category breakdown
  const categoryData = useMemo(() => {
    const todayExpenses = expenses.filter((e) => e.date === todayKey);
    const targetExpenses = todayExpenses.length > 0 ? todayExpenses : expenses.slice(0, 30);

    const map = {};
    targetExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    });

    const labels = [];
    const values = [];
    const colors = [
      '#2563eb', // blue
      '#0284c7', // sky
      '#10b981', // emerald
      '#f97316', // orange (loan)
      '#f43f5e', // rose (bills)
      '#f59e0b', // amber
      '#ec4899', // pink
      '#8b5cf6', // purple
      '#64748b', // slate
    ];

    Object.keys(map).forEach((catId) => {
      const catObj = CATEGORIES.find((c) => c.id === catId);
      labels.push(catObj ? catObj.label.split('&')[0] : catId);
      values.push(map[catId]);
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6,
        },
      ],
      total: values.reduce((a, b) => a + b, 0),
    };
  }, [expenses, todayKey]);

  // Monthly / 14-day spending trend
  const monthlyData = useMemo(() => {
    const dayMap = {};
    const days = [];
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ key, label: dayLabel });
      dayMap[key] = 0;
    }

    expenses.forEach((e) => {
      if (dayMap[e.date] !== undefined) {
        dayMap[e.date] += Number(e.amount) || 0;
      }
    });

    return {
      labels: days.map((d) => d.label),
      datasets: [
        {
          label: `Spent (${currency})`,
          data: days.map((d) => dayMap[d.key]),
          backgroundColor: days.map((d) =>
            d.key === todayKey ? '#2563eb' : '#93c5fd'
          ),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [expenses, currency, todayKey]);

  return (
    <div className="space-y-4">
      
      {/* 1. Daily Inflow, Outflow, Day Start & Day End Report (User requirement) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">
                Daily Money Flow Report
              </h3>
              <p className="text-[10.5px] text-slate-400">
                Starting pocket, inflows, spent & day end cash
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            Today
          </span>
        </div>

        {/* 4 Clear Flow Cards: Starting -> Received -> Spent -> Ending Remaining */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Card 1: Day Starting Cash */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70">
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Starting Cash</span>
            </div>
            <p className="text-base sm:text-lg font-black text-amber-950 tracking-tight truncate">
              {formatCurrency(startingPocketMoney, currency)}
            </p>
            <p className="text-[10px] text-amber-700/80 font-bold mt-0.5 truncate">
              Day Start Balance
            </p>
          </div>

          {/* Card 2: Received Today */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Received Today</span>
            </div>
            <p className="text-base sm:text-lg font-black text-emerald-950 tracking-tight truncate">
              +{formatCurrency(todayInflows, currency)}
            </p>
            <p className="text-[10px] text-emerald-700/80 font-bold mt-0.5 truncate">
              Cash In & Deposits
            </p>
          </div>

          {/* Card 3: Total Spent Today */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/70">
            <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold mb-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Total Spent</span>
            </div>
            <p className="text-base sm:text-lg font-black text-rose-950 tracking-tight truncate">
              -{formatCurrency(todayTotalSpent, currency)}
            </p>
            <p className="text-[10px] text-rose-700/80 font-bold mt-0.5 truncate">
              Total Expenses Outflow
            </p>
          </div>

          {/* Card 4: Day End Remaining */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/70">
            <div className="flex items-center gap-1.5 text-indigo-800 text-[11px] font-bold mb-1">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Day End Cash</span>
            </div>
            <p className="text-base sm:text-lg font-black text-indigo-950 tracking-tight truncate">
              {formatCurrency(todayPocketRemaining, currency)}
            </p>
            <p className="text-[10px] text-indigo-700/80 font-bold mt-0.5 truncate">
              Remaining Pocket Cash
            </p>
          </div>

        </div>

        {/* Pocket Cash Spent Pace Progress Bar */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 text-[11px]">Pocket Cash Pace</span>
            <span className="text-blue-700">{cashSpendPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                cashSpendPercent >= 90
                  ? 'bg-rose-500'
                  : cashSpendPercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${cashSpendPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-semibold">
            <span>Cash Spent: <strong className="text-slate-700">{formatCurrency(todayCashSpent, currency)}</strong></span>
            <span>Card Spent: <strong className="text-slate-700">{formatCurrency(todayCardSpent, currency)}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED LOANS & BILLS DUE TRACKER (New user requested module!) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">
                Loans & Bills Tracker
              </h3>
              <p className="text-[10.5px] text-slate-400">Track loans given and pending utility bills</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
            {loanAndBillItems.filter((i) => !i.isSettled).length} Pending
          </span>
        </div>

        {/* 2 Metric Pills: Pending Loans & Pending Bills */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-100">
            <span className="text-[10px] uppercase font-bold text-orange-700 block">
              Pending Loans Given
            </span>
            <span className="text-base font-black text-orange-950 mt-0.5 block">
              {formatCurrency(totalPendingLoans, currency)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-100">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">
              Pending Bills Due
            </span>
            <span className="text-base font-black text-rose-950 mt-0.5 block">
              {formatCurrency(totalPendingBills, currency)}
            </span>
          </div>
        </div>

        {/* List of Loans & Bills */}
        {loanAndBillItems.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            <Receipt className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
            <p className="font-bold">No loans or bills recorded yet</p>
            <p className="text-[10px] mt-0.5">Select category "Loan / Given" or "Bills" when adding an expense</p>
          </div>
        ) : (
          <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
            {loanAndBillItems.map((item) => {
              const isLoan = item.category === 'loan';
              const isOverdue = item.dueDate && item.dueDate < todayKey && !item.isSettled;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isLoan ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isLoan ? <HandCoins className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-800 text-xs truncate">
                        {item.recipientName ? `${item.recipientName} (${item.reason})` : item.reason}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        {item.dueDate ? (
                          <span
                            className={`font-bold flex items-center gap-0.5 ${
                              isOverdue ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{isOverdue ? `Overdue: ${item.dueDate}` : `Due: ${item.dueDate}`}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">No due date</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-xs text-slate-800">
                      {formatCurrency(item.amount, currency)}
                    </span>

                    {onToggleSettledExpense && (
                      <button
                        type="button"
                        onClick={() => onToggleSettledExpense(item.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition active:scale-95 ${
                          item.isSettled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700'
                        }`}
                        title={item.isSettled ? 'Mark Unsettled' : 'Mark Settled'}
                      >
                        {item.isSettled ? 'Settled ✓' : 'Settle'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Category Doughnut Chart */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <span>Where Your Money Goes</span>
          </h3>
        </div>

        {categoryData.labels.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No expenses recorded yet to show chart</p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <div className="w-40 h-40 relative">
              <Doughnut
                data={categoryData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw, currency)}`,
                      },
                    },
                  },
                  cutout: '70%',
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                <span className="text-xs font-black text-slate-800">
                  {formatCurrency(categoryData.total, currency)}
                </span>
              </div>
            </div>

            {/* Category breakdown pills */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {categoryData.labels.slice(0, 6).map((label, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: categoryData.datasets[0].backgroundColor[idx] }}
                  />
                  <span className="text-slate-600 font-medium">{label}:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(categoryData.datasets[0].data[idx], currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. 14-Day Spending Trend */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Daily Spending Trend</span>
          </h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            Past 14 Days
          </span>
        </div>

        <div className="h-44 w-full pt-1">
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => ` ${formatCurrency(ctx.raw, currency)}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 9 } },
                },
                y: {
                  grid: { color: '#f8fafc' },
                  ticks: { font: { size: 9 } },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

    </div>
  );
}
