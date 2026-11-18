import React from 'react';
import { Settings, User, Users, LogOut } from 'lucide-react';
import { sound } from '../utils/sound';

export default function Navbar({
  profile,
  onOpenSettings,
  onSwitchProfile,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: User Profile & Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/20 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Welcome back
            </p>
            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight leading-tight truncate max-w-[150px]">
              {profile.name || 'User'}
            </h2>
          </div>
        </div>

        {/* Right: Switch Profile & Settings Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Switch Profile / Log Out */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSwitchProfile();
            }}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 flex items-center justify-center transition active:scale-95"
            title="Switch Profile / Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Settings & Profile */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 flex items-center justify-center transition active:scale-95"
            title="Settings & Profile"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
