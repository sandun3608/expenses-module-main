import React, { useState, useEffect } from 'react';
import { X, Lock, Delete, User, AlertCircle, ArrowLeft } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center">
        
        {/* Close / Back */}
        <div className="w-full flex items-center justify-between pb-2 mb-2">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Security PIN
          </span>
          <div className="w-5" />
        </div>

        {/* User Avatar & Name */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-600/30 bg-slate-100 flex items-center justify-center mb-2 shadow-xs">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <h3 className="font-black text-slate-800 text-lg leading-tight truncate max-w-[200px]">
          {user.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Enter 4-Digit PIN</p>

        {/* 4 PIN Dots */}
        <div className={`flex items-center gap-3 my-5 ${isShaking ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-blue-600 scale-110 shadow-xs'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-bold mb-3 text-center">{error}</p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 active:text-blue-600 text-slate-800 font-black text-lg flex items-center justify-center transition border border-slate-100"
            >
              {num}
            </button>
          ))}

          <div />

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 active:text-blue-600 text-slate-800 font-black text-lg flex items-center justify-center transition border border-slate-100"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition border border-slate-100 active:scale-95"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
