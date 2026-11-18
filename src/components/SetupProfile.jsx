import React, { useState, useRef } from 'react';
import { User, Camera, Image as ImageIcon, ArrowRight, X, Trash2, Check } from 'lucide-react';
import { sound } from '../utils/sound';

export default function SetupProfile({ initialProfile, onNext }) {
  const [name, setName] = useState(initialProfile.name || '');
  const [avatar, setAvatar] = useState(initialProfile.avatar || '');
  const [currency, setCurrency] = useState(initialProfile.currency || 'Rs.');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    sound.playSuccess();
    onNext({
      name: name.trim(),
      avatar: avatar || '',
      currency,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        
        {/* Simple Minimal Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Create Your Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add your name and photo to get started
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photo Section: Gallery & Camera ONLY (No default avatars!) */}
            <div className="text-center">
              
              {/* Profile Photo Preview */}
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar('');
                      sound.playClick();
                    }}
                    className="absolute top-0 right-0 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dual Action Buttons: Gallery & Camera */}
              <div className="flex items-center justify-center gap-3">
                {/* 1. Choose from Gallery */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-2 border border-blue-200 transition active:scale-95"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose from Gallery</span>
                </button>

                {/* 2. Take Photo with Camera */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </div>

              {/* Hidden File Inputs */}
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

              <p className="text-[11px] text-slate-400 mt-2">
                JPG, PNG or WebP (max 5MB)
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-800 text-base font-semibold outline-none transition"
                autoFocus
              />
              {error && <p className="text-xs text-rose-500 font-semibold mt-1.5">{error}</p>}
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                    className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                      currency === sym
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
