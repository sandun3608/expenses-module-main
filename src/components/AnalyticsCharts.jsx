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
import { PieChart, TrendingUp, AlertTriangle, CheckCircle, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
      
      {/* 1. Daily Inflow vs Outflow Summary (Requested by user) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-base">
            Today's Money Summary
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            Received vs Spent
          </span>
        </div>

        {/* 2 Big Stat Cards: Money Received Today & Total Spent Today */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100/80">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Received Today</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-800 tracking-tight">
              +{formatCurrency(todayInflows, currency)}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Cash in + Bank deposits
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100/80">
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold mb-1">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Spent Today</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-rose-800 tracking-tight">
              -{formatCurrency(todayTotalSpent, currency)}
            </p>
            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
              Cash & card expenses
            </p>
          </div>
        </div>

        {/* Pocket Cash Progress */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">Pocket Cash Spent Pace</span>
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

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Remaining: <strong className="text-slate-700">{formatCurrency(todayPocketRemaining, currency)}</strong></span>
            <span>
              {cashSpendPercent >= 90 ? (
                <span className="text-rose-600 font-bold">⚠️ High spending</span>
              ) : (
                <span className="text-emerald-600 font-bold">✓ Safe pace</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Category Doughnut Chart */}
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
              {categoryData.labels.slice(0, 5).map((label, idx) => (
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

      {/* 3. 14-Day Spending Trend */}
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
