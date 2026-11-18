import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import { PieChart, Sparkles, Calendar, Layers } from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey } from '../utils/storage';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  food: '#3b82f6',         // blue
  transport: '#0ea5e9',    // sky
  grocery: '#10b981',      // emerald
  bills: '#f43f5e',        // rose
  shopping: '#a855f7',     // purple
  entertainment: '#ec4899',// pink
  health: '#14b8a6',       // teal
  education: '#6366f1',    // indigo
  other: '#64748b',        // slate
};

export default function ExpensePieChart({
  expenses = [],
  currency = 'Rs.',
}) {
  const todayKey = getTodayDateKey();
  const [filterMode, setFilterMode] = useState('today'); // 'today' | 'all'

  // Filter expenses
  const displayedExpenses = useMemo(() => {
    if (filterMode === 'today') {
      const todayList = expenses.filter((e) => e.date === todayKey);
      // Fallback to all if today has no expenses yet but previous expenses exist
      if (todayList.length === 0 && expenses.length > 0) {
        return expenses.slice(0, 50);
      }
      return todayList;
    }
    return expenses;
  }, [expenses, filterMode, todayKey]);

  // Aggregate by category
  const chartData = useMemo(() => {
    const categoryTotals = {};
    let grandTotal = 0;

    displayedExpenses.forEach((exp) => {
      const cat = exp.category || 'other';
      const amt = Number(exp.amount) || 0;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      grandTotal += amt;
    });

    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    const labels = [];
    const data = [];
    const bgColors = [];
    const items = [];

    entries.forEach(([catId, amount]) => {
      const catObj = CATEGORIES.find((c) => c.id === catId);
      const label = catObj ? catObj.label.split('&')[0].trim() : catId;
      const color = CATEGORY_COLORS[catId] || '#94a3b8';
      const percent = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;

      labels.push(label);
      data.push(amount);
      bgColors.push(color);
      items.push({
        id: catId,
        label,
        amount,
        percent,
        color,
      });
    });

    return {
      grandTotal,
      items,
      chartJsData: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: bgColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
    };
  }, [displayedExpenses]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We render our own clean responsive legend below
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw || 0;
            const pct = chartData.grandTotal > 0 ? Math.round((val / chartData.grandTotal) * 100) : 0;
            return ` ${formatCurrency(val, currency)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%', // Modern doughnut look with summary in center
  };

  const isTodayFallback = filterMode === 'today' && expenses.filter((e) => e.date === todayKey).length === 0 && expenses.length > 0;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
      
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
              Expenses Breakdown
            </h4>
            <p className="text-[10px] text-slate-400">
              {isTodayFallback
                ? 'Showing recent expenses'
                : filterMode === 'today'
                ? "Today's expenses"
                : 'All-time expenses'}
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        {expenses.length > 0 && (
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setFilterMode('today')}
              className={`px-2 py-1 rounded-lg transition ${
                filterMode === 'today'
                  ? 'bg-white text-blue-600 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-white text-blue-600 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
          </div>
        )}
      </div>

      {/* Chart Body */}
      {displayedExpenses.length === 0 ? (
        <div className="py-7 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-600">No expenses recorded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add an expense below to see the interactive pie breakdown
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* Doughnut Chart with Center Total */}
          <div className="relative h-44 sm:h-48 w-full flex items-center justify-center my-1">
            <Doughnut data={chartData.chartJsData} options={options} />

            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Spent
              </span>
              <span className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                {formatCurrency(chartData.grandTotal, currency)}
              </span>
            </div>
          </div>

          {/* Category Breakdown Chips / Progress Bars */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            {chartData.items.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between min-w-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-1.5">
                  <span className="text-[11px] font-black text-slate-800">
                    {item.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
