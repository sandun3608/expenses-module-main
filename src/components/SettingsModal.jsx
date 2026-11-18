import React, { useState } from 'react';
import { X, User, Camera, Check, Volume2, VolumeX, Download, Upload, Trash2, Database, Sparkles } from 'lucide-react';
import { DEFAULT_AVATARS, storage, getTodayDateKey, getYesterdayDateKey } from '../utils/storage';
import { sound } from '../utils/sound';

export default function SettingsModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onReloadAllData,
}) {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar || DEFAULT_AVATARS[0]);
  const [currency, setCurrency] = useState(profile.currency || 'Rs.');
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [toastMsg, setToastMsg] = useState('');

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          sound.playClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const updated = {
      ...profile,
      name: name.trim(),
      avatar,
      currency,
    };
    onUpdateProfile(updated);
    sound.playSuccess();
    setToastMsg('Profile updated successfully!');
    setTimeout(() => {
      setToastMsg('');
      onClose();
    }, 900);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.toggle(next);
    if (next) sound.playClick();
  };

  const handleExport = () => {
    sound.playClick();
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpocket_backup_${getTodayDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const success = storage.importAllData(reader.result);
          if (success) {
            sound.playSuccess();
            alert('Data restored successfully!');
            onReloadAllData();
            onClose();
          } else {
            alert('Invalid backup file format');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('WARNING: Are you sure you want to delete ALL data and start fresh from the initial setup? This cannot be undone.')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100 p-5 sm:p-7">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Edit Profile & Settings
              </h3>
              <p className="text-xs text-slate-500">Update your details and manage data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toastMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center">
            {toastMsg}
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="mt-5 space-y-5">
          
          {/* Avatar selector */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-sky-400 shadow-md">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <label
                htmlFor="settings-avatar-upload"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-blue-700"
              >
                <Camera className="w-3.5 h-3.5" />
              </label>
              <input
                id="settings-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {DEFAULT_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-9 h-9 rounded-full p-0.5 transition ${
                    avatar === url ? 'ring-2 ring-blue-600 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Currency input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Currency Symbol
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Rs.', 'LKR', '$', '€'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setCurrency(sym)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    currency === sym
                      ? 'bg-blue-50 text-blue-700 border-blue-400'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition active:scale-98"
          >
            Save Profile Changes
          </button>
        </form>

        {/* Extra Settings Options */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-700">Audio Feedback</p>
                <p className="text-[10px] text-slate-400">Pleasant clicks & chimes</p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                soundEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Backup / Export / Import */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <label className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {/* Reset App */}
          <button
            onClick={handleReset}
            className="w-full p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset App & Start Over</span>
          </button>

        </div>

      </div>
    </div>
  );
}
