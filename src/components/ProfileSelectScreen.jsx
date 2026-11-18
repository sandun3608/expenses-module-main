import React, { useState } from 'react';
import { PiggyBank, Search, Plus, Shield, User, Lock, ArrowRight, UserPlus, Sparkles, KeyRound, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

export default function ProfileSelectScreen({
  users = [],
  onSelectUser,
  onCreateNew,
  onOpenAdmin,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Primary active or first user to highlight
  const primaryUser = users.length > 0 ? users[0] : null;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center p-3 sm:p-5 overflow-x-hidden relative selection:bg-blue-500 selection:text-white">
      
      {/* 1. ARTISTIC BACKGROUND DESIGN */}
      {/* Ambient gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pointer-events-none" />
      
      {/* Glowing colorful blur orbs */}
      <div className="absolute top-12 left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 translate-x-1/2 w-96 h-96 rounded-full bg-pink-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

      {/* Modern micro-grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* 2. MAIN NATIVE APP CONTAINER (Modern Glass Card) */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.45)] border border-white/80 flex flex-col p-5 sm:p-7 min-h-[90vh] sm:min-h-[85vh] relative z-10">
        
        {/* Top Header: Brand Logo & Admin Access */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(244,63,94,0.35)]">
              <PiggyBank className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                Exchange Manager
              </h1>
              <p className="text-[11px] font-bold text-slate-400">
                Daily Finance & Vault
              </p>
            </div>
          </div>

          {/* Admin Button on Top Right */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-slate-700 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
            title="Open Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin</span>
          </button>
        </header>

        {/* 3. PROMINENT USER ACCOUNT DISPLAY ("kelinma dm mn account ekk haduwane mawa pennna ona") */}
        {users.length > 0 ? (
          <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
            
            {/* Featured Profile Hero Card */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-black uppercase tracking-wider shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Your Account</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {users.length} {users.length === 1 ? 'Profile' : 'Profiles'} Registered
                </span>
              </div>

              {/* Main Prominent User Card */}
              {primaryUser && (
                <div
                  onClick={() => {
                    sound.playClick();
                    onSelectUser(primaryUser);
                  }}
                  className="group relative cursor-pointer overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-[0_15px_35px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.4)] transition-all duration-300 active:scale-[0.98]"
                >
                  {/* Subtle inner background glow */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-4 relative z-10">
                    {/* Big Avatar with Glowing Ring */}
                    <div className="p-1 rounded-full bg-white/20 backdrop-blur-md shadow-md shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/90 flex items-center justify-center">
                        {primaryUser.avatar ? (
                          <img
                            src={primaryUser.avatar}
                            alt={primaryUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200">
                        Welcome Back
                      </span>
                      <h3 className="text-xl font-black tracking-tight truncate leading-tight mt-0.5">
                        {primaryUser.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-blue-100/90 font-bold mt-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tap to Unlock with PIN</span>
                      </div>
                    </div>

                    {/* Arrow Button */}
                    <div className="w-10 h-10 rounded-2xl bg-white/20 group-hover:bg-white group-hover:text-blue-600 text-white flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs">
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* If more than 1 user, show searchable list below */}
            {users.length > 1 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Switch / Other Profiles
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search profiles..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                {/* Other Profiles List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-0.5">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onSelectUser(u);
                      }}
                      className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between transition group text-left active:scale-98"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-white">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400 m-auto mt-2" />
                          )}
                        </div>
                        <span className="text-xs font-black text-slate-800 truncate">
                          {u.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 flex items-center gap-1">
                        <span>Unlock</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom: Add Another Account */}
            <div className="pt-3 border-t border-slate-100 mt-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onCreateNew();
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-black text-xs transition flex items-center justify-center gap-2 border border-slate-200/80"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Another Account</span>
              </button>
            </div>

          </div>
        ) : (
          /* Empty State (When no accounts have been created yet) */
          <div className="my-auto py-12 px-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-[0_12px_30px_rgba(244,63,94,0.35)]">
              <PiggyBank className="w-10 h-10 stroke-[2]" />
            </div>

            <h3 className="font-black text-slate-900 text-xl tracking-tight">
              Welcome to Exchange Manager
            </h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Manage your daily pocket cash, bank balances, expenses, and savings goals securely with 4-digit PIN protection.
            </p>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onCreateNew();
              }}
              className="mt-7 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-[0_12px_28px_rgba(37,99,235,0.4)] inline-flex items-center gap-2.5 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Your Profile</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
