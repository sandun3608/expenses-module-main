import React, { useState } from 'react';
import { X, Landmark, Plus, CreditCard, ArrowRightLeft, History, Edit3, Trash2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { formatCurrency } from '../utils/storage';

export default function BankModal({
  isOpen,
  mode = 'add_money', // 'add_money' or 's1_manager'
  onClose,
  banks,
  currency = 'Rs.',
  onUpdateBanks,
  onAddBankMoney,
  onWithdrawToPocket,
  bankTransactions = [],
}) {
  if (!isOpen) return null;

  // Add money state
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [error, setError] = useState('');

  // S1 Manager Edit state
  const [editingBankId, setEditingBankId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  // Add new bank in S1 Manager
  const [isAddingNewBank, setIsAddingNewBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankBalance, setNewBankBalance] = useState('');

  // ATM Withdrawal state (Bank -> Pocket Money)
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawBankId, setWithdrawBankId] = useState(banks[0]?.id || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const totalBankBalance = banks.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }
    sound.playCash();
    onAddBankMoney({
      bankId: selectedBankId,
      amount: amt,
      note: depositNote.trim() || 'Bank Deposit',
    });
    setDepositAmount('');
    setDepositNote('');
    setError('');
    onClose();
  };

  const handleStartEdit = (bank) => {
    setEditingBankId(bank.id);
    setEditName(bank.name);
    setEditBalance(String(bank.balance));
  };

  const handleSaveEdit = (bankId) => {
    const amt = parseFloat(editBalance);
    const updated = banks.map((b) => {
      if (b.id === bankId) {
        return {
          ...b,
          name: editName.trim() || b.name,
          balance: isNaN(amt) ? b.balance : amt,
        };
      }
      return b;
    });
    sound.playSuccess();
    onUpdateBanks(updated);
    setEditingBankId(null);
  };

  const handleAddNewBankSubmit = (e) => {
    e.preventDefault();
    if (!newBankName.trim()) return;
    const initialAmt = parseFloat(newBankBalance) || 0;
    const newBank = {
      id: `bank-${Date.now()}`,
      name: newBankName.trim(),
      balance: initialAmt,
      color: 'from-blue-600 to-indigo-700',
    };
    sound.playSuccess();
    onUpdateBanks([...banks, newBank]);
    setNewBankName('');
    setNewBankBalance('');
    setIsAddingNewBank(false);
  };

  const handleDeleteBank = (bankId) => {
    if (banks.length <= 1) {
      alert('You need at least 1 active bank account.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this bank account?')) {
      sound.playClick();
      onUpdateBanks(banks.filter((b) => b.id !== bankId));
    }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    const bank = banks.find((b) => b.id === withdrawBankId);
    if (!bank || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    if (amt > bank.balance) {
      setError(`Insufficient balance in ${bank.name} (${formatCurrency(bank.balance, currency)})`);
      return;
    }
    sound.playCash();
    onWithdrawToPocket({
      bankId: withdrawBankId,
      amount: amt,
      note: 'ATM Cash Withdrawal to Pocket',
    });
    setWithdrawAmount('');
    setIsWithdrawing(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              {mode === 'add_money' ? <Plus className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                {mode === 'add_money' ? 'Deposit to Bank' : 'Bank Accounts'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'add_money' ? 'Add funds into one of your banks' : 'Manage your connected bank balances'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Bank Balance Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-blue-200">
              Total Combined Bank Balance
            </p>
            <p className="text-2xl font-extrabold tracking-tight mt-0.5">
              {formatCurrency(totalBankBalance, currency)}
            </p>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            {banks.length} {banks.length === 1 ? 'Bank' : 'Banks'}
          </span>
        </div>

        {/* Content based on Mode */}
        {mode === 'add_money' ? (
          /* Add Money Form */
          <form onSubmit={handleDepositSubmit} className="mt-5 space-y-4">
            {/* Select Bank */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Destination Bank
              </label>
              <div className="space-y-2">
                {banks.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      selectedBankId === b.id
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="bankSelection"
                        value={b.id}
                        checked={selectedBankId === b.id}
                        onChange={() => setSelectedBankId(b.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-700 text-sm">
                      {formatCurrency(b.balance, currency)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Deposit Amount ({currency})
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg font-bold text-slate-800 outline-none"
              />
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(String(amt))}
                    className="flex-1 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Note (optional)
              </label>
              <input
                type="text"
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                placeholder="Deposit note (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm text-slate-700"
              />
            </div>

            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Confirm Deposit & Add to Balance</span>
            </button>
          </form>
        ) : (
          /* S1 Manager View */
          <div className="mt-5 space-y-4">
            
            {/* ATM Withdraw Button Toggle */}
            <div className="flex justify-between items-center bg-sky-50/70 p-3 rounded-2xl border border-sky-100">
              <div>
                <p className="text-xs font-bold text-sky-900">ATM Cash Out to Pocket Money</p>
                <p className="text-[11px] text-sky-700">Deduct from bank and add to today's cash in hand</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawing(!isWithdrawing)}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isWithdrawing ? 'Cancel' : 'Cash Out'}</span>
              </button>
            </div>

            {/* ATM Withdrawal Form */}
            {isWithdrawing && (
              <form onSubmit={handleWithdrawSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                <p className="text-xs font-bold text-slate-700">Withdraw from Bank to Pocket Cash:</p>
                <select
                  value={withdrawBankId}
                  onChange={(e) => setWithdrawBankId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - Available: {formatCurrency(b.balance, currency)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Withdraw Amount (e.g. 5000)"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Withdraw to Pocket Cash
                </button>
              </form>
            )}

            {/* Bank Cards List */}
            <div className="space-y-2.5">
              {banks.map((bank, idx) => (
                <div
                  key={bank.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition"
                >
                  {editingBankId === bank.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 text-sm font-bold rounded-lg border border-blue-400 outline-none"
                        placeholder="Bank Name"
                      />
                      <input
                        type="number"
                        step="any"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className="w-full p-2 text-sm font-bold rounded-lg border border-blue-400 outline-none"
                        placeholder="Current Balance"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(bank.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBankId(null)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bank.color || 'from-blue-600 to-indigo-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm sm:text-base">
                            {bank.name}
                          </p>
                          <p className="text-xs font-extrabold text-blue-600">
                            {formatCurrency(bank.balance, currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(bank)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="Edit bank details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {banks.length > 1 && (
                          <button
                            onClick={() => handleDeleteBank(bank.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Remove bank"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* "+ Add Another Bank" in S1 Manager */}
            {isAddingNewBank ? (
              <form onSubmit={handleAddNewBankSubmit} className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2.5 animate-in fade-in">
                <p className="text-xs font-bold text-blue-900">Add New Bank Account:</p>
                <input
                  type="text"
                  required
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="Bank Name"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newBankBalance}
                  onChange={(e) => setNewBankBalance(e.target.value)}
                  placeholder="Starting Balance (optional)"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Save New Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewBank(false)}
                    className="py-2 px-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNewBank(true)}
                className="w-full py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-dashed border-blue-300 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Bank Account</span>
              </button>
            )}

            {/* Recent Bank Transactions Log */}
            {bankTransactions.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <History className="w-4 h-4" />
                  <span>Recent Bank Activity</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {bankTransactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs border border-slate-100"
                    >
                      <div>
                        <p className="font-bold text-slate-700 truncate max-w-[200px]">{tx.note || tx.bankName}</p>
                        <p className="text-[10px] text-slate-400">{tx.date} • {tx.bankName}</p>
                      </div>
                      <span
                        className={`font-extrabold ${
                          tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-700'
                        }`}
                      >
                        {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
