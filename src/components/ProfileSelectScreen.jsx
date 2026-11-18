import React, { useState } from 'react';
import { PiggyBank, Search, Plus, Shield, User, Lock, ArrowRight, UserPlus } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-100 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl border-x border-slate-200/60 flex flex-col p-5">
        
        {/* Top Header with App Name, Piggy Icon, and Admin Badge */}
        <header className="flex items-center justify-between pb-4 pt-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>Exchange Manager</span>
                <span className="text-sm">🐷</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400">Daily Finance & Expenses</p>
            </div>
          </div>

          {/* Admin Button on Top */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
            title="Open Admin Portal"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </header>

        {/* Title & Subtitle */}
        <div className="my-5">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Who is using the app?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your profile or create a new account to continue
          </p>
        </div>

        {/* Search Bar */}
        {users.length > 0 && (
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition shadow-2xs"
            />
          </div>
        )}

        {/* Profile Grid / List */}
        <div className="flex-1 space-y-3">
          {users.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-2xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-3">
                <PiggyBank className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-800 text-base">No Profiles Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Welcome to Exchange Manager! Create your first account to manage your bank balance, pocket money, and expenses.
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onCreateNew();
                }}
                className="mt-5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create First Profile</span>
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            /* Search not found */
            <div className="text-center py-8 text-slate-400 text-xs">
              No profile matching "{searchQuery}"
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
                  className="w-full p-3.5 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all flex items-center justify-between group active:scale-99 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/20 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {u.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>4-Digit PIN Protected</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action: Create New Profile Button */}
        {users.length > 0 && (
          <div className="pt-4 mt-auto">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onCreateNew();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Profile</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
