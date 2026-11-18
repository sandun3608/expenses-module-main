import React, { useState } from 'react';
import { PiggyBank, Search, Plus, Shield, User, Lock, ArrowRight, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

export default function ProfileSelectScreen({
  users = [],
  onSelectUser,
  onCreateNew,
  onOpenAdmin,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex justify-center items-center p-3 sm:p-5 overflow-x-hidden relative">
      
      {/* Ambient background glow shades for depth */}
      <div className="absolute top-10 -left-16 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-16 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      {/* Main Native App Container with alluring shadow & soft borders */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] border border-white/80 flex flex-col p-5 sm:p-6 min-h-[92vh] sm:min-h-[88vh] relative z-10">
        
        {/* Top Header: Brand & Admin Button */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            {/* Glowing Piggy Logo Icon */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(244,63,94,0.38)]">
              <PiggyBank className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                Exchange Manager
              </h1>
              <p className="text-[11px] font-bold text-slate-400">
                Daily Finance & Expenses
              </p>
            </div>
          </div>

          {/* Admin Portal Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/70 text-slate-600 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
            title="Open Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin</span>
          </button>
        </header>

        {/* Welcome Section */}
        <div className="my-5">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-[10.5px] font-black uppercase tracking-wider mb-2 shadow-2xs">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Personal Accounts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Who is logging in today?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your profile and enter your 4-digit security PIN
          </p>
        </div>

        {/* Search Bar */}
        {users.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition"
            />
          </div>
        )}

        {/* Profile List / Empty State */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
          {users.length === 0 ? (
            /* Modern Inviting Empty State */
            <div className="my-auto py-10 px-5 bg-gradient-to-b from-white to-slate-50/80 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center mb-3.5 shadow-lg shadow-pink-500/25">
                <PiggyBank className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="font-black text-slate-800 text-lg">
                Welcome to Exchange Manager
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Take control of your daily pocket money, bank balances, expenses, and savings goals. Create your personal account to get started!
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onCreateNew();
                }}
                className="mt-6 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)] inline-flex items-center gap-2 transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Your Account</span>
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No profiles matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectUser(u);
                  }}
                  className="w-full p-3.5 bg-white hover:bg-blue-50/40 rounded-2xl border border-slate-100 hover:border-blue-200/80 shadow-[0_4px_18px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group active:scale-[0.98] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Glowing Avatar Ring */}
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 shadow-sm shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                        {u.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-0.5">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span>4-Digit PIN Protected</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Circle Indicator */}
                  <div className="w-9 h-9 rounded-2xl bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25 flex items-center justify-center transition-all duration-200 shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Button: Create New Profile */}
        {users.length > 0 && (
          <div className="pt-4 mt-auto">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onCreateNew();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-[0_12px_28px_-6px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Profile</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
