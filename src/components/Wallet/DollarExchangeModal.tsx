import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle,
  RefreshCw,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';

interface DollarExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DollarExchangeModal: React.FC<DollarExchangeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast, triggerConfetti, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [platform, setPlatform] = useState<'Payeer' | 'Airtm' | 'Binance' | 'Litecoin' | '2Captcha'>('Payeer');
  const [usdAmount, setUsdAmount] = useState<string>('2');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [mobileNumber, setMobileNumber] = useState<string>(user?.phone || '');
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Exchange rate: 1 USD = 110 BDT (Admin makes ~12 BDT margin per USD)
  const exchangeRate = 110;
  const numUsd = parseFloat(usdAmount) || 0;
  const calculatedBDT = Math.round(numUsd * exchangeRate);

  // Admin Wallets (configured in settings or sensible defaults)
  const adminSec = settings?.adminSecurity as any;
  const adminWallets = {
    Payeer: adminSec?.adminPayeer || 'P108429182',
    Airtm: adminSec?.adminAirtm || 'daschayon925@gmail.com',
    Binance: adminSec?.adminBinancePayId || '298410291',
    Litecoin: adminSec?.adminLtc || 'ltc1q98k2v0x9a8h7z3m2c1v0q9w8e7r6t5y4u3i2o1p',
    '2Captcha': adminSec?.admin2CaptchaEmail || 'daschayon925@gmail.com'
  };

  const currentAdminAddress = adminWallets[platform];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    soundService.playTap();
    showToast('অ্যাড্রেস কপি করা হয়েছে! 📋', '', 'info');
    setTimeout(() => setCopiedAddress(null), 2500);
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/exchange/my-requests', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMyRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numUsd < 0.5) {
      showToast('সর্বনিম্ন $০.৫০ ডলার এক্সচেঞ্জ করা যাবে', '', 'error');
      return;
    }
    if (!mobileNumber.trim()) {
      showToast('আপনার বিকাশ/নগদ নম্বর দিন', '', 'error');
      return;
    }
    if (!trxId.trim()) {
      showToast('ডলার পাঠানোর TrxID বা ব্যাচ নম্বর দিন', '', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/exchange/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          platform,
          usdAmount: numUsd,
          bdtAmount: calculatedBDT,
          paymentMethod,
          mobileNumber: mobileNumber.trim(),
          senderAccount: senderAccount.trim(),
          trxId: trxId.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        showToast('আবেদন সফল হয়েছে! 💵', 'অ্যাডমিন ভেরিফাই করে আপনার বিকাশে টাকা পাঠিয়ে দেবে।', 'coin');
        setTrxId('');
        setSenderAccount('');
        setActiveTab('history');
        fetchHistory();
      } else {
        showToast(data.message || 'রিকোয়েস্ট ব্যর্থ হয়েছে', '', 'error');
      }
    } catch (err: any) {
      showToast('সার্ভার এরর, কিছুক্ষণ পর আবার চেষ্টা করুন', '', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-slate-900 via-[#0B1322] to-slate-950 border-2 border-emerald-500/40 shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <DollarSign className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>ডলার টু বিকাশ এক্সচেঞ্জ হাব</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">P2P</span>
              </h3>
              <p className="text-[10px] text-slate-400">2Captcha, Payeer, Airtm বা বাইনান্সের ডলার বিকাশে নিন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            নতুন এক্সচেঞ্জ আবেদন
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            আমার এক্সচেঞ্জ হিস্ট্রি
          </button>
        </div>

        {/* TAB 1: CREATE EXCHANGE REQUEST */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {/* Live Rate Notice */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>আজকের এক্সচেঞ্জ রেট:</span>
              </span>
              <span className="text-sm font-black font-mono text-amber-400">
                $1.00 = ৳{exchangeRate} BDT
              </span>
            </div>

            {/* Step 1: Select Platform */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                ১. কোন সাইট বা ওয়ালেট থেকে ডলার পাঠাবেন?
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Payeer', 'Airtm', 'Binance', 'Litecoin', '2Captcha'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-1 rounded-xl text-xs font-black border transition-all ${
                      platform === p
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Admin Wallet to Pay */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 block">
                অ্যাডমিনের {platform} অ্যাড্রেস (এখানে ডলার পাঠান):
              </span>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-amber-300">
                <span className="truncate select-all">{currentAdminAddress}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentAdminAddress)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                  title="কপি করুন"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-slate-400">
                💡 উপরের ঠিকানায় আপনার {platform} অ্যাকাউন্ট থেকে ডলার ট্রান্সফার করে নিচের ঘরে TrxID দিন।
              </p>
            </div>

            {/* Step 2: Amount Calculator */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  ডলারের পরিমাণ ($ USD):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  required
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  placeholder="যেমন: 2"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  আপনি পাবেন (BDT):
                </label>
                <div className="w-full p-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono font-black text-emerald-400">
                  ৳{calculatedBDT} BDT
                </div>
              </div>
            </div>

            {/* Step 3: bKash / Nagad Details */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  টাকা নেওয়ার মাধ্যম:
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bKash')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      paymentMethod === 'bKash'
                        ? 'bg-pink-600 text-white border-pink-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    বিকাশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      paymentMethod === 'Nagad'
                        ? 'bg-orange-600 text-white border-orange-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    নগদ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  আপনার বিকাশ/নগদ নম্বর:
                </label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Step 4: Sender TrxID / Proof */}
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  ডলার পাঠানোর ট্রানজেকশন ID / Batch No:
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="যেমন: 209841824 বা TXID"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  যে একাউন্ট থেকে পাঠিয়েছেন (অপশনাল):
                </label>
                <input
                  type="text"
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  placeholder="আপনার Payeer ID বা ইমেইল"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : `এক্সচেঞ্জ আবেদন সাবমিট করুন (৳${calculatedBDT})`}</span>
            </button>
          </form>
        )}

        {/* TAB 2: MY EXCHANGE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-2.5 text-left">
            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>লোড হচ্ছে...</span>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <Clock className="w-6 h-6 text-slate-500 mx-auto" />
                <p>এখনো কোনো এক্সচেঞ্জ আবেদন জমা দেননি</p>
              </div>
            ) : (
              myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>${req.usdAmount} ({req.platform})</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-emerald-400 font-black">৳{req.bdtAmount}</span>
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      req.status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : req.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {req.status === 'Paid' ? 'পরিশোধিত ✓' : req.status === 'Rejected' ? 'বাতিল ✕' : 'প্রক্রিয়াধীন...'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p>পেমেন্ট নম্বর: <span className="font-mono text-slate-200">{req.paymentMethod} ({req.mobileNumber})</span></p>
                    <p>আপনার পাঠানো TrxID: <span className="font-mono text-amber-300">{req.trxId}</span></p>
                    {req.payoutTrxId && (
                      <p className="text-emerald-400 font-bold">অ্যাডমিন প্রেরিত TrxID: <span className="font-mono">{req.payoutTrxId}</span></p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
