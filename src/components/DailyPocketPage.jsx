import React, { useState } from 'react';
import { Sun, CloudSun, Moon, Wallet, Sparkles, ArrowRight, History, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { formatCurrency, getTodayDateKey, DEFAULT_AVATARS } from '../utils/storage';

export default function DailyPocketPage({
  profile,
  yesterdayLeftover = 0,
  currentStartingPocket = 0,
  onProceed,
}) {
  const [pocketMoney, setPocketMoney] = useState(
    currentStartingPocket > 0 ? String(currentStartingPocket) : ''
  );
  const [error, setError] = useState('');

  // Determine dynamic greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' };
    }
    if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon', icon: CloudSun, color: 'text-sky-500', bg: 'bg-sky-50' };
    }
    return { text: 'Good evening', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-50' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleQuickAdd = (amt) => {
    sound.playClick();
    const current = parseFloat(pocketMoney) || 0;
    setPocketMoney(String(current + amt));
    setError('');
  };

  const handleUseYesterday = () => {
    sound.playCash();
    setPocketMoney(String(yesterdayLeftover));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(pocketMoney);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid starting pocket money amount');
      return;
    }
    sound.playSuccess();
    onProceed(val);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50/50 to-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        
        {/* User Profile Card Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 shadow-xl shadow-blue-500/20">
              <img
                src={profile.avatar || DEFAULT_AVATARS[0]}
                alt={profile.name || 'User'}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className={`absolute bottom-0 right-0 p-1.5 rounded-full ${greeting.bg} shadow-md border border-white`}>
              <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{todayFormatted}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
            {greeting.text},{' '}
            <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              {profile.name || 'Friend'}!
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ready to track your expenses today? Start with your cash in hand.
          </p>
        </div>

        {/* Pocket Money Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-500/10 border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2">
                <Wallet className="w-6 h-6" />
              </div>
              <label className="block text-sm sm:text-base font-bold text-slate-700">
                Add your starting pocket money
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical cash you have with you today
              </p>
            </div>

            {/* Main Money Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-extrabold text-lg">
                  {profile.currency || 'Rs.'}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  autoFocus
                  required
                  value={pocketMoney}
                  onChange={(e) => {
                    setPocketMoney(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-2xl font-extrabold text-slate-800 outline-none text-center transition"
                />
              </div>
              {error && <p className="text-xs text-rose-500 font-medium text-center mt-1.5">{error}</p>}
            </div>

            {/* Yesterday Leftover Button (User requirement!) */}
            {yesterdayLeftover > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleUseYesterday}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 text-amber-800 flex items-center justify-between text-xs font-bold transition shadow-xs group active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-600 group-hover:rotate-45 transition" />
                    <span>Yesterday's Leftover Balance:</span>
                  </div>
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded-lg text-xs font-extrabold shadow-2xs">
                    {formatCurrency(yesterdayLeftover, profile.currency)}
                  </span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-1">
                  Tap above to carry over yesterday's remaining pocket money
                </p>
              </div>
            )}

            {/* Quick Add Chips */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
                Quick Add Cash
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="py-1.5 px-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-bold text-xs border border-slate-200/60 transition active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Go to Summary Page</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>
        </div>

        {/* Bottom indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Expenses entered later will automatically deduct from this pocket money.</span>
        </div>

      </div>
    </div>
  );
}
