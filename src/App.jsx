import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import ProfileSelectScreen from './components/ProfileSelectScreen';
import PinModal from './components/PinModal';
import AdminModal from './components/AdminModal';
import SetupProfile from './components/SetupProfile';
import SetupBanks from './components/SetupBanks';
import DailyPocketPage from './components/DailyPocketPage';
import SummaryDashboard from './components/SummaryDashboard';
import BankModal from './components/BankModal';
import SettingsModal from './components/SettingsModal';
import AddCashModal from './components/AddCashModal';
import { storage, getTodayDateKey } from './utils/storage';
import { sound } from './utils/sound';

export default function App() {
  // 1. Multi-User Storage State
  const [users, setUsers] = useState(() => storage.getUsers());
  const [currentUserId, setCurrentUserId] = useState(() => storage.getCurrentUserId());

  // 2. Active User Object
  const currentUser = users.find((u) => u.id === currentUserId) || null;

  // 3. User Selection & PIN Unlock State
  const [selectedUserForPin, setSelectedUserForPin] = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  // 4. Admin Portal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // 5. User Creation State
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [creationStep, setCreationStep] = useState(1); // 1 = Profile & PIN, 2 = Banks
  const [tempProfileData, setTempProfileData] = useState(null);

  // 6. Active Dashboard Tab ('overview' | 'savings' | 'analytics')
  const [activeTab, setActiveTab] = useState('overview');

  // 7. Modals
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankModalMode, setBankModalMode] = useState('add_money');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addCashModalOpen, setAddCashModalOpen] = useState(false);
  const [forceDailyCheckin, setForceDailyCheckin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Save currentUserId changes to localStorage
  useEffect(() => {
    storage.setCurrentUserId(currentUserId);
  }, [currentUserId]);

  // Helper to reload users from storage
  const reloadUsersFromStorage = () => {
    const fresh = storage.getUsers();
    setUsers(fresh);
  };

  // Helper to mutate active user fields in state and storage
  const updateCurrentUserFields = (updatedFields) => {
    if (!currentUser) return;
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, ...updatedFields };
      }
      return u;
    });
    storage.setUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  // Switch / Logout active profile
  const handleSwitchProfile = () => {
    sound.playClick();
    setCurrentUserId(null);
    storage.setCurrentUserId(null);
  };

  // Select profile from list -> Prompt PIN
  const handleProfileCardClick = (user) => {
    setSelectedUserForPin(user);
    setPinModalOpen(true);
  };

  // PIN verified successfully
  const handlePinSuccess = (userId) => {
    setPinModalOpen(false);
    setSelectedUserForPin(null);
    setCurrentUserId(userId);
    storage.setCurrentUserId(userId);
  };

  // Delete user from Admin portal
  const handleAdminDeleteUser = (userId) => {
    storage.deleteUser(userId);
    const updated = storage.getUsers();
    setUsers(updated);
    if (currentUserId === userId) {
      setCurrentUserId(null);
    }
  };

  // Self Delete Account from User Settings
  const handleDeleteCurrentAccount = (userId) => {
    storage.deleteUser(userId);
    const updated = storage.getUsers();
    setUsers(updated);
    setCurrentUserId(null);
    storage.setCurrentUserId(null);
  };

  // -------------------------------------------------------------
  // USER CREATION FLOW (Profile + PIN -> Banks -> Dashboard)
  // -------------------------------------------------------------
  const handleStartCreateUser = () => {
    setTempProfileData(null);
    setCreationStep(1);
    setIsCreatingUser(true);
  };

  const handleCreateProfileNext = (profileData) => {
    setTempProfileData(profileData);
    setCreationStep(2);
  };

  const handleCreateBanksComplete = (banks) => {
    const newUser = storage.createUser({
      name: tempProfileData.name,
      avatar: tempProfileData.avatar,
      currency: tempProfileData.currency,
      pin: tempProfileData.pin,
    });

    // Update with configured banks and mark setup complete
    const updatedUsers = storage.getUsers().map((u) => {
      if (u.id === newUser.id) {
        return {
          ...u,
          isSetupCompleted: true,
          banks: banks.filter((b) => b.name && b.name.trim() !== ''),
        };
      }
      return u;
    });

    storage.setUsers(updatedUsers);
    setUsers(updatedUsers);
    setCurrentUserId(newUser.id);
    setIsCreatingUser(false);
    setCreationStep(1);
    setTempProfileData(null);
    setForceDailyCheckin(false); // Go directly to dashboard!
  };

  // -------------------------------------------------------------
  // ROUTE 0: Splash / Loading Screen (App launch animation)
  // -------------------------------------------------------------
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // -------------------------------------------------------------
  // ROUTE 1: Creation Mode
  // -------------------------------------------------------------
  if (isCreatingUser) {
    if (creationStep === 1) {
      return (
        <SetupProfile
          initialProfile={{}}
          onNext={handleCreateProfileNext}
          onCancel={users.length > 0 ? () => setIsCreatingUser(false) : null}
        />
      );
    }
    return (
      <SetupBanks
        currency={tempProfileData?.currency || 'Rs.'}
        initialBanks={[{ id: 'bank-1', name: '', balance: '' }]}
        onBack={() => setCreationStep(1)}
        onComplete={handleCreateBanksComplete}
      />
    );
  }

  // -------------------------------------------------------------
  // ROUTE 2: No User Selected -> Profile Select Screen
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <>
        <ProfileSelectScreen
          users={users}
          onSelectUser={handleProfileCardClick}
          onCreateNew={handleStartCreateUser}
          onOpenAdmin={() => setAdminModalOpen(true)}
        />

        {/* 4-Digit PIN Unlock Modal */}
        <PinModal
          isOpen={pinModalOpen}
          user={selectedUserForPin}
          onClose={() => {
            setPinModalOpen(false);
            setSelectedUserForPin(null);
          }}
          onSuccess={handlePinSuccess}
        />

        {/* Admin Portal Modal */}
        <AdminModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          users={users}
          onDeleteUser={handleAdminDeleteUser}
          onReloadUsers={reloadUsersFromStorage}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE USER CONTEXT & CALCULATIONS
  // -------------------------------------------------------------
  const todayKey = getTodayDateKey();
  const dailySessions = currentUser.dailySessions || {};
  const todaySession = dailySessions[todayKey];
  const banks = currentUser.banks || [];
  const expenses = currentUser.expenses || [];
  const inflows = currentUser.inflows || [];
  const bankTransactions = currentUser.bankTransactions || [];
  const frequentReasons = currentUser.reasons || [];
  const savingsGoals = currentUser.savings || [];
  const currency = currentUser.currency || 'Rs.';

  // Yesterday's leftover pocket money
  const yesterdayLeftover = storage.getYesterdayLeftover(currentUser);

  // Calculations for today
  const startingPocketMoney =
    (todaySession?.startingPocketMoney || 0) + (todaySession?.addedCash || 0);
  const todayCashExpenses = expenses
    .filter((e) => e.date === todayKey && e.paymentMethod === 'cash')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayPocketRemaining = Math.max(0, startingPocketMoney - todayCashExpenses);

  // -------------------------------------------------------------
  // ROUTE 3: Daily Pocket Money (Optional: only when user clicks "Set / Edit")
  // -------------------------------------------------------------
  if (forceDailyCheckin) {
    return (
      <DailyPocketPage
        profile={currentUser}
        yesterdayLeftover={yesterdayLeftover}
        currentStartingPocket={startingPocketMoney}
        onProceed={(startingAmount) => {
          const updatedSessions = {
            ...dailySessions,
            [todayKey]: {
              date: todayKey,
              startingPocketMoney: startingAmount,
              lastLogged: new Date().toISOString(),
            },
          };
          updateCurrentUserFields({ dailySessions: updatedSessions });
          setForceDailyCheckin(false);
        }}
        onSkip={() => setForceDailyCheckin(false)}
      />
    );
  }

  // -------------------------------------------------------------
  // ACTIVE USER ACTIONS & MUTATIONS
  // -------------------------------------------------------------

  // Add Expense
  const handleAddExpense = ({
    amount,
    reason,
    category,
    paymentMethod,
    bankId,
    bankName,
    recipientName,
    dueDate,
  }) => {
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
      recipientName: recipientName || null,
      dueDate: dueDate || null,
      isSettled: false,
      date: todayKey,
      time: timeStr,
      timestamp: Date.now(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    const updatedReasons = Array.from(new Set([reason.trim(), ...frequentReasons])).slice(0, 30);

    let updatedBanks = [...banks];
    let updatedTxs = [...bankTransactions];

    // If card payment, deduct from selected bank
    if (paymentMethod === 'card' && bankId) {
      updatedBanks = banks.map((b) => {
        if (b.id === bankId) {
          return {
            ...b,
            balance: Math.max(0, (Number(b.balance) || 0) - Number(amount)),
          };
        }
        return b;
      });

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
      updatedTxs = [newTx, ...bankTransactions];
    }

    updateCurrentUserFields({
      expenses: updatedExpenses,
      reasons: updatedReasons,
      banks: updatedBanks,
      bankTransactions: updatedTxs,
    });
  };

  // Delete Expense
  const handleDeleteExpense = (id) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;

    let updatedBanks = [...banks];
    if (target.paymentMethod === 'card' && target.bankId) {
      updatedBanks = banks.map((b) => {
        if (b.id === target.bankId) {
          return {
            ...b,
            balance: (Number(b.balance) || 0) + Number(target.amount),
          };
        }
        return b;
      });
    }

    const updatedExpenses = expenses.filter((e) => e.id !== id);
    updateCurrentUserFields({
      expenses: updatedExpenses,
      banks: updatedBanks,
    });
  };

  // Toggle Settled / Repaid status for Loans and Bills
  const handleToggleSettledExpense = (id) => {
    const updatedExpenses = expenses.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          isSettled: !e.isSettled,
          settledAt: !e.isSettled ? new Date().toISOString() : null,
        };
      }
      return e;
    });
    updateCurrentUserFields({ expenses: updatedExpenses });
    sound.playSuccess();
  };

  // Add Bank Deposit
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

    const newInflow = {
      id: 'inf-' + Date.now(),
      amount: Number(amount),
      note: note || `Deposit to ${targetBankName}`,
      destination: 'bank',
      bankId,
      bankName: targetBankName,
      date: todayKey,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };

    updateCurrentUserFields({
      banks: updatedBanks,
      bankTransactions: [newTx, ...bankTransactions],
      inflows: [newInflow, ...inflows],
    });
  };

  // Add Cash directly to Pocket Money
  const handleAddCash = ({ amount, note }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const currentStarting = todaySession?.startingPocketMoney || 0;
    const currentAdded = todaySession?.addedCash || 0;
    const updatedSessions = {
      ...dailySessions,
      [todayKey]: {
        ...todaySession,
        date: todayKey,
        startingPocketMoney: currentStarting,
        addedCash: currentAdded + Number(amount),
        lastLogged: new Date().toISOString(),
      },
    };

    const newInflow = {
      id: 'inf-' + Date.now(),
      amount: Number(amount),
      note: note || 'Cash Added to Pocket',
      destination: 'pocket',
      bankId: null,
      bankName: null,
      date: todayKey,
      time: timeStr,
      timestamp: Date.now(),
    };

    updateCurrentUserFields({
      dailySessions: updatedSessions,
      inflows: [newInflow, ...inflows],
    });
  };

  // Delete Inflow / Money received
  const handleDeleteInflow = (id) => {
    const target = inflows.find((i) => i.id === id);
    if (!target) return;

    let updatedSessions = dailySessions;
    let updatedBanks = banks;

    if (target.destination === 'pocket') {
      const currentAdded = todaySession?.addedCash || 0;
      updatedSessions = {
        ...dailySessions,
        [todayKey]: {
          ...todaySession,
          addedCash: Math.max(0, currentAdded - Number(target.amount)),
        },
      };
    } else if (target.destination === 'bank' && target.bankId) {
      updatedBanks = banks.map((b) => {
        if (b.id === target.bankId) {
          return {
            ...b,
            balance: Math.max(0, (Number(b.balance) || 0) - Number(target.amount)),
          };
        }
        return b;
      });
    }

    updateCurrentUserFields({
      dailySessions: updatedSessions,
      banks: updatedBanks,
      inflows: inflows.filter((i) => i.id !== id),
    });
  };

  // ATM / Bank Withdrawal to Cash
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

    updateCurrentUserFields({
      banks: updatedBanks,
      dailySessions: updatedSessions,
      bankTransactions: [newTx, ...bankTransactions],
    });
  };

  // Update Banks in bulk from Accounts modal
  const handleUpdateBanks = (updatedBanks) => {
    updateCurrentUserFields({ banks: updatedBanks });
  };

  // Update Profile & Settings
  const handleUpdateProfile = (updatedProfile) => {
    updateCurrentUserFields(updatedProfile);
  };

  // --- Savings Handlers ---
  const handleAddGoal = (goal) => {
    updateCurrentUserFields({ savings: [goal, ...savingsGoals] });
  };

  const handleUpdateGoal = (updatedGoal) => {
    updateCurrentUserFields({
      savings: savingsGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
    });
  };

  const handleDeleteGoal = (goalId) => {
    updateCurrentUserFields({
      savings: savingsGoals.filter((g) => g.id !== goalId),
    });
  };

  const handleDepositToGoal = ({ goalId, amount, source, bankId }) => {
    let updatedSessions = dailySessions;
    let updatedBanks = banks;
    let updatedTxs = bankTransactions;

    if (source === 'pocket') {
      const currentStarting = todaySession?.startingPocketMoney || 0;
      updatedSessions = {
        ...dailySessions,
        [todayKey]: {
          ...todaySession,
          startingPocketMoney: Math.max(0, currentStarting - Number(amount)),
        },
      };
    } else if (source === 'bank' && bankId) {
      let targetBankName = '';
      updatedBanks = banks.map((b) => {
        if (b.id === bankId) {
          targetBankName = b.name;
          return {
            ...b,
            balance: Math.max(0, (Number(b.balance) || 0) - Number(amount)),
          };
        }
        return b;
      });

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
      updatedTxs = [newTx, ...bankTransactions];
    }

    const updatedGoals = savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: (Number(g.currentAmount) || 0) + Number(amount),
        };
      }
      return g;
    });

    updateCurrentUserFields({
      dailySessions: updatedSessions,
      banks: updatedBanks,
      bankTransactions: updatedTxs,
      savings: updatedGoals,
    });
  };

  const handleWithdrawFromGoal = ({ goalId, amount, destination, bankId }) => {
    let updatedSessions = dailySessions;
    let updatedBanks = banks;
    let updatedTxs = bankTransactions;

    if (destination === 'pocket') {
      const currentStarting = todaySession?.startingPocketMoney || 0;
      updatedSessions = {
        ...dailySessions,
        [todayKey]: {
          ...todaySession,
          startingPocketMoney: currentStarting + Number(amount),
        },
      };
    } else if (destination === 'bank' && bankId) {
      let targetBankName = '';
      updatedBanks = banks.map((b) => {
        if (b.id === bankId) {
          targetBankName = b.name;
          return {
            ...b,
            balance: (Number(b.balance) || 0) + Number(amount),
          };
        }
        return b;
      });

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
      updatedTxs = [newTx, ...bankTransactions];
    }

    const updatedGoals = savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Math.max(0, (Number(g.currentAmount) || 0) - Number(amount)),
        };
      }
      return g;
    });

    updateCurrentUserFields({
      dailySessions: updatedSessions,
      banks: updatedBanks,
      bankTransactions: updatedTxs,
      savings: updatedGoals,
    });
  };

  // -------------------------------------------------------------
  // ROUTE 4: Main Dashboard View
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-md bg-slate-50/50 min-h-screen shadow-2xl border-x border-slate-200/60 flex flex-col overflow-x-hidden">
        
        {/* Top Navigation Bar */}
        <Navbar
          profile={currentUser}
          onOpenSettings={() => setSettingsOpen(true)}
          onSwitchProfile={handleSwitchProfile}
        />

        {/* Main Dashboard Body */}
        <main className="flex-1 pb-8">
          <SummaryDashboard
            profile={currentUser}
            banks={banks}
            startingPocketMoney={startingPocketMoney}
            expenses={expenses}
            inflows={inflows}
            frequentReasons={frequentReasons}
            savingsGoals={savingsGoals}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenBanks={() => {
              setBankModalMode('s1_manager');
              setBankModalOpen(true);
            }}
            onOpenAddBankMoney={() => {
              setBankModalMode('add_money');
              setBankModalOpen(true);
            }}
            onOpenAddCash={() => setAddCashModalOpen(true)}
            onOpenDailyCheckin={() => setForceDailyCheckin(true)}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onDeleteInflow={handleDeleteInflow}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
            onWithdrawFromGoal={handleWithdrawFromGoal}
            onToggleSettledExpense={handleToggleSettledExpense}
          />
        </main>
      </div>

      {/* Bank Modal (Add Money '+' and Accounts Manager) */}
      <BankModal
        isOpen={bankModalOpen}
        mode={bankModalMode}
        onClose={() => setBankModalOpen(false)}
        banks={banks}
        currency={currency}
        onUpdateBanks={handleUpdateBanks}
        onAddBankMoney={handleAddBankMoney}
        onWithdrawToPocket={handleWithdrawToPocket}
        bankTransactions={bankTransactions}
      />

      {/* Add Cash Modal */}
      <AddCashModal
        isOpen={addCashModalOpen}
        onClose={() => setAddCashModalOpen(false)}
        currency={currency}
        todayPocketRemaining={todayPocketRemaining}
        onAddCash={handleAddCash}
      />

      {/* Settings Modal (Edit Profile, Change PIN, Delete My Account) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onDeleteCurrentAccount={handleDeleteCurrentAccount}
        onReloadAllData={reloadUsersFromStorage}
      />
    </div>
  );
}
