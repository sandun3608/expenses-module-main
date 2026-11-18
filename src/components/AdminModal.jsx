import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Trash2, KeyRound, User, Users, AlertCircle, Check } from 'lucide-react';
import { storage, formatCurrency } from '../utils/storage';
import { sound } from '../utils/sound';

export default function AdminModal({
  isOpen,
  onClose,
  users = [],
  onDeleteUser,
  onReloadUsers,
}) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password change state
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [newAdminPw, setNewAdminPw] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (storage.verifyAdminPassword(password)) {
      sound.playSuccess();
      setIsAuthenticated(true);
      setError('');
    } else {
      sound.playClick();
      setError('Incorrect admin password. Please try again.');
    }
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete user "${userName}" and all their accounts and data?`)) {
      sound.playClick();
      onDeleteUser(userId);
      setSuccessMsg(`User "${userName}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 2000);
    }
  };

  const handleResetPin = (userId, userName) => {
    if (window.confirm(`Reset PIN for "${userName}" to default "0000"?`)) {
      storage.updateUser(userId, { pin: '0000' });
      sound.playSuccess();
      onReloadUsers();
      setSuccessMsg(`PIN for "${userName}" reset to 0000.`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newAdminPw.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    storage.setAdminPassword(newAdminPw);
    sound.playSuccess();
    setSuccessMsg('Admin password changed successfully!');
    setIsChangingPw(false);
    setNewAdminPw('');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">
                Admin Portal
              </h3>
              <p className="text-[11px] text-slate-400">System Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center mb-3">
            {successMsg}
          </div>
        )}

        {/* 1. PASSWORD AUTH SCREEN */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4 py-2">
            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Enter Admin Password</p>
              <p className="text-xs text-slate-400 mt-0.5">Enter security password to access system controls</p>
            </div>

            <div>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-base font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
              {error && <p className="text-xs text-rose-500 font-semibold text-center mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-98"
            >
              Unlock Admin Portal
            </button>
          </form>
        ) : (
          /* 2. ADMIN DASHBOARD */
          <div className="space-y-4">
            
            {/* Quick Stats Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-200">Total Registered Users</p>
                <h4 className="text-2xl font-black mt-0.5">{users.length}</h4>
              </div>
              <Users className="w-8 h-8 text-indigo-200/80" />
            </div>

            {/* Users List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Manage User Accounts
              </h4>

              {users.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No users registered yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400 m-auto mt-2" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            PIN: •••• | {u.expenses?.length || 0} expenses
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Reset PIN */}
                        <button
                          onClick={() => handleResetPin(u.id, u.name)}
                          className="px-2 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition"
                          title="Reset PIN to 0000"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset PIN</span>
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete user account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change Admin Password Section */}
            <div className="pt-3 border-t border-slate-100">
              {isChangingPw ? (
                <form onSubmit={handleChangePassword} className="space-y-2 p-3 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-700">Change Admin Password:</p>
                  <input
                    type="password"
                    required
                    value={newAdminPw}
                    onChange={(e) => setNewAdminPw(e.target.value)}
                    placeholder="New admin password"
                    className="w-full p-2 text-xs font-bold rounded-xl bg-white border border-slate-200 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                    >
                      Save Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPw(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsChangingPw(true)}
                  className="w-full py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                >
                  Change Admin Password
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
