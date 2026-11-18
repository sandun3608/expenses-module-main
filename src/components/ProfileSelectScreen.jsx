import React, { useState } from 'react';
import { PiggyBank, Search, Plus, Shield, User, Lock, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
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
    <div className="h-screen max-h-screen bg-slate-100 flex justify-center items-center p-2 sm:p-4 overflow-hidden">
      
      {/* Main Locked Mobile App Frame (No entire page vertical bouncing) */}
      <div className="w-full max-w-md h-full max-h-[96vh] sm:max-h-[660px] bg-white rounded-[32px] shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        
        {/* 1. TOP MODERN BLUE DESIGN HEADER CARD (Centered App Name in Pure White) */}
        <div className="mx-3.5 mt-3.5 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/20 relative shrink-0 text-center">
          
          {/* Circular Admin Button on Top Right (User request) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95 absolute top-3.5 right-3.5 shadow-2xs border border-white/20"
            title="Open Admin Portal"
          >
            <Shield className="w-4 h-4 text-white" />
          </button>

          {/* Centered Piggy Bank Logo Badge */}
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md mb-2">
            <PiggyBank className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* Centered App Name in Pure White */}
          <h1 className="text-xl font-black text-white tracking-tight leading-tight">
            Exchange Manager
          </h1>
          <p className="text-xs font-bold text-blue-100/90 mt-0.5">
            Daily Finance & Expenses
          </p>
        </div>

        {/* 2. MIDDLE CONTENT HEADER: Subtitle & Search (Fixed) */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Profile</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {users.length} {users.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>

          {/* Search Bar (Only shown if more than 1 user) */}
          {users.length > 1 && (
            <div className="relative my-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition"
              />
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE PROFILES AREA ONLY (Only profiles move up and down!) */}
        <div className="flex-1 overflow-y-auto px-4 py-1.5 space-y-2.5">
          {users.length === 0 ? (
            /* Clean Empty State */
            <div className="h-full flex flex-col items-center justify-center py-6 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                <PiggyBank className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">
                No Profiles Found
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                Create your personal account to manage your bank balances, daily cash, and expenses.
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onCreateNew();
                }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5 transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create First Profile</span>
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-bold">
              No profiles matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectUser(u);
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-blue-50/60 rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* User Avatar */}
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-500/20 bg-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                        {u.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 mt-0.5">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span>4-Digit PIN Protected</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Circle Arrow Button */}
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-blue-600 text-slate-400 group-hover:text-white border border-slate-200/80 group-hover:border-blue-600 flex items-center justify-center transition-all shrink-0 ml-2 shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. PINNED BOTTOM ACTION: Create New Profile (Fixed at bottom) */}
        {users.length > 0 && (
          <div className="p-3.5 bg-white border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onCreateNew();
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create New Profile</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
