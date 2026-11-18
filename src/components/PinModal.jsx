import React, { useState, useEffect } from 'react';
import { Lock, Delete, User, ArrowLeft } from 'lucide-react';
import { sound } from '../utils/sound';

export default function PinModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}) {
  if (!isOpen || !user) return null;

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setPin('');
    setError('');
  }, [user]);

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    sound.playClick();
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      if (newPin === user.pin) {
        sound.playSuccess();
        setTimeout(() => {
          onSuccess(user.id);
        }, 150);
      } else {
        setError('Incorrect PIN. Please try again.');
        setIsShaking(true);
        sound.playClick();
        setTimeout(() => {
          setPin('');
          setIsShaking(false);
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    sound.playClick();
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-[32px] max-w-xs w-full p-6 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-white/80 flex flex-col items-center">
        
        {/* Close / Back */}
        <div className="w-full flex items-center justify-between pb-1 mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Security PIN
          </span>
          <div className="w-8" />
        </div>

        {/* User Avatar & Name with Glowing Ring */}
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 shadow-md shadow-blue-500/20 mb-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
        </div>

        <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[200px]">
          {user.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Enter your 4-digit PIN</p>

        {/* 4 PIN Dots */}
        <div className={`flex items-center gap-3.5 my-5 ${isShaking ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-blue-600 scale-125 shadow-md shadow-blue-500/30'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-bold mb-3 text-center">{error}</p>
        )}

        {/* Numeric Keypad with Soft Tactile Buttons */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="h-12 rounded-2xl bg-slate-50/90 hover:bg-slate-100 active:bg-blue-600 active:text-white text-slate-800 font-black text-lg flex items-center justify-center transition border border-slate-100 shadow-2xs active:scale-95 duration-100"
            >
              {num}
            </button>
          ))}

          <div />

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-50/90 hover:bg-slate-100 active:bg-blue-600 active:text-white text-slate-800 font-black text-lg flex items-center justify-center transition border border-slate-100 shadow-2xs active:scale-95 duration-100"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-slate-50/90 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition border border-slate-100 shadow-2xs active:scale-95 duration-100"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
