import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, DollarSign, Tag, CreditCard, Wallet, Sparkles, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { CATEGORIES, formatCurrency } from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseForm({
  currency = 'Rs.',
  banks = [],
  todayPocketRemaining = 0,
  frequentReasons = [],
  onAddExpense,
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const reasonInputRef = useRef(null);
  const suggestionBoxRef = useRef(null);

  // Handle reason typing and filter suggestions
  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    if (val.trim().length > 0) {
      const filtered = frequentReasons.filter((r) =>
        r.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions(frequentReasons.slice(0, 5));
      setShowSuggestions(frequentReasons.length > 0);
    }
  };

  const handleSelectSuggestion = (suggested) => {
    setReason(suggested);
    setShowSuggestions(false);
    sound.playClick();
    
    // Auto-guess category based on keywords
    const lower = suggested.toLowerCase();
    if (lower.includes('tea') || lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('coffee') || lower.includes('snack')) {
      setCategory('food');
    } else if (lower.includes('bus') || lower.includes('train') || lower.includes('ride') || lower.includes('uber') || lower.includes('pickme') || lower.includes('fuel') || lower.includes('petrol')) {
      setCategory('transport');
    } else if (lower.includes('grocery') || lower.includes('market') || lower.includes('supermarket') || lower.includes('keells') || lower.includes('cargills')) {
      setCategory('grocery');
    } else if (lower.includes('bill') || lower.includes('electricity') || lower.includes('water') || lower.includes('reload') || lower.includes('wifi')) {
      setCategory('bills');
    } else if (lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('doctor')) {
      setCategory('health');
    }
  };

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(e.target) &&
        reasonInputRef.current &&
        !reasonInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBank = banks.find((b) => b.id === selectedBankId) || banks[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!reason.trim()) return;

    sound.playSuccess();

    onAddExpense({
      amount: parsedAmount,
      reason: reason.trim(),
      category,
      paymentMethod,
      bankId: paymentMethod === 'card' ? selectedBank?.id : null,
      bankName: paymentMethod === 'card' ? selectedBank?.name : null,
    });

    setAmount('');
    setReason('');
    setShowSuggestions(false);
  };

  const isCashLow = paymentMethod === 'cash' && parseFloat(amount) > todayPocketRemaining;
  const isBankLow = paymentMethod === 'card' && selectedBank && parseFloat(amount) > selectedBank.balance;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-500/5 border border-blue-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h2 className="font-extrabold text-slate-800 text-lg">
            Add Daily Expense
          </h2>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Quick Entry
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Row 1: Amount & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          
          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Price / Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base font-bold text-slate-800 outline-none transition"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Deduct From (Payment Source)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  sound.playClick();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  paymentMethod === 'cash'
                    ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pocket Cash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card');
                  sound.playClick();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Bank / Card</span>
              </button>
            </div>
          </div>

        </div>

        {/* If Card Payment: Select which of the 3 Banks */}
        {paymentMethod === 'card' && (
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/60 animate-in fade-in">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-1">
              Select Bank to Deduct From:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {banks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBankId(b.id);
                    sound.playClick();
                  }}
                  className={`p-2 rounded-xl text-left border transition ${
                    selectedBankId === b.id
                      ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white/70 border-slate-200 hover:bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800 truncate">{b.name}</p>
                  <p className="text-[10px] text-blue-600 font-semibold">
                    {formatCurrency(b.balance, currency)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason / Description with Autocomplete suggestions */}
        <div className="relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Reason / Description (with Smart Suggestion)
          </label>
          <div className="relative">
            <input
              ref={reasonInputRef}
              type="text"
              required
              value={reason}
              onChange={handleReasonChange}
              onFocus={() => {
                if (frequentReasons.length > 0) {
                  setSuggestions(frequentReasons.slice(0, 5));
                  setShowSuggestions(true);
                }
              }}
              placeholder="Enter expense reason..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionBoxRef}
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-blue-100 z-20 py-2 overflow-hidden animate-in fade-in"
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Suggested Past Reasons</span>
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition"
                >
                  <span>{item}</span>
                  <span className="text-[10px] text-blue-500 opacity-60">tap to use</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Selector Chips */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Expense Category
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  sound.playClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                  category === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label.split('&')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Warnings if balance is tight */}
        {isCashLow && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Amount exceeds today's remaining pocket money ({formatCurrency(todayPocketRemaining, currency)}).</span>
          </div>
        )}

        {isBankLow && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Amount exceeds selected bank balance ({formatCurrency(selectedBank.balance, currency)}).</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

      </form>
    </div>
  );
}
