// LocalStorage manager for SmartPocket app
// Completely clean with ZERO fake/dummy data

const STORAGE_KEYS = {
  PROFILE: 'sp_profile_v3',
  BANKS: 'sp_banks_v3',
  DAILY_SESSIONS: 'sp_daily_sessions_v3',
  EXPENSES: 'sp_expenses_v3',
  BANK_TX: 'sp_bank_tx_v3',
  REASONS: 'sp_reasons_v3',
  SAVINGS: 'sp_savings_v3',
  INFLOWS: 'sp_inflows_v3',
};

// Clean modern SVG avatar options (User initials & clean minimal icons, no random fake model photos)
export const DEFAULT_AVATARS = [
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%232563eb"/><path d="M50 48a16 16 0 100-32 16 16 0 000 32zm0 8c-18 0-32 10-32 24v4h64v-4c0-14-14-24-32-24z" fill="white"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%230284c7"/><path d="M50 48a16 16 0 100-32 16 16 0 000 32zm0 8c-18 0-32 10-32 24v4h64v-4c0-14-14-24-32-24z" fill="white"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%234f46e5"/><path d="M50 48a16 16 0 100-32 16 16 0 000 32zm0 8c-18 0-32 10-32 24v4h64v-4c0-14-14-24-32-24z" fill="white"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%230d9488"/><path d="M50 48a16 16 0 100-32 16 16 0 000 32zm0 8c-18 0-32 10-32 24v4h64v-4c0-14-14-24-32-24z" fill="white"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23d97706"/><path d="M50 48a16 16 0 100-32 16 16 0 000 32zm0 8c-18 0-32 10-32 24v4h64v-4c0-14-14-24-32-24z" fill="white"/></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%237c3aed"/><path d="M50 48a16 16 0 100-32 16 16 0 000 32zm0 8c-18 0-32 10-32 24v4h64v-4c0-14-14-24-32-24z" fill="white"/></svg>',
];

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils', color: 'bg-amber-500' },
  { id: 'transport', label: 'Transport & Travel', icon: 'Bus', color: 'bg-blue-500' },
  { id: 'grocery', label: 'Groceries & Market', icon: 'ShoppingCart', color: 'bg-emerald-500' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'Receipt', color: 'bg-rose-500' },
  { id: 'shopping', label: 'Shopping & Clothes', icon: 'ShoppingBag', color: 'bg-purple-500' },
  { id: 'entertainment', label: 'Entertainment & Fun', icon: 'Film', color: 'bg-pink-500' },
  { id: 'health', label: 'Health & Pharmacy', icon: 'HeartPulse', color: 'bg-teal-500' },
  { id: 'education', label: 'Education & Study', icon: 'GraduationCap', color: 'bg-indigo-500' },
  { id: 'other', label: 'Other / Miscellaneous', icon: 'MoreHorizontal', color: 'bg-slate-500' },
];

// ZERO fake reasons - only reasons the user actually types will be saved
export const INITIAL_FREQUENT_REASONS = [];

// ZERO fake savings goals - user adds their own real goals
export const DEFAULT_SAVINGS_GOALS = [];

export const getTodayDateKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateKey = (dateStr = getTodayDateKey()) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount, symbol = 'Rs.') => {
  const num = Number(amount) || 0;
  return `${symbol} ${num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const storage = {
  getProfile: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data
        ? JSON.parse(data)
        : {
            name: '',
            avatar: '',
            currency: 'Rs.',
            isSetupCompleted: false,
          };
    } catch {
      return {
        name: '',
        avatar: '',
        currency: 'Rs.',
        isSetupCompleted: false,
      };
    }
  },

  setProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getBanks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANKS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Blank initial bank - NO fake dummy name
      return [
        { id: 'bank-1', name: '', balance: 0, color: 'from-blue-600 to-indigo-700' },
      ];
    } catch {
      return [
        { id: 'bank-1', name: '', balance: 0, color: 'from-blue-600 to-indigo-700' },
      ];
    }
  },

  setBanks: (banks) => {
    localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(banks));
  },

  getDailySessions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_SESSIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setDailySessions: (sessions) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_SESSIONS, JSON.stringify(sessions));
  },

  getExpenses: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setExpenses: (expenses) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getBankTransactions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANK_TX);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setBankTransactions: (txs) => {
    localStorage.setItem(STORAGE_KEYS.BANK_TX, JSON.stringify(txs));
  },

  getReasons: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REASONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addReason: (reason) => {
    if (!reason || !reason.trim()) return;
    const clean = reason.trim();
    const list = storage.getReasons();
    const filtered = list.filter((r) => r.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(updated));
  },

  // Savings Goals Storage
  getSavingsGoals: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setSavingsGoals: (goals) => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(goals));
  },

  // Inflows Storage (Cash additions & Bank deposits)
  getInflows: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INFLOWS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setInflows: (inflows) => {
    localStorage.setItem(STORAGE_KEYS.INFLOWS, JSON.stringify(inflows));
  },

  getYesterdayLeftover: () => {
    const sessions = storage.getDailySessions();
    const expenses = storage.getExpenses();
    const today = getTodayDateKey();

    const dates = Object.keys(sessions)
      .filter((d) => d < today)
      .sort((a, b) => b.localeCompare(a));

    if (dates.length === 0) return 0;

    const lastDate = dates[0];
    const session = sessions[lastDate];
    if (!session) return 0;

    const starting = typeof session.startingPocketMoney === 'number' ? session.startingPocketMoney : 0;
    const added = typeof session.addedCash === 'number' ? session.addedCash : 0;

    const dayCashExpenses = expenses
      .filter((e) => e.date === lastDate && e.paymentMethod === 'cash')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const leftover = (starting + added) - dayCashExpenses;
    return Math.max(0, leftover);
  },

  exportAllData: () => {
    return JSON.stringify({
      profile: storage.getProfile(),
      banks: storage.getBanks(),
      dailySessions: storage.getDailySessions(),
      expenses: storage.getExpenses(),
      bankTransactions: storage.getBankTransactions(),
      reasons: storage.getReasons(),
      savings: storage.getSavingsGoals(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importAllData: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) storage.setProfile(data.profile);
      if (data.banks) storage.setBanks(data.banks);
      if (data.dailySessions) storage.setDailySessions(data.dailySessions);
      if (data.expenses) storage.setExpenses(data.expenses);
      if (data.bankTransactions) storage.setBankTransactions(data.bankTransactions);
      if (data.reasons) localStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(data.reasons));
      if (data.savings) storage.setSavingsGoals(data.savings);
      return true;
    } catch {
      return false;
    }
  },

  clearAllData: () => {
    localStorage.clear();
  },
};
