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
import { PieChart, TrendingUp, AlertTriangle, CheckCircle, Wallet, CreditCard, Sparkles } from 'lucide-react';
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
}) {
  const todayKey = getTodayDateKey();

  // Percentage of daily pocket cash spent
  const cashSpendPercent = startingPocketMoney > 0
    ? Math.min(100, Math.round((todayCashSpent / startingPocketMoney) * 100))
    : 0;

  // Category breakdown for Today / Recent
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
      '#3b82f6', // blue
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ec4899', // pink
      '#8b5cf6', // purple
      '#f43f5e', // rose
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

  // Monthly Spending by Day (Last 14 days or current month)
  const monthlyData = useMemo(() => {
    // Group expenses by date for the last 14 days
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
          label: `Daily Total (${currency})`,
          data: days.map((d) => dayMap[d.key]),
          backgroundColor: days.map((d) =>
            d.key === todayKey ? 'rgba(37, 99, 235, 0.9)' : 'rgba(147, 197, 253, 0.65)'
          ),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [expenses, currency, todayKey]);

  return (
    <div className="space-y-6">
      
      {/* 1. Daily Pocket Money Status Banner (Requested by user) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-500/5 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                Daily Pocket Money Summary
              </h3>
              <p className="text-xs text-slate-400">Cash in hand balance & spending progress</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {cashSpendPercent}% Spent
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Starting Cash</p>
            <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">
              {formatCurrency(startingPocketMoney, currency)}
            </p>
          </div>
          <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-100 text-center">
            <p className="text-[10px] uppercase font-bold text-rose-600">Spent Today</p>
            <p className="text-sm sm:text-base font-extrabold text-rose-700 mt-0.5">
              - {formatCurrency(todayCashSpent, currency)}
            </p>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[10px] uppercase font-bold text-emerald-600">Remaining</p>
            <p className="text-sm sm:text-base font-extrabold text-emerald-800 mt-0.5">
              {formatCurrency(todayPocketRemaining, currency)}
            </p>
          </div>
        </div>

        {/* Progress Meter Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                cashSpendPercent >= 90
                  ? 'bg-rose-500'
                  : cashSpendPercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-500 to-sky-400'
              }`}
              style={{ width: `${cashSpendPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>0%</span>
            <span>
              {cashSpendPercent >= 90 ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Over 90% pocket cash used!
                </span>
              ) : cashSpendPercent >= 70 ? (
                <span className="text-amber-600 font-bold">
                  Careful, 70%+ pocket cash used
                </span>
              ) : (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Healthy daily spending pace
                </span>
              )}
            </span>
            <span>100%</span>
          </div>
        </div>

      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown (Donut) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-500/5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  Where Your Money Goes
                </h3>
                <p className="text-xs text-slate-400">Expense breakdown by category</p>
              </div>
            </div>
          </div>

          {categoryData.labels.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No expenses recorded yet to show breakdown.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
              <div className="w-44 h-44 relative">
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
                    cutout: '68%',
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {formatCurrency(categoryData.total, currency)}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 w-full sm:w-auto">
                {categoryData.labels.slice(0, 5).map((label, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: categoryData.datasets[0].backgroundColor[idx] }}
                      />
                      <span className="text-slate-600 font-medium">{label}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(categoryData.datasets[0].data[idx], currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly / Daily Trend (Bar Chart) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-500/5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  Daily Spending Trend
                </h3>
                <p className="text-xs text-slate-400">Comparing past 14 days</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Past 14 Days
            </span>
          </div>

          <div className="h-48 sm:h-52 w-full pt-2">
            <Bar
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` Spent: ${formatCurrency(ctx.raw, currency)}`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } },
                  },
                  y: {
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 10 } },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
