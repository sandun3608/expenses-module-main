import React from 'react';
import { Wallet, Landmark, Settings, Sun, PlusCircle, User } from 'lucide-react';
import { formatCurrency } from '../utils/storage';

export default function Navbar({
  profile,
  totalBankBalance,
  todayPocketRemaining,
  onOpenS1Banks,
  onOpenAddBankMoney,
  onOpenDailyCheckin,
  onOpenSettings,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-800">
              SmartPocket
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Quick S1 Banks Button */}
            <button
              onClick={onOpenS1Banks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm transition active:scale-95"
              title="Bank accounts (S1)"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>S1 Banks</span>
            </button>

            {/* Quick Deposit '+' Button */}
            <button
              onClick={onOpenAddBankMoney}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
              title="Deposit money"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>

            {/* Daily Pocket Checkin */}
            <button
              onClick={onOpenDailyCheckin}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Change today's pocket cash"
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </button>

            {/* Profile Avatar / Settings */}
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition ml-1 flex items-center justify-center bg-slate-100"
              title="Settings & Profile"
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
