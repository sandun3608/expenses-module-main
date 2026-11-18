import React from 'react';
import { Landmark, Plus, Wallet, PiggyBank, PieChart, Sun, ArrowUpRight } from 'lucide-react';
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      
      {/* 1. HERO BALANCE CARD (Revolut / Apple Wallet Modern Aesthetic) */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-blue-500/15">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
            <Landmark className="w-4 h-4" />
            <span>Total Bank Balance</span>
          </span>
          <button
            onClick={onOpenS1Banks}
            className="text-xs font-bold text-white bg-white/15 hover:bg-white/20 px-3 py-1 rounded-xl backdrop-blur-xs transition"
          >
            S1 ({banks.length} {banks.length === 1 ? 'Bank' : 'Banks'})
          </button>
        </div>

        {/* Big Total Bank Amount & Quick Deposit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/15">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {formatCurrency(totalBankBalance, profile.currency)}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddBankMoney}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit to Bank</span>
            </button>
          </div>
        </div>

        {/* Pocket Cash Sub-Row */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Today's Pocket Cash Left
              </p>
              <p className="text-lg sm:text-xl font-black text-white">
                {formatCurrency(todayPocketRemaining, profile.currency)}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDailyCheckin}
            className="text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Change</span>
          </button>
        </div>

      </div>

      {/* 2. SEGMENTED TABS (Clean iOS / Modern Web Style) */}
      <div className="flex p-1.5 rounded-2xl bg-slate-200/70 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'overview'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Expenses</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'savings'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Savings ({savingsGoals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'analytics'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Reports</span>
        </button>
      </div>

      {/* TAB 1: Expenses Entry & Feed */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <ExpenseForm
            currency={profile.currency}
            banks={banks}
            todayPocketRemaining={todayPocketRemaining}
            frequentReasons={frequentReasons}
            onAddExpense={onAddExpense}
          />

          <ExpenseList
            expenses={expenses}
            currency={profile.currency}
            onDeleteExpense={onDeleteExpense}
          />
        </div>
      )}

      {/* TAB 2: Savings Module */}
      {activeTab === 'savings' && (
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
      )}

      {/* TAB 3: Reports & Graphs */}
      {activeTab === 'analytics' && (
        <AnalyticsCharts
          currency={profile.currency}
          startingPocketMoney={startingPocketMoney}
          todayCashSpent={todayCashExpenses}
          todayCardSpent={todayCardExpenses}
          todayPocketRemaining={todayPocketRemaining}
          expenses={expenses}
        />
      )}

    </div>
  );
}
