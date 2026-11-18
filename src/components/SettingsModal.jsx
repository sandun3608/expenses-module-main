import React, { useState, useRef } from 'react';
import { X, User, Camera, Image as ImageIcon, Volume2, VolumeX, Download, Upload, Trash2 } from 'lucide-react';
import { storage, getTodayDateKey } from '../utils/storage';
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
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [currency, setCurrency] = useState(profile.currency || 'Rs.');
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [toastMsg, setToastMsg] = useState('');

  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFileChange = (e) => {
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
      avatar: avatar || '',
      currency,
    };
    onUpdateProfile(updated);
    sound.playSuccess();
    setToastMsg('Profile saved successfully!');
    setTimeout(() => {
      setToastMsg('');
      onClose();
    }, 800);
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
            alert('Invalid backup file');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all data and start fresh? This cannot be undone.')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-lg">
            Profile & Settings
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toastMsg && (
          <div className="mt-3 p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center">
            {toastMsg}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          
          {/* Avatar Photo (Gallery & Camera ONLY) */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex items-center gap-1.5 border border-blue-200"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>
            </div>

            <input ref={galleryRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <input ref={cameraRef} type="file" accept="image/*" capture="user" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Rs.', 'LKR', '$', '€'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setCurrency(sym)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    currency === sym
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
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
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-98"
          >
            Save Profile
          </button>
        </form>

        {/* Options */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="text-xs font-bold text-slate-700">Sound Effects</span>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                soundEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Backup & Restore */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <label className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-xl text-rose-500 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All App Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}
