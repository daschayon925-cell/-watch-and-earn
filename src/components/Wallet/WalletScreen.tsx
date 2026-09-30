import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Coins, 
  ShieldCheck, 
  Filter, 
  Phone, 
  Smartphone,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { RewardTransaction, Withdrawal } from '../../types';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { MiniBannerAd } from '../Common/MiniBannerAd';

export const WalletScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { settings, language, showToast, triggerConfetti } = useApp();

  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Recharge'>('Recharge');
  const [operator, setOperator] = useState<string>('গ্রামীণফোন (GP)');
  const [accountType, setAccountType] = useState<'Personal' | 'Agent' | 'Prepaid' | 'Postpaid'>('Prepaid');
  // Auto-fill user's own registered phone ONLY if it is a real standard user phone, never fallback to owner phone
  const [mobileNumber, setMobileNumber] = useState<string>(() => {
    if (user?.phone && user.role !== 'admin') {
      return user.phone;
    }
    return '';
  });
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [bdtAmountToWithdraw, setBdtAmountToWithdraw] = useState<number>(30);
  const [withdrawing, setWithdrawing] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // 1000 Coins = 15 BDT (1 Coin = 0.015 BDT)
  const rate = settings?.coinToBDTRate || 0.015;
  const minRechargeBDT = settings?.minRechargeBDT || 30; // সর্বনিম্ন ৩০ টাকা রিচার্জ
  const minBkashNagadBDT = settings?.minBkashNagadBDT || 100;

  // Calculate required coins based on selected BDT amount
  const coinsRequired = Math.ceil(bdtAmountToWithdraw / rate);

  // Automatically update preset when changing payment method
  const selectMethod = (newMethod: 'bKash' | 'Nagad' | 'Recharge') => {
    setMethod(newMethod);
    if (newMethod === 'Recharge') {
      setAccountType('Prepaid');
      setBdtAmountToWithdraw(30);
    } else {
      setAccountType('Personal');
      setBdtAmountToWithdraw(100);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const data = await api.getWalletData();
      if (data.success) {
        setTransactions(data.transactions || []);
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    const regex = /^01[3-9]\d{8}$/;
    if (!regex.test(cleaned)) {
      setPhoneError(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' : 'Invalid 11-digit BD mobile number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(mobileNumber)) return;

    const bdtWillGet = bdtAmountToWithdraw;
    const coinsNeeded = coinsRequired;

    if (method === 'Recharge' && bdtWillGet < minRechargeBDT) {
      showToast(
        language === 'bn' ? `মোবাইল রিচার্জে সর্বনিম্ন ৳${minRechargeBDT} প্রয়োজন` : `Minimum recharge is ৳${minRechargeBDT}`,
        '',
        'error'
      );
      return;
    }

    if ((method === 'bKash' || method === 'Nagad') && bdtWillGet < minBkashNagadBDT) {
      showToast(
        language === 'bn' ? `${method}-এ ক্যাশআউটে সর্বনিম্ন ৳${minBkashNagadBDT} প্রয়োজন` : `Minimum ${method} is ৳${minBkashNagadBDT}`,
        '',
        'error'
      );
      return;
    }

    if (coinsNeeded > (user?.coins || 0)) {
      showToast(
        language === 'bn' ? 'পর্যাপ্ত কয়েন ব্যালেন্স নেই' : 'Insufficient coins',
        '',
        'error'
      );
      return;
    }

    if (user?.password && !withdrawPassword.trim()) {
      showToast('নিরাপত্তা নিশ্চায়নের জন্য আপনার অ্যাকাউন্টের পাসওয়ার্ড দিন।', '', 'error');
      return;
    }

    setWithdrawing(true);
    try {
      const res = await api.requestWithdrawal({
        method,
        accountType: method === 'Recharge' ? (`${operator} (${accountType})` as any) : accountType,
        mobileNumber: mobileNumber.replace(/\s+/g, ''),
        coins: coinsNeeded,
        password: withdrawPassword.trim()
      });

      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        await loadWalletData();
        setShowWithdrawModal(false);
        showToast(
          language === 'bn' ? 'উত্তোলন রিকোয়েস্ট সফলভাবে জমা হয়েছে! ⏳' : 'Withdrawal Request Submitted!',
          language === 'bn' ? `ম্যানুয়াল ভেরিফিকেশনের পর ${method} (${mobileNumber})-এ ৳${bdtWillGet} পাঠানো হবে।` : 'Processing your request.',
          'success'
        );
      } else {
        showToast(res.message, '', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে', '', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const availableBdt = ((user?.coins || 0) * rate).toFixed(2);
  const pendingBdt = ((user?.pendingWithdrawalCoins || 0) * rate).toFixed(2);
  const lifetimeBdt = ((user?.lifetimeCoins || 0) * rate).toFixed(2);

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'ALL') return true;
    if (filterType === 'REWARDS') return t.type === 'WATCH_REWARD' || t.type === 'AD_REWARD';
    if (filterType === 'WITHDRAWALS') return t.type === 'WITHDRAWAL';
    if (filterType === 'BONUSES') return t.type === 'DAILY_BONUS' || t.type === 'REFERRAL_BONUS' || t.type === 'MILESTONE_REWARD';
    return true;
  });

  const latestWithdrawal = withdrawals[0];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Wallet Balance Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#09111D] via-[#0E1726] to-[#0A1A12] border border-emerald-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>{language === 'bn' ? 'ডিজিটাল ওয়ালেট' : 'Digital Wallet'}</span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ১০০০ কয়েন = ৳{Math.round(1000 * rate)} BDT
          </span>
        </div>

        {/* Ad Revenue Fair-Play Notice */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between text-[10px] my-1">
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <span>💎 স্পনসর আয়ের নির্ধারিত অংশ ইউজার শেয়ার</span>
          </span>
          <span className="text-slate-300 font-medium">
            রিচার্জ: ৳{minRechargeBDT} • বিকাশ/নগদ: ৳{minBkashNagadBDT}
          </span>
        </div>

        {/* Main Available Balance */}
        <div className="my-3">
          <span className="text-xs text-slate-400 font-medium block">
            {language === 'bn' ? 'ব্যবহারযোগ্য ব্যালেন্স' : 'Available Balance'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white font-['Outfit']">
              {user?.coins.toLocaleString() || 0}
            </span>
            <span className="text-xs font-bold text-amber-400">কয়েন</span>
            <span className="text-sm font-bold text-emerald-400 ml-2">
              ≈ ৳{availableBdt} BDT
            </span>
          </div>
        </div>

        {/* Pending & Lifetime Balance Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 my-3">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">
              {language === 'bn' ? 'প্রক্রিয়াধীন ক্যাশআউট' : 'Pending Payout'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-amber-300">
                {user?.pendingWithdrawalCoins || 0}
              </span>
              <span className="text-[9px] text-slate-400">কয়েন (৳{pendingBdt})</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">
              {language === 'bn' ? 'সর্বমোট অর্জিত' : 'Lifetime Earned'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-emerald-400">
                {user?.lifetimeCoins || 0}
              </span>
              <span className="text-[9px] text-slate-400">কয়েন (৳{lifetimeBdt})</span>
            </div>
          </div>
        </div>

        {/* Withdraw Action Button */}
        <button
          onClick={() => {
            if (user?.role === 'admin') {
              setMobileNumber('');
            } else {
              setMobileNumber(user?.phone || '');
            }
            setWithdrawPassword('');
            setShowWithdrawModal(true);
          }}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-98"
        >
          <ArrowDownLeft className="w-4 h-4" />
          {language === 'bn' 
            ? `টাকা তুলুন (রিচার্জ: Min ৳৩০ | বিকাশ/নগদ: Min ৳১০০)` 
            : `Withdraw Request (Recharge: ৳30 | bKash/Nagad: ৳100)`}
        </button>
      </div>

      {/* 📢 খালি জায়গায় ছোট ব্যানার অ্যাড (Wallet Mini Banner) */}
      <MiniBannerAd slotId="wallet_middle_slot" category="finance" />

      {/* Latest Withdrawal Status Tracker if exists */}
      {latestWithdrawal && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">
                {language === 'bn' ? 'সাম্প্রতিক ক্যাশআউট স্ট্যাটাস' : 'Latest Withdrawal Status'}
              </h4>
            </div>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
              latestWithdrawal.status === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : latestWithdrawal.status === 'Pending'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              {latestWithdrawal.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">
              {latestWithdrawal.method} ({latestWithdrawal.mobileNumber})
            </span>
            <span className="font-bold text-emerald-400 font-['Outfit']">
              ৳{latestWithdrawal.bdtAmount.toFixed(2)} BDT
            </span>
          </div>

          {/* Stepper tracker */}
          <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[9px] font-medium text-slate-400">
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              ১. রিকোয়েস্ট
            </div>
            <div className={`p-1 rounded border ${
              latestWithdrawal.status === 'Approved' || latestWithdrawal.status === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border-emerald-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              ২. ভেরিফিকেশন
            </div>
            <div className={`p-1 rounded border ${
              latestWithdrawal.status === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border-emerald-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              ৩. পেইড (TrxID)
            </div>
          </div>

          {latestWithdrawal.trxId && (
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
              <span className="font-semibold text-emerald-400">TrxID: </span> {latestWithdrawal.trxId}
            </div>
          )}
        </div>
      )}

      {/* Transaction Ledger Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            {language === 'bn' ? 'লেনদেন ইতিহাস (Ledger)' : 'Transaction History'}
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {['ALL', 'REWARDS', 'WITHDRAWALS', 'BONUSES'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition ${
                  filterType === f
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}
            </div>
          ) : (
            filteredTransactions.map((t) => (
              <div
                key={t.transactionId}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border shrink-0 ${
                    t.amount > 0
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  }`}>
                    {t.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-100 truncate">{t.source}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                        {t.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-black block font-['Outfit'] ${
                    t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    ≈ ৳{Math.abs(t.bdtEquivalent).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💳 WITHDRAWAL CASHOUT MODAL (EXACT MATCH TO USER SCREENSHOT) */}
      {/* ========================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F172A] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    টাকা উত্তোলন (উইথড্র)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    মোবাইল রিচার্জ, বিকাশ বা নগদ অ্যাকাউন্টে সরাসরি টাকা পান
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(false)} 
                className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Balance Card */}
            <div className="mt-4 p-4 rounded-2xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">মোট ব্যালেন্স</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-['Outfit']">
                    ৳{availableBdt}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    ({user?.coins || 0} কয়েন)
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                ১০০০ কয়েন = ৳{Math.round(1000 * rate)}
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 my-4">
              {/* ১. পেমেন্ট মেথড নির্বাচন করুন */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ১. পেমেন্ট মেথড নির্বাচন করুন
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* মোবাইল রিচার্জ */}
                  <div
                    onClick={() => selectMethod('Recharge')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center justify-center text-center gap-1 relative ${
                      method === 'Recharge'
                        ? 'border-emerald-500 bg-emerald-500/15 text-white'
                        : 'border-slate-800 bg-[#090D16] hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Smartphone className={`w-5 h-5 ${method === 'Recharge' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs block text-white">মোবাইল<br/>রিচার্জ</span>
                    <span className="text-[10px] text-emerald-400 font-medium">সর্বনিম্ন ৩০ টাকা</span>
                  </div>

                  {/* বিকাশ */}
                  <div
                    onClick={() => selectMethod('bKash')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center justify-center text-center gap-1 relative ${
                      method === 'bKash'
                        ? 'border-pink-500 bg-pink-500/15 text-white'
                        : 'border-slate-800 bg-[#090D16] hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-pink-400">
                      b
                    </div>
                    <span className="font-bold text-xs block text-white mt-1">বিকাশ</span>
                    <span className="text-[10px] text-pink-400 font-medium">সর্বনিম্ন ১০০ টাকা</span>
                  </div>

                  {/* নগদ */}
                  <div
                    onClick={() => selectMethod('Nagad')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center justify-center text-center gap-1 relative ${
                      method === 'Nagad'
                        ? 'border-amber-500 bg-amber-500/15 text-white'
                        : 'border-slate-800 bg-[#090D16] hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                      N
                    </div>
                    <span className="font-bold text-xs block text-white mt-1">নগদ</span>
                    <span className="text-[10px] text-amber-400 font-medium">সর্বনিম্ন ১০০ টাকা</span>
                  </div>
                </div>
              </div>

              {/* মোবাইল অপারেটর নির্বাচন করুন (রিচার্জের জন্য) অথবা একাউন্ট টাইপ (বিকাশ/নগদ) */}
              {method === 'Recharge' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    মোবাইল অপারেটর নির্বাচন করুন
                  </label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#090D16] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="গ্রামীণফোন (GP)">গ্রামীণফোন (GP)</option>
                    <option value="বাংলালিংক (Banglalink)">বাংলালিংক (Banglalink)</option>
                    <option value="রবি (Robi)">রবি (Robi)</option>
                    <option value="এয়ারটেল (Airtel)">এয়ারটেল (Airtel)</option>
                    <option value="টেলিটক (Teletalk)">টেলিটক (Teletalk)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {method} অ্যাকাউন্টের ধরন
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('Personal')}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                        accountType === 'Personal' 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                          : 'bg-[#090D16] border-slate-800 text-slate-400'
                      }`}
                    >
                      পার্সোনাল (Personal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('Agent')}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                        accountType === 'Agent' 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                          : 'bg-[#090D16] border-slate-800 text-slate-400'
                      }`}
                    >
                      এজেন্ট (Agent)
                    </button>
                  </div>
                </div>
              )}

              {/* মোবাইল নম্বর */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {method === 'Recharge' ? 'মোবাইল নম্বর (রিচার্জের জন্য)' : `${method} অ্যাকাউন্ট নম্বর`}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      if (phoneError) validatePhone(e.target.value);
                    }}
                    placeholder="০১XXXXXXXXX (১১ ডিজিটের নম্বর)"
                    maxLength={11}
                    className={`w-full px-4 py-3 bg-[#090D16] border rounded-2xl text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none ${
                      phoneError ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  সচল ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন
                </p>
                {phoneError && (
                  <p className="text-[10px] text-rose-400 mt-0.5">{phoneError}</p>
                )}
              </div>

              {/* উইথড্র করার পরিমাণ (টাকায়) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    উইথড্র করার পরিমাণ (টাকায়)
                  </label>
                  <span className="text-[11px] font-bold text-slate-300">
                    প্রয়োজনীয় কয়েন: <span className="text-amber-400 font-mono font-black">{coinsRequired.toLocaleString()}</span> Coins
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(method === 'Recharge' ? [30, 50, 100] : [100, 200, 500]).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBdtAmountToWithdraw(amt)}
                      className={`py-2 rounded-xl border text-center transition font-bold text-xs ${
                        bdtAmountToWithdraw === amt
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow'
                          : 'border-slate-800 bg-[#090D16] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">
                    ৳
                  </div>
                  <input
                    type="number"
                    value={isNaN(bdtAmountToWithdraw) ? '' : bdtAmountToWithdraw}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBdtAmountToWithdraw(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#090D16] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 🔒 অ্যাকাউন্ট সিকিউরিটি ভেরিফিকেশন (উন্নত নিরাপত্তা স্তর) */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>নিরাপত্তা নিশ্চায়ন (Security Protection)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  টাকা উত্তোলন সুরক্ষিত রাখতে আপনার অ্যাকাউন্টের পাসওয়ার্ড দিন:
                </p>
                <div className="relative">
                  <input
                    type="password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    placeholder="অ্যাকাউন্টের পাসওয়ার্ড লিখুন"
                    className="w-full px-3.5 py-2.5 bg-[#090D16] border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Warning box if balance is insufficient */}
              {(user?.coins || 0) < coinsRequired && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>পর্যাপ্ত কয়েন ব্যালেন্স নেই</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    আপনার বর্তমান ব্যালেন্স {user?.coins || 0} কয়েন (৳{availableBdt} টাকা)। আরও {Math.max(0, coinsRequired - (user?.coins || 0)).toLocaleString()} কয়েন প্রয়োজন। ভিডিও দেখুন বা রিওয়ার্ড ক্লেইম করুন!
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={withdrawing || (user?.coins || 0) < coinsRequired}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {withdrawing 
                  ? 'নিরাপদে প্রক্রিয়াধীন...' 
                  : (user?.coins || 0) < coinsRequired
                    ? 'পর্যাপ্ত কয়েন নেই'
                    : `নিরাপদে উইথড্র সাবমিট করুন (৳${bdtAmountToWithdraw})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
