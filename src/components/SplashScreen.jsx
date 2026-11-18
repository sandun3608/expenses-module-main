import React, { useEffect, useState } from 'react';
import { PiggyBank, Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 180);
          return 100;
        }
        return prev + 18;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-800 overflow-hidden animate-in fade-in duration-200">
      
      {/* Soft ambient light blue glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center max-w-xs w-full px-6 text-center z-10">
        
        {/* Floating Glowing Piggy Logo in Clean Blue & Pink Accent */}
        <div className="relative mb-5">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 animate-pulse">
            <PiggyBank className="w-9 h-9 stroke-[2.2]" />
          </div>
          
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-0.5">
          Exchange Manager
        </h1>
        <p className="text-xs font-bold text-slate-400 mb-6">
          Daily Finance & Vault
        </p>

        {/* Clean Light Blue Progress Bar */}
        <div className="w-44 h-1.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest mt-3">
          Loading...
        </span>

      </div>
    </div>
  );
}
