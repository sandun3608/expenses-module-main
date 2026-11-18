import React from 'react';
import { Landmark, Plus, Wallet, PiggyBank, PieChart } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpensePieChart from './ExpensePieChart';
import AnalyticsCharts from './AnalyticsCharts';
import SavingsModule from './SavingsModule';
import { formatCurrency, getTodayDateKey } from '../utils/storage';

export default function SummaryDashboard({
  profile,
  banks,
  startingPocketMoney,
  expenses,
  inflows = [],
  frequentReasons,
  savingsGoals,
  activeTab = 'overview',
  setActiveTab,
  onOpenBanks,
  onOpenAddBankMoney,
  onOpenAddCash,
  onOpenDailyCheckin,
  onAddExpense,
  onDeleteExpense,
  onDeleteInflow,
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
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 overflow-x-hidden">
      
      {/* 1. TWO EQUAL SIDE-BY-SIDE BOXES: Bank Balance (Left) & Pocket Cash (Right) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        
        {/* BOX 1: Total Bank Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-3.5 sm:p-4 shadow-lg shadow-blue-500/15 flex flex-col justify-between min-h-[142px]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-blue-200">
                Bank Balance
              </span>
              <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-white">
                <Landmark className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight mt-0.5 truncate">
              {formatCurrency(totalBankBalance, profile.currency)}
            </h3>
            <p className="text-[10px] text-blue-200/80 mt-0.5 truncate">
              {banks.length} {banks.length === 1 ? 'Account' : 'Accounts'}
            </p>
          </div>

          {/* Quick Bank Actions (Symmetrical 2-column grid to prevent any text wrapping) */}
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            <button
              onClick={onOpenAddBankMoney}
              className="py-1.5 px-1 rounded-xl bg-white text-blue-700 font-black text-[10.5px] sm:text-[11px] shadow-2xs active:scale-95 transition flex items-center justify-center gap-1 min-w-0"
              title="Deposit money"
            >
              <Plus className="w-3 h-3 shrink-0 stroke-[3]" />
              <span className="truncate">Deposit</span>
            </button>
            <button
              onClick={onOpenBanks}
              className="py-1.5 px-1 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-[10.5px] sm:text-[11px] transition flex items-center justify-center min-w-0"
              title="View & manage banks"
            >
              <span className="truncate">Banks</span>
            </button>
          </div>
        </div>

        {/* BOX 2: Pocket Cash Card */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[142px]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500">
                Pocket Cash
              </span>
              <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight mt-0.5 truncate">
              {formatCurrency(todayPocketRemaining, profile.currency)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              Cash in Hand Left
            </p>
          </div>

          {/* Quick Cash Action: Cash In & Edit (Fixed size, numbers small, no overflow!) */}
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            <button
              onClick={onOpenAddCash}
              className="py-1.5 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[10.5px] sm:text-[11px] shadow-2xs transition flex items-center justify-center gap-1 min-w-0"
              title="Add received cash to pocket"
            >
              <Plus className="w-3 h-3 shrink-0 stroke-[3]" />
              <span className="truncate">Cash In</span>
            </button>
            <button
              onClick={onOpenDailyCheckin}
              className="py-1.5 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[10.5px] sm:text-[11px] transition flex items-center justify-center min-w-0"
              title="Set or adjust starting pocket cash"
            >
              <span className="truncate">Set / Edit</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. SEGMENTED APP TABS (iOS Pill Switcher) */}
      <div className="flex p-1 rounded-2xl bg-slate-200/80">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
            activeTab === 'overview'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Expenses</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
            activeTab === 'savings'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>Savings</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
            activeTab === 'analytics'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Reports</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {/* 1. EXPENSES TAB (With Expense Form, Interactive Pie Chart, and Feed) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Real-time Category Breakdown Pie Chart directly on Summary! */}
          <ExpensePieChart
            expenses={expenses}
            currency={profile.currency}
          />

          {/* Add New Expense Form */}
          <ExpenseForm
            currency={profile.currency}
            banks={banks}
            todayPocketRemaining={todayPocketRemaining}
            frequentReasons={frequentReasons}
            onAddExpense={onAddExpense}
          />

          {/* Spacious Transaction Feed */}
          <ExpenseList
            expenses={expenses}
            inflows={inflows}
            currency={profile.currency}
            onDeleteExpense={onDeleteExpense}
            onDeleteInflow={onDeleteInflow}
          />
        </div>
      )}

      {/* 2. SAVINGS */}
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

      {/* 3. REPORTS */}
      {activeTab === 'analytics' && (
        <AnalyticsCharts
          currency={profile.currency}
          startingPocketMoney={startingPocketMoney}
          todayCashSpent={todayCashExpenses}
          todayCardSpent={todayCardExpenses}
          todayPocketRemaining={todayPocketRemaining}
          expenses={expenses}
          inflows={inflows}
        />
      )}

    </div>
  );
}
