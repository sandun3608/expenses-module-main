import React, { useEffect, useState } from 'react';
import { PiggyBank, Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white overflow-hidden animate-in fade-in duration-300">
      
      {/* Ambient background glow discs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center max-w-xs w-full px-6 text-center z-10">
        
        {/* Floating Glowing Piggy Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_15px_35px_rgba(244,63,94,0.4)] animate-pulse">
            <PiggyBank className="w-10 h-10 stroke-[2.2]" />
          </div>
          
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500/80 backdrop-blur-xs flex items-center justify-center text-amber-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          Exchange Manager
        </h1>
        <p className="text-xs font-semibold text-slate-400 mb-8">
          Personal Finance & Expense Vault
        </p>

        {/* Sleek Progress Bar */}
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">
          Loading Vault...
        </span>

      </div>
    </div>
  );
}
