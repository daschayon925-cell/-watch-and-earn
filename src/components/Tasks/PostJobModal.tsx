import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  Briefcase, 
  Users, 
  Youtube, 
  Globe, 
  Smartphone, 
  ThumbsUp, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface PostJobModalProps {
  onClose: () => void;
  onJobCreated?: () => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onJobCreated }) => {
  const { user } = useAuth();
  const { showToast, language, settings } = useApp();

  const [category, setCategory] = useState<'youtube' | 'tiktok' | 'facebook' | 'telegram' | 'app' | 'website'>('youtube');
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [targetWorkers, setTargetWorkers] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const pricePerWorker = settings?.jobPostingConfig?.pricePerWorkerBDT || 1.5;
  const totalCost = Math.round(targetWorkers * pricePerWorker);
  const adminBkashNumber = settings?.jobPostingConfig?.bkashNumber || '01339223713';
  const adminNagadNumber = settings?.jobPostingConfig?.nagadNumber || '01339223713';

  const activeAdminNumber = paymentMethod === 'bkash' ? adminBkashNumber : adminNagadNumber;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    showToast('নম্বর কপি করা হয়েছে! 📋', '', 'info');
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('কাজের শিরোনাম লিখুন', '', 'error');
      return;
    }
    if (!targetUrl.trim()) {
      showToast('কাজের বা চ্যানেলের লিংক দিন', '', 'error');
      return;
    }
    if (!senderPhone.trim()) {
      showToast('যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন', '', 'error');
      return;
    }
    if (!trxId.trim()) {
      showToast('টাকা পাঠানোর TrxID দিন', '', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createJob({
        title,
        category,
        targetUrl,
        instructions,
        targetWorkers,
        paymentMethod,
        senderPhone,
        trxId
      });

      if (res?.success) {
        showToast(
          'কাজের আবেদন জমা হয়েছে! 🎉',
          'অ্যাডমিন ভেরিফাই করে কাজ লাইভ করে দিবেন।',
          'coin'
        );
        if (onJobCreated) onJobCreated();
        onClose();
      } else {
        showToast(res?.message || 'আবেদন জমা দেওয়া যায়নি', '', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'সমস্যা হয়েছে, পরে আবার চেষ্টা করুন', '', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#0A0F1D] border border-emerald-500/30 rounded-3xl p-5 shadow-2xl text-white scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              নিজের কাজ পোস্ট ও প্রচার করুন
            </h3>
            <p className="text-[11px] text-slate-400">
              হাজার হাজার রিয়েল ইউজার দিয়ে চ্যানেল, পেজ বা অ্যাপ প্রমোট করুন
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              কাজের ধরন সিলেক্ট করুন:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'youtube', label: 'ইউটিউব সাব/ভিউ', icon: '🎬' },
                { id: 'tiktok', label: 'টিকটক লাইক/ফলো', icon: '🎵' },
                { id: 'facebook', label: 'ফেসবুক লাইক', icon: '👍' },
                { id: 'app', label: 'অ্যাপ ডাউনলোড', icon: '📱' },
                { id: 'telegram', label: 'টেলিগ্রাম', icon: '✈️' },
                { id: 'website', label: 'সাইট ভিজিট', icon: '🌐' }
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as any)}
                  className={`p-2 rounded-xl text-center text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    category === c.id
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              কাজের শিরোনাম:
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: চ্যানেল সাবস্ক্রাইব করুন ও বেল আইকন বাজান"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Target URL */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              কাজের লিঙ্ক (YouTube / Facebook / App Link):
            </label>
            <input
              type="url"
              required
              placeholder="https://..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Target Workers Quantity */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
              <span>কতজন ইউজার কাজ করবে?</span>
              <span className="text-emerald-400 font-mono text-sm">{targetWorkers} জন</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[20, 50, 100, 200].map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setTargetWorkers(w)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                    targetWorkers === w
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {w} জন
                </button>
              ))}
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">মোট খরচ (BDT):</span>
              <span className="text-lg font-black text-emerald-400">৳{totalCost} BDT</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">প্রতি কাজে ইউজার পাবে:</span>
              <span className="text-xs font-bold text-amber-400">+25 কয়েন</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              পেমেন্ট মাধ্যম নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-900/40 border-pink-500 text-pink-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <span>বিকাশ (Personal)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-900/40 border-orange-500 text-orange-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <span>নগদ (Personal)</span>
              </button>
            </div>
          </div>

          {/* Admin Payment Number Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">
                {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} সেন্ড মানি নম্বর:
              </span>
              <span className="text-sm font-black text-white font-mono tracking-wider">
                {activeAdminNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(activeAdminNumber)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
            >
              {copiedNumber === activeAdminNumber ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>কপি</span>
            </button>
          </div>

          {/* Sender Phone & TrxID */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                প্রেরক নম্বর:
              </label>
              <input
                type="tel"
                required
                placeholder="017xxxxxxxx"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                পেমেন্ট TrxID:
              </label>
              <input
                type="text"
                required
                placeholder="9K84X2..."
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'কাজ পোস্ট ও পেমেন্ট কনফার্ম করুন'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
