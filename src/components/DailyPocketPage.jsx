import React, { useState } from 'react';
import { Sun, CloudSun, Moon, Wallet, ArrowRight, History, User } from 'lucide-react';
import { sound } from '../utils/sound';
import { formatCurrency } from '../utils/storage';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: Sun, color: 'text-amber-500' };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: CloudSun, color: 'text-sky-500' };
    return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

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
      setError('Please enter a valid amount');
      return;
    }
    sound.playSuccess();
    onProceed(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        
        {/* User Profile & Greeting */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg shadow-blue-500/10 bg-slate-200 flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
            <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
            <span>{greeting.text}, {profile.name || 'Friend'}!</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            Today's Pocket Money
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            How much cash do you have with you today?
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Big Amount Field */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-black text-xl">
                  {profile.currency || 'Rs.'}
                </span>
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
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-2xl sm:text-3xl font-black text-slate-800 outline-none text-center transition"
                />
              </div>
              {error && <p className="text-xs text-rose-500 font-semibold text-center mt-1.5">{error}</p>}
            </div>

            {/* Yesterday Leftover Button (User requirement) */}
            {yesterdayLeftover > 0 && (
              <button
                type="button"
                onClick={handleUseYesterday}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 flex items-center justify-between text-xs font-bold transition active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <span>Yesterday's Leftover:</span>
                </div>
                <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-lg text-xs font-black shadow-xs">
                  {formatCurrency(yesterdayLeftover, profile.currency)}
                </span>
              </button>
            )}

            {/* Quick Add Chips */}
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-bold text-xs border border-slate-200 transition active:scale-95"
                >
                  +{amt}
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
