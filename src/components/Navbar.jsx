import React from 'react';
import { Settings, User } from 'lucide-react';

export default function Navbar({
  profile,
  onOpenSettings,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: User Profile & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/20 bg-slate-100 flex items-center justify-center shrink-0 shadow-xs">
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
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Welcome back
            </p>
            <h2 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight leading-tight truncate max-w-[170px]">
              {profile.name || 'SmartPocket'}
            </h2>
          </div>
        </div>

        {/* Right: Single clean Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 flex items-center justify-center transition active:scale-95"
          title="Settings & Profile"
        >
          <Settings className="w-5 h-5" />
        </button>

      </div>
    </header>
  );
}
