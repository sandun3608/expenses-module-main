import React from 'react';
import { Wallet, Landmark, Settings, Sun, PlusCircle, PiggyBank } from 'lucide-react';
import { formatCurrency, DEFAULT_AVATARS } from '../utils/storage';

export default function Navbar({
  profile,
  totalBankBalance,
  todayPocketRemaining,
  totalSavedMoney = 0,
  onOpenS1Banks,
  onOpenAddBankMoney,
  onOpenDailyCheckin,
  onOpenSettings,
  onOpenSavings,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                  SmartPocket
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  Daily
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Expense & Bank Manager
              </p>
            </div>
          </div>

          {/* Center Badges (Desktop/Tablet) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Pocket Cash Pill */}
            <button
              onClick={onOpenDailyCheckin}
              title="Click to adjust today's pocket money"
              className="flex items-center gap-2.5 bg-sky-50/80 hover:bg-sky-100/90 border border-sky-200/60 px-3 py-1.5 rounded-xl transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xs">
                💵
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">
                  Pocket Cash Left
                </p>
                <p className="text-xs sm:text-sm font-bold text-sky-900">
                  {formatCurrency(todayPocketRemaining, profile.currency)}
                </p>
              </div>
            </button>

            {/* Total Bank Balance Pill */}
            <div className="flex items-center gap-2.5 bg-blue-50/80 border border-blue-200/60 px-3 py-1.5 rounded-xl text-left">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                🏦
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                  Total Bank Balance
                </p>
                <p className="text-xs sm:text-sm font-bold text-blue-900">
                  {formatCurrency(totalBankBalance, profile.currency)}
                </p>
              </div>
            </div>

            {/* Total Savings Pill */}
            <button
              onClick={onOpenSavings}
              title="Click to view Savings Goals"
              className="flex items-center gap-2.5 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/60 px-3 py-1.5 rounded-xl transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                🐷
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                  Total Savings Vault
                </p>
                <p className="text-xs sm:text-sm font-bold text-indigo-900">
                  {formatCurrency(totalSavedMoney, profile.currency)}
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Quick S1 Bank Button (Requested by user) */}
            <button
              onClick={onOpenS1Banks}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
              title="View & Manage Bank Accounts (S1)"
            >
              <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>S1</span>
              <span className="hidden sm:inline">Banks</span>
            </button>

            {/* Quick Add Bank Money Button (+) */}
            <button
              onClick={onOpenAddBankMoney}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm border border-blue-200 active:scale-95 transition"
              title="Deposit money to bank"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Deposit</span>
            </button>

            {/* Daily Check-in button */}
            <button
              onClick={onOpenDailyCheckin}
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
              title="Today's Pocket Money check-in"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Pocket Cash</span>
            </button>

            {/* Settings & Profile Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition"
              title="Profile & Settings"
            >
              <img
                src={profile.avatar || DEFAULT_AVATARS[0]}
                alt={profile.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-blue-200 ring-2 ring-blue-500/20"
              />
              <Settings className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
