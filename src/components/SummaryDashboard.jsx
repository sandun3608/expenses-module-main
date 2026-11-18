import React, { useState } from 'react';
import { Landmark, Plus, Wallet, CreditCard, Sparkles, TrendingDown, ArrowRight, ArrowUpRight, ShieldCheck, Sun, PiggyBank, PieChart } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import AnalyticsCharts from './AnalyticsCharts';
import SavingsModule from './SavingsModule';
import { formatCurrency, getTodayDateKey } from '../utils/storage';

export default function SummaryDashboard({
  profile,
  banks,
  startingPocketMoney,
  expenses,
  frequentReasons,
  savingsGoals,
  activeTab = 'overview',
  setActiveTab,
  onOpenS1Banks,
  onOpenAddBankMoney,
  onOpenDailyCheckin,
  onAddExpense,
  onDeleteExpense,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositToGoal,
  onWithdrawFromGoal,
}) {
  const todayKey = getTodayDateKey();

  // Total Bank Balance
  const totalBankBalance = banks.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);

  // Today's Cash expenses
  const todayCashExpenses = expenses
    .filter((e) => e.date === todayKey && e.paymentMethod === 'cash')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Today's Card expenses
  const todayCardExpenses = expenses
    .filter((e) => e.date === todayKey && e.paymentMethod === 'card')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Remaining Pocket Cash
  const todayPocketRemaining = Math.max(0, startingPocketMoney - todayCashExpenses);

  // Total Saved Money
  const totalSavedMoney = savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
      
      {/* 1. TOP SECTION: Total Bank Balance & Pocket Cash Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5">
        
        {/* Total Bank Balance Card (Large, Primary Blue) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-7 shadow-xl shadow-blue-500/20">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                <Landmark className="w-4 h-4" />
                <span>Total Combined Bank Balance</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {formatCurrency(totalBankBalance, profile.currency)}
              </h1>
              <p className="text-xs text-blue-100/80 mt-1">
                Combined balance of {banks.length} {banks.length === 1 ? 'account' : 'accounts'}
              </p>
            </div>

            {/* Direct Deposit '+' and 'S1' Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              
              {/* Prominent '+' Add Money to Bank Button (User requirement) */}
              <button
                onClick={onOpenAddBankMoney}
                className="flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition group"
                title="Deposit money to bank account"
              >
                <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black group-hover:rotate-90 transition">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Deposit Money</span>
              </button>

              {/* S1 Button */}
              <button
                onClick={onOpenS1Banks}
                className="flex items-center gap-1.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-2xl bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm border border-blue-400/30 active:scale-95 transition"
                title="S1: Manage bank accounts"
              >
                <span className="font-extrabold">S1</span>
                <span>Banks</span>
              </button>

            </div>
          </div>

          {/* Connected Banks Mini Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15 overflow-x-auto scrollbar-none pb-0.5">
            {banks.map((b, idx) => (
              <div
                key={b.id}
                onClick={onOpenS1Banks}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl px-3 py-2 transition cursor-pointer border border-white/10 text-left shrink-0 min-w-[120px]"
              >
                <div className="text-[10px] text-blue-100 font-semibold truncate max-w-[120px]">
                  {b.name}
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                  {formatCurrency(b.balance, profile.currency)}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Today's Pocket Cash Widget */}
        <div className="rounded-3xl bg-white border border-blue-100 p-5 sm:p-6 shadow-xl shadow-blue-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-sky-500" />
                <span>Today's Pocket Cash</span>
              </span>
              <button
                onClick={onOpenDailyCheckin}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg transition"
              >
                Edit
              </button>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium">Cash in Hand Left:</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {formatCurrency(todayPocketRemaining, profile.currency)}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Started With</p>
                <p className="font-extrabold text-slate-700 mt-0.5">
                  {formatCurrency(startingPocketMoney, profile.currency)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-[10px] font-bold text-rose-500 uppercase">Cash Spent</p>
                <p className="font-extrabold text-rose-600 mt-0.5">
                  - {formatCurrency(todayCashExpenses, profile.currency)}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDailyCheckin}
            className="w-full mt-3.5 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Daily Check-in / Change Cash</span>
          </button>
        </div>

      </div>

      {/* 2. Responsive Navigation Tabs (Overview / Savings / Analytics) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5 sm:gap-2">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Expenses & Log</span>
          </button>

          {/* New Savings Module Tab (Requested by user) */}
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'savings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Savings Vault ({savingsGoals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Analytics & Charts</span>
          </button>

        </div>

        <div className="text-xs text-slate-400 hidden md:block whitespace-nowrap pl-2">
          Today: <strong className="text-slate-600">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
        </div>
      </div>

      {/* TAB 1: Overview & Expenses */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Expenses Entry & List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Left: Expense Entry Form */}
            <div className="lg:col-span-5">
              <ExpenseForm
                currency={profile.currency}
                banks={banks}
                todayPocketRemaining={todayPocketRemaining}
                frequentReasons={frequentReasons}
                onAddExpense={onAddExpense}
              />
            </div>

            {/* Right: Expenses Table / List */}
            <div className="lg:col-span-7">
              <ExpenseList
                expenses={expenses}
                currency={profile.currency}
                onDeleteExpense={onDeleteExpense}
              />
            </div>

          </div>

          {/* Quick Analytics Sneak-Peek */}
          <div className="pt-2">
            <AnalyticsCharts
              currency={profile.currency}
              startingPocketMoney={startingPocketMoney}
              todayCashSpent={todayCashExpenses}
              todayCardSpent={todayCardExpenses}
              todayPocketRemaining={todayPocketRemaining}
              expenses={expenses}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Savings Module (Requested by user) */}
      {activeTab === 'savings' && (
        <div className="animate-in fade-in">
          <SavingsModule
            currency={profile.currency}
            savingsGoals={savingsGoals}
            banks={banks}
            todayPocketRemaining={todayPocketRemaining}
            onAddGoal={onAddGoal}
            onUpdateGoal={onUpdateGoal}
            onDeleteGoal={onDeleteGoal}
            onDepositToGoal={onDepositToGoal}
            onWithdrawFromGoal={onWithdrawFromGoal}
          />
        </div>
      )}

      {/* TAB 3: Full Analytics & Reports */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          <AnalyticsCharts
            currency={profile.currency}
            startingPocketMoney={startingPocketMoney}
            todayCashSpent={todayCashExpenses}
            todayCardSpent={todayCardExpenses}
            todayPocketRemaining={todayPocketRemaining}
            expenses={expenses}
          />
        </div>
      )}

    </div>
  );
}
