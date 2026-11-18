import React, { useState, useRef } from 'react';
import { User, Camera, Image as ImageIcon, ArrowRight, X, Lock, KeyRound, PiggyBank } from 'lucide-react';
import { sound } from '../utils/sound';

export default function SetupProfile({ initialProfile = {}, onNext, onCancel }) {
  const [name, setName] = useState(initialProfile.name || '');
  const [avatar, setAvatar] = useState(initialProfile.avatar || '');
  const [currency, setCurrency] = useState(initialProfile.currency || 'Rs.');
  const [pin, setPin] = useState(initialProfile.pin || '');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          setError('');
          sound.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePinChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
    if (error) setError('');
  };

  const handleConfirmPinChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(cleaned);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (pin.length !== 4) {
      setError('Please set a 4-digit security PIN (e.g. 1234)');
      return;
    }
    if (confirmPin !== pin) {
      setError('PINs do not match. Please re-enter.');
      return;
    }

    sound.playSuccess();
    onNext({
      name: name.trim(),
      avatar: avatar || '',
      currency,
      pin,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center overflow-x-hidden p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 my-auto">
        
        {/* Simple Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Create Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your details and set a 4-digit PIN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo Section: Gallery & Camera ONLY */}
          <div className="text-center pb-1">
            <div className="relative inline-block mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>

              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatar('');
                    sound.playClick();
                  }}
                  className="absolute top-0 right-0 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition"
                  title="Remove Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dual Action Buttons: Gallery & Camera */}
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition active:scale-95"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Kasun Perera"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-800 text-sm font-semibold outline-none transition"
              autoFocus
            />
          </div>

          {/* 4-Digit Security PIN Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold text-slate-700">
                4-Digit Security PIN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Create PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-center text-lg font-black tracking-widest text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-center text-lg font-black tracking-widest text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              You will use this 4-digit PIN every time you log in
            </p>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Rs.', 'LKR', '$', '€'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    setCurrency(sym);
                    sound.playClick();
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    currency === sym
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 p-2 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          {/* Submit & Cancel Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Continue to Banks Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold transition"
              >
                Back to Profile Selection
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
