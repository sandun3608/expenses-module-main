import React, { useState, useRef } from 'react';
import { X, User, Camera, Image as ImageIcon, Volume2, VolumeX, Download, Upload, Trash2, KeyRound, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/sound';

export default function SettingsModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onDeleteCurrentAccount,
  onReloadAllData,
}) {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [currency, setCurrency] = useState(profile.currency || 'Rs.');
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [toastMsg, setToastMsg] = useState('');

  // Change PIN state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');

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
    setToastMsg('Profile updated successfully!');
    setTimeout(() => {
      setToastMsg('');
      onClose();
    }, 700);
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (oldPin !== profile.pin) {
      setPinError('Current PIN is incorrect');
      return;
    }
    if (newPin.length !== 4) {
      setPinError('New PIN must be exactly 4 digits');
      return;
    }
    onUpdateProfile({
      ...profile,
      pin: newPin,
    });
    sound.playSuccess();
    setToastMsg('PIN changed successfully!');
    setIsChangingPin(false);
    setOldPin('');
    setNewPin('');
    setPinError('');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.toggle(next);
    if (next) sound.playClick();
  };

  const handleDeleteAccount = () => {
    const confirmName = window.prompt(
      `Type your name "${profile.name}" to confirm deleting your account permanently:`
    );
    if (confirmName && confirmName.trim() === profile.name.trim()) {
      sound.playClick();
      onClose();
      onDeleteCurrentAccount(profile.id);
    } else if (confirmName !== null) {
      alert('Name did not match. Account deletion canceled.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-800 text-lg">
              Profile & Settings
            </h3>
            <p className="text-[11px] text-slate-400">Manage your profile and security</p>
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
        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          
          {/* Avatar Photo (Gallery & Camera ONLY) */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
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
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs"
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

          {/* Currency (Only LKR, USD, and Pound) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sym: 'Rs.', label: 'LKR (Rs.)' },
                { sym: '$', label: 'USD ($)' },
                { sym: '£', label: 'Pound (£)' },
              ].map((item) => (
                <button
                  key={item.sym}
                  type="button"
                  onClick={() => setCurrency(item.sym)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    currency === item.sym
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-black'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-98"
          >
            Save Profile Changes
          </button>
        </form>

        {/* Change PIN Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          {isChangingPin ? (
            <form onSubmit={handleChangePin} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change 4-Digit PIN</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-2 py-2 rounded-xl bg-white border border-slate-200 text-center font-bold text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    New PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full px-2 py-2 rounded-xl bg-white border border-slate-200 text-center font-bold text-sm outline-none"
                  />
                </div>
              </div>

              {pinError && (
                <p className="text-[11px] text-rose-500 font-bold text-center">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Update PIN
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsChangingPin(true)}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Change 4-Digit Security PIN</span>
              </div>
              <span className="text-slate-400">••••</span>
            </button>
          )}
        </div>

        {/* Extra Options */}
        <div className="mt-3 space-y-2.5">
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

          {/* User Self-Delete Account Button */}
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Account</span>
          </button>
        </div>

      </div>
    </div>
  );
}
