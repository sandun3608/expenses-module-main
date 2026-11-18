# 💰 SmartPocket - Daily Expenses, Bank Manager & Savings Vault

A modern, 100% mobile-responsive, blue & white themed web application designed to help people manage their daily cash pocket money, bank balances, expense analytics, and piggy savings effortlessly.

---

## 🌟 Key Updates & Features

### 1️⃣ Updated Setup Flow
- **Profile Setup (Step 1)**: User name, modern avatar selector / custom upload, and currency symbol (`Rs.` default).
- **Money Spots & Vaults Setup (Step 2)**:
  - **No longer forces 3 banks!** Starts with **1 primary bank**.
  - **No card details or account numbers needed!** Only Bank Name and Starting Amount/Balance.
  - New friendly title: **"Connect Your Main Bank Funds"** (not "Add your bank account").
  - Has a **`+ Add Another Bank`** button at the bottom if the user wishes to add a 2nd or 3rd bank.
  - Setup runs only once and never bothers you again on startup.

### 2️⃣ Daily Starting Pocket Money Check-In (Day Gate)
- Shown automatically every day on first login / app open.
- Personalized greeting: *"Good morning / afternoon / evening, [Name]!"* with your profile picture.
- **"Add your starting pocket money"**: Input field to set today's cash in hand.
- **Yesterday's Leftover Smart Button**: Automatically calculates yesterday's remaining pocket money (`Starting - Cash Expenses`) and displays it inside a quick-tap button:
  `[ 💰 Yesterday's Leftover Balance: Rs. X (Tap to use) ]`
- Quick preset cash chips (+500, +1,000, +2,000, +5,000).

### 3️⃣ Summary & Dashboard Page
- **Total Combined Bank Balance Banner**: Large banner displaying total balance across all connected banks.
- **Direct `+` Deposit Button**: Select destination bank, enter deposit amount & note, automatically adds to that bank and updates total balance.
- **`S1` Banks Button**: View bank accounts, edit balances, add new banks, or perform **ATM Cash Out** (deduct from bank and add to pocket cash).
- **Today's Pocket Cash Widget**: Live cash in hand, spent today, and remaining cash.

### 4️⃣ 🐷 Brand New Dedicated Savings Module (Savings Vault)
- **Overall Savings Progress**: Total Saved vs Total Target with dynamic progress bar.
- **Create Custom Savings Goals**:
  - Goal Name (e.g. Emergency Fund, New Phone, Motorcycle, Vacation, Gold)
  - Target Amount & initial deposit
  - Custom category icons & color themes
- **Deposit to Savings**: Transfer money from either **Pocket Cash** or **Bank Account** directly into the savings goal.
- **Withdraw from Savings**: Pull money back from savings into Pocket Cash or Bank whenever needed.
- **Celebration Confetti**: Explodes when you hit 100% of your savings goal!

### 5️⃣ Expenses Entry & Autocomplete
- Price & Reason input.
- **Smart Autocomplete**: As you type, previous reasons are suggested.
- **Payment Source Toggle (Cash vs Card)**:
  - **💵 Pocket Cash**: Deducts from today's pocket cash.
  - **💳 Bank / Card**: Deducts directly from selected Bank's balance!
- Real-time expense rows with timestamps (`10:45 AM`), category badges, and payment badges.

### 6️⃣ Visual Analytics & Graphs
- **Daily Pocket Money Progress Meter**: Safe, 70%+ warning, 90%+ alert.
- **Doughnut Chart**: Where did your money go by category.
- **Bar Chart**: 14-day spending trend comparison.

---

## 🚀 How to Run the App

Double-click [start.bat](file:///c:/Users/etsy%20dream/Desktop/expences%20module/start.bat) in this folder, or run:
```bash
npm run dev
```
Then visit `http://localhost:5173` in your browser.
