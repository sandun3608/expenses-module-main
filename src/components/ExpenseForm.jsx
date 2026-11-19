import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Wallet, CreditCard, Sparkles, AlertCircle, User, Calendar, HandCoins, Receipt } from 'lucide-react';
import { CATEGORIES, formatCurrency, getTodayDateKey, formatDisplayDate } from '../utils/storage';
import { sound } from '../utils/sound';

export default function ExpenseForm({
  currency = 'Rs.',
  banks = [],
  todayPocketRemaining = 0,
  frequentReasons = [],
  onAddExpense,
}) {
  const todayKey = getTodayDateKey();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayKey);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'card'
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  
  // New fields for Loan & Bills
  const [recipientName, setRecipientName] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const reasonInputRef = useRef(null);
  const suggestionBoxRef = useRef(null);

  const isLoanOrBill = category === 'loan' || category === 'bills';

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
      recipientName: isLoanOrBill ? recipientName.trim() : null,
      dueDate: isLoanOrBill && dueDate ? dueDate : null,
      isSettled: false,
      date: expenseDate || todayKey,
    });

    setAmount('');
    setReason('');
    setRecipientName('');
    setDueDate('');
    setExpenseDate(todayKey);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
          <span>Add Expense</span>
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          Fast Record
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Row 1: Amount & Payment Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Amount Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Amount ({currency})
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
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base font-bold text-slate-800 outline-none transition"
              />
            </div>
          </div>

          {/* Payment Source Toggle */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Payment Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  sound.playClick();
                }}
                className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  paymentMethod === 'cash'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Pocket Cash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card');
                  sound.playClick();
                }}
                className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Bank / Card</span>
              </button>
            </div>
          </div>

        </div>

        {/* If Card Payment: Select Bank */}
        {paymentMethod === 'card' && (
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-900 mb-1.5">
              Deduct from which Bank?
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {banks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBankId(b.id);
                    sound.playClick();
                  }}
                  className={`py-2 px-3 rounded-xl text-left border text-xs font-bold transition whitespace-nowrap ${
                    selectedBankId === b.id
                      ? 'bg-white border-blue-600 text-blue-700 shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span>{b.name || 'Bank'}</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">
                    {formatCurrency(b.balance, currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason / Description with live autocomplete */}
        <div className="relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Reason / Description
          </label>
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
            placeholder="What was this expense for?"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-800 outline-none transition"
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionBoxRef}
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden animate-in fade-in"
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Your Past Reasons</span>
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

        {/* Date: Today (Auto) with optional change for past expenses */}
        <div className="pt-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-500">Date:</span>
              <span className="font-extrabold text-slate-800">
                {expenseDate === todayKey ? 'Today (Auto)' : formatDisplayDate(expenseDate)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowDatePicker((prev) => !prev);
              }}
              className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 underline"
            >
              {showDatePicker ? 'Close' : (expenseDate === todayKey ? '+ Past Date' : 'Change Date')}
            </button>
          </div>

          {showDatePicker && (
            <div className="mt-2 flex items-center gap-2 animate-in fade-in duration-150">
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition"
              />
              {expenseDate !== todayKey && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setExpenseDate(todayKey);
                    setShowDatePicker(false);
                  }}
                  className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs whitespace-nowrap"
                >
                  Set Today
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category Selector Chips */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Category
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
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

        {/* Dynamic Rows when Category is Loan or Bill (User requirement) */}
        {isLoanOrBill && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
              {category === 'loan' ? (
                <>
                  <HandCoins className="w-4 h-4 text-amber-600" />
                  <span>Loan Details (ණයට දුන් විස්තර)</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Bill Due Details (බිල්පත් විස්තර)</span>
                </>
              )}
            </div>

            {/* Row 1: Name (Person / Payee) */}
            <div>
              <label className="block text-[10.5px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                {category === 'loan' ? 'Person Name (Who borrowed)' : 'Bill / Payee Name'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={
                    category === 'loan'
                      ? 'Enter person name (e.g. Kasun)'
                      : 'Enter bill name (e.g. CEB Electricity)'
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Row 2: Due Date */}
            <div>
              <label className="block text-[10.5px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                {category === 'loan' ? 'Repayment Due Date (නැවත දිය යුතු දිනය)' : 'Payment Due Date'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Save Expense</span>
        </button>

      </form>
    </div>
  );
}
