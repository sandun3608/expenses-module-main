import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SetupProfile from './components/SetupProfile';
import SetupBanks from './components/SetupBanks';
import DailyPocketPage from './components/DailyPocketPage';
import SummaryDashboard from './components/SummaryDashboard';
import BankModal from './components/BankModal';
import SettingsModal from './components/SettingsModal';
import { storage, getTodayDateKey } from './utils/storage';

export default function App() {
  // Core persistent state
  const [profile, setProfile] = useState(() => storage.getProfile());
  const [banks, setBanks] = useState(() => storage.getBanks());
  const [dailySessions, setDailySessions] = useState(() => storage.getDailySessions());
  const [expenses, setExpenses] = useState(() => storage.getExpenses());
  const [bankTransactions, setBankTransactions] = useState(() => storage.getBankTransactions());
  const [frequentReasons, setFrequentReasons] = useState(() => storage.getReasons());
  const [savingsGoals, setSavingsGoals] = useState(() => storage.getSavingsGoals());

  // Setup navigation step (if setup not completed)
  // 1 = Profile setup, 2 = Banks setup
  const [setupStep, setSetupStep] = useState(1);

  // Active dashboard tab ('overview' | 'savings' | 'analytics')
  const [activeTab, setActiveTab] = useState('overview');

  // Daily check-in gate state
  const todayKey = getTodayDateKey();
  const todaySession = dailySessions[todayKey];
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);

  // Modals state
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankModalMode, setBankModalMode] = useState('add_money'); // 'add_money' or 's1_manager'
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check if today needs initial pocket money entry
  useEffect(() => {
    if (profile.isSetupCompleted && !todaySession) {
      setShowDailyCheckin(true);
    }
  }, [profile.isSetupCompleted, todaySession]);

  // Sync state helpers
  const handleReloadAllData = () => {
    setProfile(storage.getProfile());
    setBanks(storage.getBanks());
    setDailySessions(storage.getDailySessions());
    setExpenses(storage.getExpenses());
    setBankTransactions(storage.getBankTransactions());
    setFrequentReasons(storage.getReasons());
    setSavingsGoals(storage.getSavingsGoals());
  };

  // 1. Setup Step 1 -> Step 2
  const handleProfileSetupComplete = (newProfileData) => {
    const updated = {
      ...profile,
      ...newProfileData,
    };
    storage.setProfile(updated);
    setProfile(updated);
    setSetupStep(2);
  };

  // 2. Setup Step 2 -> Complete Setup
  const handleBanksSetupComplete = (initialBanks) => {
    const updatedProfile = {
      ...profile,
      isSetupCompleted: true,
    };
    storage.setProfile(updatedProfile);
    storage.setBanks(initialBanks);
    setProfile(updatedProfile);
    setBanks(initialBanks);

    // Open Daily Pocket Money Check-In page directly after setup!
    setShowDailyCheckin(true);
  };

  // 3. Daily Pocket Money Submitted
  const handlePocketMoneySubmit = (startingAmount) => {
    const updatedSessions = {
      ...dailySessions,
      [todayKey]: {
        date: todayKey,
        startingPocketMoney: startingAmount,
        lastLogged: new Date().toISOString(),
      },
    };
    storage.setDailySessions(updatedSessions);
    setDailySessions(updatedSessions);
    setShowDailyCheckin(false);
  };

  // Add Expense
  const handleAddExpense = ({ amount, reason, category, paymentMethod, bankId, bankName }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newExpense = {
      id: 'exp-' + Date.now(),
      amount: Number(amount),
      reason,
      category,
      paymentMethod,
      bankId: paymentMethod === 'card' ? bankId : null,
      bankName: paymentMethod === 'card' ? bankName : null,
      date: todayKey,
      time: timeStr,
      timestamp: Date.now(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    storage.setExpenses(updatedExpenses);
    setExpenses(updatedExpenses);

    // Save reason for autocomplete
    storage.addReason(reason);
    setFrequentReasons(storage.getReasons());

    // If paid via Bank Card, deduct from that Bank's balance!
    if (paymentMethod === 'card' && bankId) {
      const updatedBanks = banks.map((b) => {
        if (b.id === bankId) {
          return {
            ...b,
            balance: Math.max(0, (Number(b.balance) || 0) - Number(amount)),
          };
        }
        return b;
      });
      storage.setBanks(updatedBanks);
      setBanks(updatedBanks);

      // Record bank activity
      const newTx = {
        id: 'tx-' + Date.now(),
        bankId,
        bankName,
        amount: Number(amount),
        type: 'card_expense',
        note: `Card Expense: ${reason}`,
        date: todayKey,
        timestamp: Date.now(),
      };
      const updatedTxs = [newTx, ...bankTransactions];
      storage.setBankTransactions(updatedTxs);
      setBankTransactions(updatedTxs);
    }
  };

  // Delete Expense
  const handleDeleteExpense = (id) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    // If it was a card expense, refund to bank
    if (target.paymentMethod === 'card' && target.bankId) {
      const updatedBanks = banks.map((b) => {
        if (b.id === target.bankId) {
          return {
            ...b,
            balance: (Number(b.balance) || 0) + Number(target.amount),
          };
        }
        return b;
      });
      storage.setBanks(updatedBanks);
      setBanks(updatedBanks);
    }

    const updated = expenses.filter((e) => e.id !== id);
    storage.setExpenses(updated);
    setExpenses(updated);
  };

  // Add money to bank account
  const handleAddBankMoney = ({ bankId, amount, note }) => {
    let targetBankName = '';
    const updatedBanks = banks.map((b) => {
      if (b.id === bankId) {
        targetBankName = b.name;
        return {
          ...b,
          balance: (Number(b.balance) || 0) + Number(amount),
        };
      }
      return b;
    });
    storage.setBanks(updatedBanks);
    setBanks(updatedBanks);

    const newTx = {
      id: 'tx-' + Date.now(),
      bankId,
      bankName: targetBankName,
      amount: Number(amount),
      type: 'deposit',
      note: note || 'Bank Deposit',
      date: todayKey,
      timestamp: Date.now(),
    };
    const updatedTxs = [newTx, ...bankTransactions];
    storage.setBankTransactions(updatedTxs);
    setBankTransactions(updatedTxs);
  };

  // ATM / Bank Withdrawal to Cash (deduct bank, add to today's starting cash)
  const handleWithdrawToPocket = ({ bankId, amount, note }) => {
    let targetBankName = '';
    const updatedBanks = banks.map((b) => {
      if (b.id === bankId) {
        targetBankName = b.name;
        return {
          ...b,
          balance: Math.max(0, (Number(b.balance) || 0) - Number(amount)),
        };
      }
      return b;
    });
    storage.setBanks(updatedBanks);
    setBanks(updatedBanks);

    // Increase today's starting pocket money
    const currentStarting = todaySession?.startingPocketMoney || 0;
    const newStarting = currentStarting + Number(amount);
    const updatedSessions = {
      ...dailySessions,
      [todayKey]: {
        date: todayKey,
        startingPocketMoney: newStarting,
        lastLogged: new Date().toISOString(),
      },
    };
    storage.setDailySessions(updatedSessions);
    setDailySessions(updatedSessions);

    const newTx = {
      id: 'tx-' + Date.now(),
      bankId,
      bankName: targetBankName,
      amount: Number(amount),
      type: 'pocket_transfer',
      note: note || 'ATM Cash Withdrawal',
      date: todayKey,
      timestamp: Date.now(),
    };
    const updatedTxs = [newTx, ...bankTransactions];
    storage.setBankTransactions(updatedTxs);
    setBankTransactions(updatedTxs);
  };

  // Update Banks in bulk from S1 Modal
  const handleUpdateBanks = (updatedBanks) => {
    storage.setBanks(updatedBanks);
    setBanks(updatedBanks);
  };

  // Update Profile
  const handleUpdateProfile = (updatedProfile) => {
    storage.setProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  // --- Savings Module Handlers ---
  const handleAddGoal = (goal) => {
    const updated = [goal, ...savingsGoals];
    storage.setSavingsGoals(updated);
    setSavingsGoals(updated);
  };

  const handleUpdateGoal = (updatedGoal) => {
    const updated = savingsGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
    storage.setSavingsGoals(updated);
    setSavingsGoals(updated);
  };

  const handleDeleteGoal = (goalId) => {
    const updated = savingsGoals.filter((g) => g.id !== goalId);
    storage.setSavingsGoals(updated);
    setSavingsGoals(updated);
  };

  const handleDepositToGoal = ({ goalId, amount, source, bankId }) => {
    // 1. Deduct from source
    if (source === 'pocket') {
      const currentStarting = todaySession?.startingPocketMoney || 0;
      const updatedStarting = Math.max(0, currentStarting - Number(amount));
      const updatedSessions = {
        ...dailySessions,
        [todayKey]: {
          ...todaySession,
          startingPocketMoney: updatedStarting,
        },
      };
      storage.setDailySessions(updatedSessions);
      setDailySessions(updatedSessions);
    } else if (source === 'bank' && bankId) {
      let targetBankName = '';
      const updatedBanks = banks.map((b) => {
        if (b.id === bankId) {
          targetBankName = b.name;
          return {
            ...b,
            balance: Math.max(0, (Number(b.balance) || 0) - Number(amount)),
          };
        }
        return b;
      });
      storage.setBanks(updatedBanks);
      setBanks(updatedBanks);

      // Record bank activity
      const newTx = {
        id: 'tx-' + Date.now(),
        bankId,
        bankName: targetBankName,
        amount: Number(amount),
        type: 'savings_deposit',
        note: `Transferred to Savings Goal`,
        date: todayKey,
        timestamp: Date.now(),
      };
      const updatedTxs = [newTx, ...bankTransactions];
      storage.setBankTransactions(updatedTxs);
      setBankTransactions(updatedTxs);
    }

    // 2. Add to Savings Goal
    const updatedGoals = savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: (Number(g.currentAmount) || 0) + Number(amount),
        };
      }
      return g;
    });
    storage.setSavingsGoals(updatedGoals);
    setSavingsGoals(updatedGoals);
  };

  const handleWithdrawFromGoal = ({ goalId, amount, destination, bankId }) => {
    // 1. Add back to destination
    if (destination === 'pocket') {
      const currentStarting = todaySession?.startingPocketMoney || 0;
      const updatedStarting = currentStarting + Number(amount);
      const updatedSessions = {
        ...dailySessions,
        [todayKey]: {
          ...todaySession,
          startingPocketMoney: updatedStarting,
        },
      };
      storage.setDailySessions(updatedSessions);
      setDailySessions(updatedSessions);
    } else if (destination === 'bank' && bankId) {
      let targetBankName = '';
      const updatedBanks = banks.map((b) => {
        if (b.id === bankId) {
          targetBankName = b.name;
          return {
            ...b,
            balance: (Number(b.balance) || 0) + Number(amount),
          };
        }
        return b;
      });
      storage.setBanks(updatedBanks);
      setBanks(updatedBanks);

      const newTx = {
        id: 'tx-' + Date.now(),
        bankId,
        bankName: targetBankName,
        amount: Number(amount),
        type: 'savings_withdrawal',
        note: `Withdrawn from Savings Goal to Bank`,
        date: todayKey,
        timestamp: Date.now(),
      };
      const updatedTxs = [newTx, ...bankTransactions];
      storage.setBankTransactions(updatedTxs);
      setBankTransactions(updatedTxs);
    }

    // 2. Deduct from Savings Goal
    const updatedGoals = savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Math.max(0, (Number(g.currentAmount) || 0) - Number(amount)),
        };
      }
      return g;
    });
    storage.setSavingsGoals(updatedGoals);
    setSavingsGoals(updatedGoals);
  };

  // Calculations for today
  const startingPocketMoney = todaySession?.startingPocketMoney || 0;
  const todayCashExpenses = expenses
    .filter((e) => e.date === todayKey && e.paymentMethod === 'cash')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayPocketRemaining = Math.max(0, startingPocketMoney - todayCashExpenses);
  const totalBankBalance = banks.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const totalSavedMoney = savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);

  // Yesterday's leftover pocket money
  const yesterdayLeftover = storage.getYesterdayLeftover();

  // -------------------------------------------------------------
  // ROUTE 1: First-Time Setup (Page 1 & Page 2)
  // -------------------------------------------------------------
  if (!profile.isSetupCompleted) {
    if (setupStep === 1) {
      return (
        <SetupProfile
          initialProfile={profile}
          onNext={handleProfileSetupComplete}
        />
      );
    }
    return (
      <SetupBanks
        currency={profile.currency}
        initialBanks={banks}
        onBack={() => setSetupStep(1)}
        onComplete={handleBanksSetupComplete}
      />
    );
  }

  // -------------------------------------------------------------
  // ROUTE 2: Daily Pocket Money Check-In (Page 3)
  // -------------------------------------------------------------
  if (showDailyCheckin) {
    return (
      <DailyPocketPage
        profile={profile}
        yesterdayLeftover={yesterdayLeftover}
        currentStartingPocket={startingPocketMoney}
        onProceed={handlePocketMoneySubmit}
      />
    );
  }

  // -------------------------------------------------------------
  // ROUTE 3: Main Summary / Dashboard Page
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Navigation Bar */}
      <Navbar
        profile={profile}
        totalBankBalance={totalBankBalance}
        todayPocketRemaining={todayPocketRemaining}
        totalSavedMoney={totalSavedMoney}
        onOpenS1Banks={() => {
          setBankModalMode('s1_manager');
          setBankModalOpen(true);
        }}
        onOpenAddBankMoney={() => {
          setBankModalMode('add_money');
          setBankModalOpen(true);
        }}
        onOpenDailyCheckin={() => setShowDailyCheckin(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSavings={() => setActiveTab('savings')}
      />

      {/* Main Dashboard Body */}
      <main>
        <SummaryDashboard
          profile={profile}
          banks={banks}
          startingPocketMoney={startingPocketMoney}
          expenses={expenses}
          frequentReasons={frequentReasons}
          savingsGoals={savingsGoals}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenS1Banks={() => {
            setBankModalMode('s1_manager');
            setBankModalOpen(true);
          }}
          onOpenAddBankMoney={() => {
            setBankModalMode('add_money');
            setBankModalOpen(true);
          }}
          onOpenDailyCheckin={() => setShowDailyCheckin(true)}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          onDepositToGoal={handleDepositToGoal}
          onWithdrawFromGoal={handleWithdrawFromGoal}
        />
      </main>

      {/* Bank Modal (Add Money '+' and S1 Manager) */}
      <BankModal
        isOpen={bankModalOpen}
        mode={bankModalMode}
        onClose={() => setBankModalOpen(false)}
        banks={banks}
        currency={profile.currency}
        onUpdateBanks={handleUpdateBanks}
        onAddBankMoney={handleAddBankMoney}
        onWithdrawToPocket={handleWithdrawToPocket}
        bankTransactions={bankTransactions}
      />

      {/* Settings Modal (Edit Profile, Export/Import, Reset) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onReloadAllData={handleReloadAllData}
      />
    </div>
  );
}
