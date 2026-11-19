// LocalStorage & Cloud Database Manager for Expenses Manager app
// Multi-User, Multi-Device Cloud Sync, 4-digit PIN authentication, Admin portal, and reliable persistence

const STORAGE_KEYS = {
  USERS: 'em_users_v4',
  CURRENT_USER_ID: 'em_current_user_v4',
  ADMIN_PASSWORD: 'em_admin_pw_v4',
  LAST_ACTIVE: 'em_last_active_v4',
};

const DEFAULT_ADMIN_PW = 'admin123';

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils', color: 'bg-amber-500' },
  { id: 'transport', label: 'Transport & Travel', icon: 'Bus', color: 'bg-blue-500' },
  { id: 'grocery', label: 'Groceries & Market', icon: 'ShoppingCart', color: 'bg-emerald-500' },
  { id: 'loan', label: 'Loan / Given', icon: 'HandCoins', color: 'bg-orange-500' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'Receipt', color: 'bg-rose-500' },
  { id: 'shopping', label: 'Shopping & Clothes', icon: 'ShoppingBag', color: 'bg-purple-500' },
  { id: 'entertainment', label: 'Entertainment & Fun', icon: 'Film', color: 'bg-pink-500' },
  { id: 'health', label: 'Health & Pharmacy', icon: 'HeartPulse', color: 'bg-teal-500' },
  { id: 'education', label: 'Education & Study', icon: 'GraduationCap', color: 'bg-indigo-500' },
  { id: 'other', label: 'Other / Miscellaneous', icon: 'MoreHorizontal', color: 'bg-slate-500' },
];

export const getTodayDateKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateKey = (d) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateKey) => {
  if (!dateKey) return '';
  const parts = dateKey.split('-');
  if (parts.length !== 3) return dateKey;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatCurrency = (amount, symbol = 'Rs.') => {
  const num = Number(amount) || 0;
  return `${symbol} ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const storage = {
  // --- CLOUD SYNC METHODS (Multi-Device Support) ---
  syncFromServer: async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          const localUsers = storage.getUsers();
          const userMap = new Map();

          // Merge local and cloud server accounts intelligently
          localUsers.forEach((u) => userMap.set(u.id, u));
          data.users.forEach((remoteUser) => {
            const localUser = userMap.get(remoteUser.id);
            if (!localUser) {
              userMap.set(remoteUser.id, remoteUser);
            } else {
              // Combine dailySessions, expenses, and fields so local sessions aren't wiped
              const mergedSessions = {
                ...(remoteUser.dailySessions || {}),
                ...(localUser.dailySessions || {}),
              };
              userMap.set(remoteUser.id, {
                ...remoteUser,
                ...localUser,
                dailySessions: mergedSessions,
              });
            }
          });

          const merged = Array.from(userMap.values());
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));

          if (data.adminPassword) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, data.adminPassword);
          }

          // If local had accounts not on server, push merged to server
          if (merged.length > data.users.length) {
            storage.syncAllUsersToServer(merged);
          }

          return merged;
        }
      }
    } catch (err) {
      console.warn('Could not sync from cloud server:', err);
    }
    return storage.getUsers();
  },

  syncUserToServer: (user) => {
    if (!user) return;
    try {
      fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      }).catch((e) => console.warn('Sync user failed:', e));
    } catch {}
  },

  syncAllUsersToServer: (users) => {
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      }).catch((e) => console.warn('Sync all users failed:', e));
    } catch {}
  },

  deleteUserFromServer: (id) => {
    try {
      fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch((e) => console.warn('Delete user on server failed:', e));
    } catch {}
  },

  // --- LOCAL USERS MANAGEMENT ---
  getUsers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setUsers: (users) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    storage.syncAllUsersToServer(users);
  },

  getUserById: (id) => {
    const users = storage.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  createUser: ({ name, avatar, pin, currency = 'Rs.' }) => {
    const users = storage.getUsers();
    const newUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      avatar: avatar || '',
      pin: String(pin), // 4-digit PIN
      currency: currency || 'Rs.',
      isSetupCompleted: false,
      createdAt: new Date().toISOString(),
      banks: [{ id: 'bank-1', name: '', balance: '' }],
      dailySessions: {},
      expenses: [],
      inflows: [],
      savings: [],
      bankTransactions: [],
      reasons: [],
    };
    const updated = [...users, newUser];
    storage.setUsers(updated);
    storage.setCurrentUserId(newUser.id);
    storage.syncUserToServer(newUser);
    return newUser;
  },

  updateUser: (id, updatedFields) => {
    const users = storage.getUsers();
    let updatedUser = null;
    const updated = users.map((u) => {
      if (u.id === id) {
        updatedUser = { ...u, ...updatedFields };
        return updatedUser;
      }
      return u;
    });
    storage.setUsers(updated);
    if (updatedUser) {
      storage.syncUserToServer(updatedUser);
    }
  },

  deleteUser: (id) => {
    const users = storage.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    storage.setUsers(filtered);
    storage.deleteUserFromServer(id);
    if (storage.getCurrentUserId() === id) {
      storage.setCurrentUserId(null);
    }
  },

  // --- CURRENT USER SESSION ---
  getCurrentUserId: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || null;
    } catch {
      return null;
    }
  },

  setCurrentUserId: (id) => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  },

  // --- ADMIN PORTAL ---
  getAdminPassword: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PW;
    } catch {
      return DEFAULT_ADMIN_PW;
    }
  },

  setAdminPassword: (pw) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, pw);
    try {
      fetch('/api/admin/pw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      }).catch(() => {});
    } catch {}
  },

  verifyAdminPassword: (pw) => {
    const current = storage.getAdminPassword();
    return pw === current;
  },

  // Calculate yesterday's leftover for a user
  getYesterdayLeftover: (user) => {
    if (!user || !user.dailySessions) return 0;
    const sessions = user.dailySessions;
    const expenses = user.expenses || [];
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
};
