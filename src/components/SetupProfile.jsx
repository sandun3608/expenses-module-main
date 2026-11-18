import React, { useState } from 'react';
import { User, Sparkles, ArrowRight, Camera, Upload, Check } from 'lucide-react';
import { DEFAULT_AVATARS } from '../utils/storage';
import { sound } from '../utils/sound';

export default function SetupProfile({ initialProfile, onNext }) {
  const [name, setName] = useState(initialProfile.name || '');
  const [avatar, setAvatar] = useState(initialProfile.avatar || DEFAULT_AVATARS[0]);
  const [currency, setCurrency] = useState(initialProfile.currency || 'Rs.');
  const [error, setError] = useState('');

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          setError('');
          sound.playClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to get started');
      return;
    }
    sound.playSuccess();
    onNext({
      name: name.trim(),
      avatar,
      currency,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Step Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Step 1 of 2: Profile Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">SmartPocket</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let’s personalize your daily expense tracking experience.
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5 border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Preview & Selection */}
            <div className="text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Choose Your Profile Picture
              </label>

              {/* Active Avatar Large Preview */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 shadow-lg shadow-blue-500/25">
                  <img
                    src={avatar}
                    alt="Selected Avatar"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 cursor-pointer transition active:scale-95"
                  title="Upload custom image"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Avatars Grid */}
              <p className="text-xs text-slate-400 mb-2.5">Or select a ready-made avatar:</p>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {DEFAULT_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(url);
                      sound.playClick();
                    }}
                    className={`relative w-11 h-11 rounded-full p-0.5 transition-all ${
                      avatar === url
                        ? 'ring-2 ring-blue-600 scale-110 shadow-md shadow-blue-500/30'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {avatar === url && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-rose-500 font-medium mt-1.5">{error}</p>}
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Preferred Currency Symbol
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
                        ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Continue to Bank Setup</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>
        </div>

        {/* Footer info note */}
        <p className="text-center text-xs text-slate-400 mt-4">
          You can edit your profile details at any time from Settings.
        </p>
      </div>
    </div>
  );
}
