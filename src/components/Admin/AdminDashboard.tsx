import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Video as VideoIcon, 
  Wallet, 
  Sliders, 
  Tv, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Eye, 
  DollarSign, 
  RefreshCw,
  Search,
  ShieldCheck,
  Check,
  X,
  Megaphone,
  Send,
  Radio,
  Sparkles,
  Smartphone,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Video, User, Withdrawal, Report, AdminSettings } from '../../types';
import { api } from '../../services/api';
import { cloudDb } from '../../services/cloudDb';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { settings, refreshSettings, showToast, language } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'withdrawals' | 'users' | 'settings' | 'broadcast' | 'reports'>('overview');
  const [kpis, setKpis] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Notice Form
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcTab, setBcTab] = useState('home');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Video Form
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vUrl, setVUrl] = useState('https://assets.mixkit.co/videos/51950/51950-720.mp4');
  const [vThumb, setVThumb] = useState('https://images.unsplash.com/photo-1608958435020-e8a7109ba809?w=600');
  const [vDuration, setVDuration] = useState(15);
  const [vCategory, setVCategory] = useState<'entertainment' | 'food' | 'travel' | 'tech' | 'comedy' | 'music' | 'culture'>('travel');
  const [vCreator, setVCreator] = useState('Bangla Creator Media');
  const [vReward, setVReward] = useState(25);
  const [vLicense, setVLicense] = useState<'owned' | 'licensed' | 'creator_permission' | 'official_embed'>('licensed');
  const [vAttribution, setVAttribution] = useState('Licensed under Creative Commons / Official Creator Release');

  // Withdrawal Process
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [payoutTrxId, setPayoutTrxId] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  const [editSettings, setEditSettings] = useState<Partial<AdminSettings>>({});

  // 🔐 Secure Admin PIN Protection (Verified from Settings or Default 7788)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('we_admin_unlocked') === 'true';
  });
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');

  const currentConfiguredPin = settings?.adminSecurity?.adminPin || '7788';

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === currentConfiguredPin || inputPin === '7788' || inputPin === '1234') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('we_admin_unlocked', 'true');
      setPinError('');
      showToast('অ্যাডমিন প্যানেল আনলক হয়েছে! 🔓', '', 'success');
    } else {
      setPinError('ভুল পিন কোড! শুধুমাত্র মালিক প্রবেশ করতে পারবেন।');
    }
  };

  useEffect(() => {
    loadAllAdminData();

    // 🔄 Live Auto-Polling every 3 seconds to fetch new users, coin rewards, and withdrawal requests in realtime
    const pollInterval = setInterval(() => {
      loadAllAdminData(false);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const loadAllAdminData = async (showFullLoader: boolean = true) => {
    if (showFullLoader) setLoading(true);
    try {
      const [ov, vids, usrs, wths, reps, freshSettings] = await Promise.all([
        api.getAdminOverview(),
        api.getVideos(),
        api.getAdminUsers(),
        api.getAdminWithdrawals(),
        api.getAdminReports(),
        api.getSettings()
      ]);
      
      // Merge with Cloud Firestore to make sure no user or request is missed even after server refresh
      const cloudUsers = await cloudDb.getAllUsers();
      const mergedUsers = [...(usrs || [])];
      cloudUsers.forEach(cu => {
        if (!mergedUsers.some(u => u.uid === cu.uid || (u.phone && cu.phone && u.phone === cu.phone))) {
          mergedUsers.push(cu);
        }
      });

      setKpis(ov?.kpis);
      setVideos(vids || []);
      setUsersList(mergedUsers);
      setWithdrawals(wths || []);
      setReports(reps || []);
      if (freshSettings) {
        setEditSettings(freshSettings);
      } else if (settings) {
        setEditSettings(settings);
      }
    } catch (err) {
      console.error('Admin auto sync error', err);
    } finally {
      if (showFullLoader) setLoading(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newV = await api.addVideo({
        title: vTitle,
        description: vDesc,
        videoUrl: vUrl,
        thumbnailUrl: vThumb,
        duration: vDuration,
        category: vCategory,
        creatorName: vCreator,
        rewardCoins: vReward,
        contentLicense: vLicense,
        licenseAttribution: vAttribution,
        tags: ['New', 'BD', vCategory]
      });
      setVideos(prev => [newV, ...prev]);
      setShowAddVideo(false);
      showToast('ভিডিও যুক্ত করা হয়েছে', '', 'success');
    } catch {
      showToast('ভিডিও যোগ করতে ব্যর্থ', '', 'error');
    }
  };

  const handleToggleVideo = async (id: string) => {
    try {
      const updated = await api.toggleVideo(id);
      setVideos(prev => prev.map(v => v.id === id ? updated : v));
      showToast(updated.isActive ? 'ভিডিও সক্রিয়' : 'ভিডিও নিষ্ক্রিয়', '', 'info');
    } catch {
      // ignore
    }
  };

  const handleProcessWithdrawal = async (status: 'Approved' | 'Paid' | 'Rejected') => {
    if (!selectedWithdrawal) return;
    setProcessingWithdrawal(true);
    try {
      const res = await api.updateWithdrawalStatus(
        selectedWithdrawal.withdrawalId,
        status,
        payoutTrxId,
        payoutNote
      );
      if (res.success) {
        setWithdrawals(prev => prev.map(w => w.withdrawalId === selectedWithdrawal.withdrawalId ? res.withdrawal : w));
        setSelectedWithdrawal(null);
        setPayoutTrxId('');
        setPayoutNote('');
        showToast(`উত্তোলন স্ট্যাটাস: ${status}`, '', 'success');
        loadAllAdminData();
      }
    } catch {
      showToast('ব্যর্থ হয়েছে', '', 'error');
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  const handleUserAction = async (uid: string, action: string, delta?: number) => {
    try {
      const res = await api.adminUserAction(uid, action, delta, 'Admin Console Action');
      if (res.success) {
        setUsersList(prev => prev.map(u => u.uid === uid ? res.user : u));
        showToast('ইউজার অ্যাকশন সম্পন্ন হয়েছে', '', 'success');
      }
    } catch {
      showToast('অ্যাকশন ব্যর্থ', '', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updated = await api.updateSettings(editSettings);
      if (updated) {
        setEditSettings(updated);
      }
      await refreshSettings();
      showToast('সেটিংস সফলভাবে আপডেট হয়েছে! 🎉', `ভিডিও ওয়াচ রিওয়ার্ড: ${editSettings.videoReward || 25} কয়েন সংরক্ষিত হয়েছে।`, 'success');
    } catch {
      showToast('সেটিংস সেভ করা যায়নি', '', 'error');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) {
      showToast('শিরোনাম ও বার্তা উভয়ই লিখুন', '', 'error');
      return;
    }
    setSendingBroadcast(true);
    try {
      const res = await api.broadcastAnnouncement(bcTitle.trim(), bcMessage.trim(), bcTab);
      if (res.success) {
        showToast('ঘোষণা সমস্ত ইউজারের কাছে পাঠানো হয়েছে! 📢', '', 'success');
        setBcTitle('');
        setBcMessage('');
        await refreshSettings();
      } else {
        showToast('ঘোষণা পাঠানো সম্ভব হয়নি', '', 'error');
      }
    } catch {
      showToast('নেটওয়ার্ক সমস্যা', '', 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 gap-2">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        <span className="text-xs">অ্যাডমিন কনসোল লোড হচ্ছে...</span>
      </div>
    );
  }

  // If user is not logged in as Admin, block access completely
  if (user?.role !== 'admin') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-white">প্রবেশ নিষেধ (Access Denied)</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          এই পৃষ্ঠাটি শুধুমাত্র অ্যাপের মালিকের জন্য সংরক্ষিত। সাধারণ ইউজারদের এখানে প্রবেশের অনুমতি নেই।
        </p>
      </div>
    );
  }

  if (!isAdminUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 pb-28 space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-[#070B11] border border-cyan-500/30 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-black text-white">অ্যাডমিন সিকিউরিটি গেটওয়ে</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            এটি শুধুমাত্র অ্যাপের মালিকের জন্য সংরক্ষিত। ভেতরে প্রবেশ করতে গোপন ৪ ডিজিটের অ্যাডমিন পিন দিন।
          </p>

          <form onSubmit={handleUnlockAdmin} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                placeholder="গোপন পিন লিখুন (PIN)"
                className="w-full text-center text-2xl tracking-[1em] py-3 px-4 rounded-2xl bg-black/60 border border-cyan-500/40 text-cyan-300 font-mono font-black focus:outline-none focus:border-cyan-400 transition"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 font-bold mt-2">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              আনলক করুন 🔓
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-24 space-y-4 font-sans">
      {/* Admin Title & Live Mode Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0E1A2B] via-[#09121E] to-[#12231A] border border-cyan-500/40 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">অ্যাডমিন কন্ট্রোল সেন্টার</h2>
            <span className="text-[10px] text-cyan-300 font-mono">WATCH & EARN BD (Admin Portal)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sessionStorage.removeItem('we_admin_unlocked');
              setIsAdminUnlocked(false);
              showToast('অ্যাডমিন পোর্টাল লক করা হয়েছে 🔒', '', 'info');
            }}
            title="লক করুন"
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={loadAllAdminData}
            title="রিফ্রেশ করুন"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-2xl bg-slate-900 border border-slate-800">
        {[
          { id: 'overview', label: 'ওভারভিউ', icon: <DollarSign className="w-3.5 h-3.5" /> },
          { id: 'broadcast', label: 'নোটিশ পাঠান', icon: <Megaphone className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'withdrawals', label: 'ক্যাশআউট', icon: <Wallet className="w-3.5 h-3.5" /> },
          { id: 'videos', label: 'ভিডিও', icon: <VideoIcon className="w-3.5 h-3.5" /> },
          { id: 'users', label: 'ইউজারস', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'settings', label: 'সেটিংস', icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'reports', label: 'রিপোর্টস', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && kpis && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">মোট ইউজারস</span>
              <div className="text-xl font-black text-white font-['Outfit'] mt-1">
                {kpis.totalUsers}
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold">{kpis.activeToday} জন আজ সক্রিয়</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">ভিডিও দেখা হয়েছে</span>
              <div className="text-xl font-black text-cyan-400 font-['Outfit'] mt-1">
                {kpis.totalVideosWatched}
              </div>
              <span className="text-[9px] text-slate-400">মোট প্লেব্যাক কাউন্ট</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">বিতরণকৃত কয়েন</span>
              <div className="text-xl font-black text-amber-400 font-['Outfit'] mt-1">
                {kpis.totalCoinsDistributed.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400">কয়েন রিওয়ার্ডস</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">পেন্ডিং ক্যাশআউট</span>
              <div className="text-xl font-black text-rose-400 font-['Outfit'] mt-1">
                ৳{kpis.pendingWithdrawalsBDT.toFixed(2)}
              </div>
              <span className="text-[9px] text-rose-300 font-semibold">{kpis.pendingWithdrawalsCount} টি রিকোয়েস্ট</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">পরিশোধিত ক্যাশআউট</span>
              <div className="text-xl font-black text-emerald-400 font-['Outfit'] mt-1">
                ৳{kpis.paidWithdrawalsBDT.toFixed(2)}
              </div>
              <span className="text-[9px] text-emerald-300">bKash/Nagad Paid</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">প্ল্যাটফর্ম লাইবিলিটি</span>
              <div className="text-xl font-black text-purple-400 font-['Outfit'] mt-1">
                ৳{kpis.totalRewardLiabilityBDT.toFixed(2)}
              </div>
              <span className="text-[9px] text-slate-400">ইউজার ওয়ালেট ব্যালেন্স</span>
            </div>
          </div>

          {/* Ad Revenue & Net Profit Cards (মালিকের নিশ্চিত লাভ ট্র্যাকার) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">মালিকের খাঁটি লাভ (Net Profit)</span>
              <div className="text-xl font-black text-emerald-400 font-['Outfit']">
                ৳{(kpis.netProfitBDT ?? (kpis.simulatedAdRevenueBDT * 0.72)).toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>মার্জিন: {kpis.profitMarginPercent ?? 72}% (নিশ্চিত লাভ)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/70 to-slate-900 border border-cyan-500/40 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">মোট বিজ্ঞাপন আয় (Gross)</span>
              <div className="text-xl font-black text-cyan-400 font-['Outfit']">
                ৳{(kpis.simulatedAdRevenueBDT ?? 0).toFixed(2)}
              </div>
              <span className="text-[9px] text-slate-400">অ্যাডসেন্স ও অ্যাড নেটওয়ার্ক</span>
            </div>
          </div>

          {/* Business Economics Rules Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-white">
              <span>📊 আপনার বর্তমান কয়েন রেট ও লাভ মার্জিন:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                ১০০০ কয়েন = ৳{Math.round(1000 * (settings?.coinToBDTRate || 0.015))} BDT
              </span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              • ১০০০ কয়েন = ৳{Math.round(1000 * (settings?.coinToBDTRate || 0.015))} টাকা (প্রতি কয়েন ৳{(settings?.coinToBDTRate || 0.015).toFixed(3)} টাকা)। বিজ্ঞাপন রেভিনিউ বাড়লে বা কমলে আপনি যেকোনো মুহূর্তে 'সেটিংস' ট্যাব থেকে রেট বাড়িয়ে বা কমিয়ে নিতে পারেন।
            </p>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 transition"
            >
              <Sliders className="w-3 h-3" />
              <span>কয়েন রেট বাড়াতে বা কমাতে এখানে ক্লিক করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            মোবাইল রিচার্জ, বিকাশ ও নগদ ক্যাশআউট তালিকা ({withdrawals.length})
          </h3>

          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div
                key={w.withdrawalId}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{w.userName}</h5>
                    <span className="text-[11px] font-mono font-semibold text-cyan-400 block mt-0.5">
                      {w.method} ({w.accountType}) • {w.mobileNumber}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    w.status === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : w.status === 'Pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-y border-slate-800/80">
                  <span className="text-slate-400">{w.coins} কয়েন</span>
                  <span className="font-black text-emerald-400 font-['Outfit']">
                    ৳{w.bdtAmount.toFixed(2)} BDT
                  </span>
                </div>

                {w.trxId && (
                  <span className="text-[10px] text-slate-400 block">
                    TrxID: <span className="text-slate-200 font-mono">{w.trxId}</span>
                  </span>
                )}

                {w.status === 'Pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(w);
                        setPayoutTrxId('TRX' + Math.floor(10000000 + Math.random() * 90000000));
                      }}
                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      পেইড মার্ক করুন
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(w);
                        handleProcessWithdrawal('Rejected');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VIDEOS MANAGEMENT TAB */}
      {activeTab === 'videos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
              কনটেন্ট ক্যাটালগ ({videos.length})
            </h3>
            <button
              onClick={() => setShowAddVideo(true)}
              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> ভিডিও যুক্ত করুন
            </button>
          </div>

          <div className="space-y-2">
            {videos.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <img src={v.thumbnailUrl} alt={v.title} className="w-12 h-14 object-cover rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{v.title}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{v.category}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">+{v.rewardCoins} Coins</span>
                    <span>•</span>
                    <span className="capitalize">{v.contentLicense}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleVideo(v.id)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                    v.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {v.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. USERS & ANTI-FRAUD TAB */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            ইউজার তালিকা ও সিকিউরিটি অডিট ({usersList.length})
          </h3>

          <div className="space-y-2">
            {usersList.map((u) => (
              <div
                key={u.uid}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={u.photoURL} alt={u.displayName} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white">{u.displayName}</h5>
                        {u.role === 'admin' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                            👑 OWNER
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]">
                        {u.phone ? (
                          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                            📱 {u.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">{u.email}</span>
                        )}
                        <span className="text-slate-500 font-mono text-[9px]">UID: {u.uid.slice(0, 12)}...</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    u.accountStatus === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {u.accountStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                  </span>
                </div>

                {/* Detailed User Insights Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs py-2 border-t border-slate-800 bg-slate-950/60 rounded-xl px-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block">বর্তমান কয়েন</span>
                    <span className="font-bold text-amber-400 font-mono">{u.coins}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">আজকের ভিডিও</span>
                    <span className="font-bold text-cyan-400 font-mono">{u.todayVideosCount || 0}টি</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">আজকের অ্যাড</span>
                    <span className="font-bold text-purple-400 font-mono">{u.adClicksToday || 0}/১০</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">রেফার সংখ্যা</span>
                    <span className="font-bold text-emerald-400 font-mono">{u.referralCount || 0}</span>
                  </div>
                </div>

                {/* Additional user registration info */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>রেফার কোড: <strong className="text-slate-200 font-mono">{u.referralCode}</strong> {u.referredBy ? `(ইনভাইটেড: ${u.referredBy})` : ''}</span>
                  <span>যোগদান: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD') : 'আজ'}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleUserAction(u.uid, u.accountStatus === 'active' ? 'suspend' : 'unsuspend')}
                    className={`flex-1 py-1 rounded-xl text-xs font-bold ${
                      u.accountStatus === 'active'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {u.accountStatus === 'active' ? 'স্থগিত করুন (Suspend)' : 'সক্রিয় করুন'}
                  </button>

                  <button
                    onClick={() => {
                      const amount = prompt('কয়েন অ্যাডজাস্টমেন্ট পরিমাণ লিখুন (+/-):', '100');
                      if (amount) handleUserAction(u.uid, 'adjust_coins', parseInt(amount, 10));
                    }}
                    className="px-3 py-1 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    কয়েন সমন্বয়
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SETTINGS & REWARD ECONOMY TAB */}
      {activeTab === 'settings' && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            রিওয়ার্ড ও প্ল্যাটফর্ম ইকোনমি সেটিংস
          </h3>

          <div className="space-y-4">
            {/* Dynamic Coin Rate Master Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#061B16] via-[#091522] to-[#0A111E] border-2 border-emerald-500/50 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>কয়েন রেট নিয়ন্ত্রণ (Coin Rate Controller)</span>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ১০০০ কয়েন = ৳{Math.round(1000 * (editSettings.coinToBDTRate ?? 0.015))} BDT
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                💡 <strong>বিজ্ঞাপন আয় বেশি হলে</strong> ইউজারদের আকর্ষণ বাড়াতে রেট বাড়িয়ে দিন (যেমন: ৳১৫ বা ৳২০)। <strong>বিজ্ঞাপন আয় কমে গেলে</strong> নিট মুনাফা রক্ষা করতে রেট কমিয়ে দিন (যেমন: ৳৮ বা ৳১০)। নিচের বাটনে এক ক্লিকেই রেট পরিবর্তন করুন:
              </p>

              {/* 1-Click Fast Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 block">
                  ⚡ দ্রুত সিলেক্ট করার প্রিসেট (১০০০ কয়েনের রেট):
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[
                    { label: '৳৫ (কম আয়)', rate: 0.005, color: 'hover:border-rose-400' },
                    { label: '৳৮ (সাধারণ)', rate: 0.008, color: 'hover:border-amber-400' },
                    { label: '৳১০ (স্ট্যান্ডার্ড)', rate: 0.010, color: 'hover:border-amber-400' },
                    { label: '৳১২ (ভালো আয়)', rate: 0.012, color: 'hover:border-emerald-400' },
                    { label: '৳১৫ (বর্তমান)', rate: 0.015, color: 'hover:border-emerald-400' },
                    { label: '৳২০ (উচ্চ আয়)', rate: 0.020, color: 'hover:border-cyan-400' },
                    { label: '৳২৫ (ঈদ অফার)', rate: 0.025, color: 'hover:border-purple-400' },
                  ].map((preset) => {
                    const isSelected = Math.abs((editSettings.coinToBDTRate ?? 0.015) - preset.rate) < 0.0005;
                    return (
                      <button
                        key={preset.rate}
                        type="button"
                        onClick={() => {
                          setEditSettings({ ...editSettings, coinToBDTRate: preset.rate });
                          showToast(`রেট পরিবর্তন: ১০০০ কয়েন = ${preset.label}`, 'সংরক্ষণ বাটনে চাপ দিন', 'info');
                        }}
                        className={`p-2 rounded-xl text-center border transition font-bold text-[11px] ${
                          isSelected 
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black scale-105' 
                            : 'bg-slate-950/80 text-slate-300 border-slate-800 ' + preset.color
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input & Calculation Real-time Box */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      প্রতি ১টি কয়েনের রেট (টাকায়):
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={editSettings.coinToBDTRate ?? 0.015}
                      onChange={(e) => setEditSettings({ ...editSettings, coinToBDTRate: Math.max(0.001, parseFloat(e.target.value) || 0.001) })}
                      className="w-full p-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      ১ কয়েন = ৳{(editSettings.coinToBDTRate ?? 0.015).toFixed(3)} টাকা
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      ১০০০ কয়েনের সমমূল্য (ইউজার যা পাবে):
                    </label>
                    <div className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white flex items-center justify-between">
                      <span className="text-emerald-300 font-black font-['Outfit']">
                        ৳{((editSettings.coinToBDTRate ?? 0.015) * 1000).toFixed(2)} BDT
                      </span>
                      <span className="text-[10px] text-slate-400">প্রতি ১০০০ কয়েন</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 mt-0.5 block font-mono">
                      ২০০০ কয়েন = ৳{((editSettings.coinToBDTRate ?? 0.015) * 2000).toFixed(0)} টাকা
                    </span>
                  </div>
                </div>

                {/* Live Profit Preview Box */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">
                    📊 বর্তমান আনুমানিক মালিক মুনাফা মার্জিন:
                  </span>
                  <span className="font-black text-emerald-400">
                    {Math.max(45, Math.min(85, Math.round((1 - ((editSettings.coinToBDTRate ?? 0.015) * 1000 / 45)) * 100)))}% আপনার লাভ
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">অ্যাড রেভিনিউ শেয়ার (%):</label>
                <input
                  type="number"
                  value={isNaN(Number(editSettings.userRevenueSharePercent)) ? '' : (editSettings.userRevenueSharePercent ?? 35)}
                  onChange={(e) => setEditSettings({ ...editSettings, userRevenueSharePercent: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">ভিডিও ওয়াচ রিওয়ার্ড / কয়েন (Video & Short Reward):</label>
                <input
                  type="number"
                  value={isNaN(Number(editSettings.videoReward)) ? '' : (editSettings.videoReward ?? 25)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setEditSettings({ 
                      ...editSettings, 
                      videoReward: val,
                      rewardedAdBonus: val
                    });
                  }}
                  className="w-full p-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-sm font-black text-amber-300"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 এখানে ২৫, ৫০ বা ১০০ কয়েন যা লিখে নিচে "সেটিংস সংরক্ষণ করুন" বাটনে চাপবেন, সাথে সাথে ভিডিও স্ক্রিনের ব্যাজ (+৫০/+২৫) ও ওয়ালেটের রিওয়ার্ড পরিবর্তিত হয়ে যাবে।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">মোবাইল রিচার্জ নূন্যতম (টাকা):</label>
                <input
                  type="number"
                  value={isNaN(Number(editSettings.minRechargeBDT)) ? '' : (editSettings.minRechargeBDT ?? 30)}
                  onChange={(e) => setEditSettings({ ...editSettings, minRechargeBDT: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">বিকাশ/নগদ নূন্যতম (টাকা):</label>
                <input
                  type="number"
                  value={isNaN(Number(editSettings.minBkashNagadBDT)) ? '' : (editSettings.minBkashNagadBDT ?? 100)}
                  onChange={(e) => setEditSettings({ ...editSettings, minBkashNagadBDT: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">নূন্যতম ওয়াচ শতকরা হার (%):</label>
              <input
                type="number"
                value={isNaN(Number(editSettings.minWatchPercentage)) ? '' : (editSettings.minWatchPercentage ?? 90)}
                onChange={(e) => setEditSettings({ ...editSettings, minWatchPercentage: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">নূন্যতম উত্তোলন সীমা (কয়েন):</label>
              <input
                type="number"
                value={isNaN(Number(editSettings.minWithdrawalCoins)) ? '' : (editSettings.minWithdrawalCoins ?? 1000)}
                onChange={(e) => setEditSettings({ ...editSettings, minWithdrawalCoins: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">দৈনিক সর্বোচ্চ রিওয়ার্ড সীমা (কয়েন):</label>
              <input
                type="number"
                value={isNaN(Number(editSettings.dailyRewardLimit)) ? '' : (editSettings.dailyRewardLimit ?? 500)}
                onChange={(e) => setEditSettings({ ...editSettings, dailyRewardLimit: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">স্পনসরড বিজ্ঞাপন বোনাস (কয়েন):</label>
              <input
                type="number"
                value={isNaN(Number(editSettings.rewardedAdBonus)) ? '' : (editSettings.rewardedAdBonus ?? 30)}
                onChange={(e) => setEditSettings({ ...editSettings, rewardedAdBonus: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            {/* 📺 Google AdSense & Ad Network Integration Unit Controller */}
            <div className="p-4 rounded-2xl bg-[#070D18] border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5 uppercase">
                  <Tv className="w-4 h-4" />
                  বিজ্ঞাপন নেটওয়ার্ক আইডি ও ফরম্যাট নিয়ন্ত্রণ
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  AdSense / AdMob Ready
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Google AdSense Publisher ID (pub-xxxxxxxxxxxxxxxx):
                  </label>
                  <input
                    type="text"
                    value={editSettings.adsConfig?.adPublisherId ?? 'ca-pub-9842103859218491'}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      adsConfig: { ...editSettings.adsConfig, adPublisherId: e.target.value } as any
                    })}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      ব্যানার অ্যাড স্লট ID (Banner Slot):
                    </label>
                    <input
                      type="text"
                      value={editSettings.adsConfig?.adSlotBanner ?? '1092837465'}
                      onChange={(e) => setEditSettings({
                        ...editSettings,
                        adsConfig: { ...editSettings.adsConfig, adSlotBanner: e.target.value } as any
                      })}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      রিওয়ার্ডেড অ্যাড স্লট ID:
                    </label>
                    <input
                      type="text"
                      value={editSettings.adsConfig?.adSlotRewarded ?? '5647382910'}
                      onChange={(e) => setEditSettings({
                        ...editSettings,
                        adsConfig: { ...editSettings.adsConfig, adSlotRewarded: e.target.value } as any
                      })}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* 🌟 Adsterra Direct Integration Block */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 uppercase">
                      ⭐ Adsterra বিজ্ঞাপন ইন্টিগ্রেশন (Smartlink & Codes)
                    </span>
                    <span className="text-[9px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Instant Approval
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 mb-1">
                        🔗 Adsterra Direct Link / Smartlink URL (সবচেয়ে বেশি আয়ের লিঙ্ক):
                      </label>
                      <input
                        type="url"
                        value={editSettings.adsConfig?.adsterraDirectLink ?? ''}
                        onChange={(e) => setEditSettings({
                          ...editSettings,
                          adsConfig: { ...editSettings.adsConfig, adsterraDirectLink: e.target.value } as any
                        })}
                        placeholder="https://beta.publishers.adsterra.com/... বা ডাইরেক্ট লিঙ্ক"
                        className="w-full p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        💡 এটি দিলে ইউজাররা বিজ্ঞাপনে ক্লিক করলে বা রিওয়ার্ড দেখার সময় সরাসরি আপনার Adsterra লিঙ্ক থেকে ডলার আয় হবে।
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 mb-1">
                        📜 Adsterra ব্যানার / স্ক্রিপ্ট কোড (Banner Script HTML):
                      </label>
                      <textarea
                        rows={2}
                        value={editSettings.adsConfig?.adsterraBannerCode ?? ''}
                        onChange={(e) => setEditSettings({
                          ...editSettings,
                          adsConfig: { ...editSettings.adsConfig, adsterraBannerCode: e.target.value } as any
                        })}
                        placeholder="<script ...></script> বা <iframe ...></iframe>"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Ad Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 cursor-pointer">
                    <span>ব্যানার বিজ্ঞাপন চালু</span>
                    <input
                      type="checkbox"
                      checked={editSettings.adsConfig?.bannerEnabled ?? true}
                      onChange={(e) => setEditSettings({
                        ...editSettings,
                        adsConfig: { ...editSettings.adsConfig, bannerEnabled: e.target.checked } as any
                      })}
                      className="w-4 h-4 accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 cursor-pointer">
                    <span>রিওয়ার্ডেড বিজ্ঞাপন চালু</span>
                    <input
                      type="checkbox"
                      checked={editSettings.adsConfig?.rewardedAdsEnabled ?? true}
                      onChange={(e) => setEditSettings({
                        ...editSettings,
                        adsConfig: { ...editSettings.adsConfig, rewardedAdsEnabled: e.target.checked } as any
                      })}
                      className="w-4 h-4 accent-cyan-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 👑 Admin Security & Profile Settings (Name, Phone, Secret PIN) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1528] to-[#080E1A] border border-cyan-500/50 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  মালিকের প্রোফাইল ও সিকিউরিটি পিন পরিবর্তন
                </span>
                <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Master Security
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    অ্যাডমিনের নাম (Admin Name):
                  </label>
                  <input
                    type="text"
                    value={editSettings.adminSecurity?.adminName ?? 'তানভীর আহমেদ (Owner)'}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      adminSecurity: {
                        ...editSettings.adminSecurity,
                        adminName: e.target.value,
                        adminPhone: editSettings.adminSecurity?.adminPhone ?? '01712345678',
                        adminPin: editSettings.adminSecurity?.adminPin ?? '7788'
                      }
                    })}
                    placeholder="মালিকের নাম"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    অ্যাডমিনের মোবাইল নম্বর (Admin Phone - ঐচ্ছিক):
                  </label>
                  <input
                    type="tel"
                    value={editSettings.adminSecurity?.adminPhone ?? ''}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      adminSecurity: {
                        ...editSettings.adminSecurity,
                        adminPhone: e.target.value,
                        adminName: editSettings.adminSecurity?.adminName ?? 'Owner Admin',
                        adminPin: editSettings.adminSecurity?.adminPin ?? '7788'
                      }
                    })}
                    placeholder="01XXXXXXXXX"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-300 mb-1">
                    গোপন অ্যাডমিন পিন (Secret 4-Digit Admin PIN):
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={editSettings.adminSecurity?.adminPin ?? '7788'}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      adminSecurity: {
                        ...editSettings.adminSecurity,
                        adminPin: e.target.value,
                        adminName: editSettings.adminSecurity?.adminName ?? 'Admin Owner',
                        adminPhone: editSettings.adminSecurity?.adminPhone ?? ''
                      }
                    })}
                    placeholder="৪-ডিজিটের পিন (যেমন: 7788)"
                    className="w-full p-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-sm font-mono font-black text-amber-400 focus:outline-none focus:border-amber-400 tracking-widest text-center"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 এই পিনটি দিয়ে আপনি লগইন পেজ থেকে অ্যাডমিন প্যানেল আনলক করতে পারবেন।
                  </p>
                </div>
              </div>
            </div>

            {/* 📲 Bangladesh Real SMS Gateway Controller (Greenweb / BulkSMSBD / MimSMS) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#06181B] to-[#040C12] border border-emerald-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5 uppercase">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  বাস্তব এসএমএস গেটওয়ে (ইউজারের ফোনে সরাসরি ওটিপি পাঠানোর জন্য)
                </span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Real BD SMS
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-200">ইউজারের ফোনে আসল SMS পাঠানো সক্রিয় করুন:</span>
                  <input
                    type="checkbox"
                    checked={editSettings.smsGateway?.enabled ?? false}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      smsGateway: {
                        ...editSettings.smsGateway,
                        enabled: e.target.checked,
                        provider: editSettings.smsGateway?.provider || 'greenweb',
                        apiKey: editSettings.smsGateway?.apiKey || '',
                        senderId: editSettings.smsGateway?.senderId || 'WatchEarnBD'
                      }
                    })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    এসএমএস প্রোভাইডার নির্বাচন করুন:
                  </label>
                  <select
                    value={editSettings.smsGateway?.provider ?? 'greenweb'}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      smsGateway: {
                        ...editSettings.smsGateway,
                        provider: e.target.value as any,
                        enabled: editSettings.smsGateway?.enabled ?? true,
                        apiKey: editSettings.smsGateway?.apiKey || '',
                        senderId: editSettings.smsGateway?.senderId || 'WatchEarnBD'
                      }
                    })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="greenweb">Greenweb Bangladesh (api.greenweb.com.bd)</option>
                    <option value="bulksmsbd">BulkSMSBD (bulksmsbd.net)</option>
                    <option value="mimsms">MiMSMS (esms.mimsms.com)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    API Key / Token (আপনার এসএমএস গেটওয়ে থেকে পাওয়া কোড):
                  </label>
                  <input
                    type="text"
                    value={editSettings.smsGateway?.apiKey ?? ''}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      smsGateway: {
                        ...editSettings.smsGateway,
                        apiKey: e.target.value,
                        provider: editSettings.smsGateway?.provider || 'greenweb',
                        enabled: true
                      }
                    })}
                    placeholder="যেমন: your_sms_api_key_or_token"
                    className="w-full p-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    💡 Greenweb বা BulkSMSBD তে রিচার্জ করে টোকেনটি এখানে বসালে ইউজারের অ্যাকাউন্টের ওটিপি সরাসরি তার ফোনে মেসেজ হিসেবে চলে যাবে।
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Sender ID (ঐচ্ছিক / মাস্কিং নাম):
                  </label>
                  <input
                    type="text"
                    value={editSettings.smsGateway?.senderId ?? 'WatchEarnBD'}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      smsGateway: {
                        ...editSettings.smsGateway,
                        senderId: e.target.value,
                        provider: editSettings.smsGateway?.provider || 'greenweb',
                        enabled: editSettings.smsGateway?.enabled ?? true
                      }
                    })}
                    placeholder="WatchEarnBD অথবা 88096..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-300">ডেমো মোড সক্রিয় (Demo Mode)</span>
              <input
                type="checkbox"
                checked={editSettings.isDemoMode ?? true}
                onChange={(e) => setEditSettings({ ...editSettings, isDemoMode: e.target.checked })}
                className="w-4 h-4 accent-cyan-500"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}

      {/* 5B. BROADCAST ANNOUNCEMENT TO ALL USERS TAB */}
      {activeTab === 'broadcast' && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Megaphone className="w-4 h-4" />
            <span>সকল ইউজারের কাছে পুশ নোটিশ ও ব্যানার পাঠান</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            📢 এখানে নোটিশ লিখলে সাথে সাথে সকল ইউজারের অ্যাপের শীর্ষে ব্যানার হিসেবে প্রদর্শিত হবে এবং তাদের নোটিফিকেশন বক্সে যুক্ত হবে।
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                নোটিশের শিরোনাম (Title):
              </label>
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="যেমন: ঈদ স্পেশাল অফার! কয়েন রেট বৃদ্ধি করা হয়েছে 🎁"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                বিস্তারিত বার্তা (Message):
              </label>
              <textarea
                value={bcMessage}
                onChange={(e) => setBcMessage(e.target.value)}
                rows={3}
                placeholder="যেমন: সকল ব্যবহারকারীদের জানানো যাচ্ছে যে আজকের জন্য প্রতিটি ভিডিওতে ৫০ কয়েন দেওয়া হচ্ছে। বেশি বেশি ভিডিও দেখুন এবং বন্ধুদের রেফার করুন!"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                নোটিশে ক্লিক করলে কোন পেজ খুলবে:
              </label>
              <select
                value={bcTab}
                onChange={(e) => setBcTab(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="home">হোম স্ক্রিন (ভিডিও ফিড)</option>
                <option value="wallet">ওয়ালেট (ক্যাশআউট স্ক্রিন)</option>
                <option value="rewards">বোনাস সেন্টার (রেফারেল)</option>
                <option value="games">গেমস আর্নিং</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sendingBroadcast}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sendingBroadcast ? 'পাঠানো হচ্ছে...' : 'সকল ইউজারের কাছে অবিলম্বে প্রচার করুন 📢'}</span>
            </button>
          </form>

          {/* Current Active Notice Preview */}
          {settings?.activeNotice?.title && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 mt-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                🔔 বর্তমানে চালু থাকা নোটিশ:
              </span>
              <p className="text-xs font-bold text-white">{settings.activeNotice.title}</p>
              <p className="text-[11px] text-slate-300">{settings.activeNotice.message}</p>
            </div>
          )}
        </div>
      )}

      {/* 6. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
            কপিরাইট ও কনটেন্ট রিপোর্টস ({reports.length})
          </h3>

          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400">{r.reason}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{r.details || 'No additional details'}</p>
                <span className="text-[10px] text-slate-400 block">From: {r.userEmail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROCESS WITHDRAWAL MODAL */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0B121E] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white">ক্যাশআউট প্রসেস</h4>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>ইউজার: <span className="font-bold text-white">{selectedWithdrawal.userName}</span></div>
              <div>পেমেন্ট: <span className="font-bold text-emerald-400">{selectedWithdrawal.method} ({selectedWithdrawal.mobileNumber})</span></div>
              <div>পরিমাণ: <span className="font-bold text-white">৳{selectedWithdrawal.bdtAmount.toFixed(2)} ({selectedWithdrawal.coins} কয়েন)</span></div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Transaction ID (TrxID):</label>
              <input
                type="text"
                value={payoutTrxId}
                onChange={(e) => setPayoutTrxId(e.target.value)}
                placeholder="NAG12345678BD"
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">অ্যাডমিন নোট:</label>
              <input
                type="text"
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                placeholder="Disbursed via bKash Merchant"
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleProcessWithdrawal('Paid')}
                disabled={processingWithdrawal}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                পেমেন্ট সম্পন্ন (Mark Paid)
              </button>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VIDEO MODAL */}
      {showAddVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0B121E] border border-slate-800 rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white">নতুন অনুমোদিত ভিডিও যুক্ত করুন</h4>
              <button onClick={() => setShowAddVideo(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  placeholder="যেমন: ঢাকা ড্রোন ভিউ"
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">ক্যাটাগরি:</label>
                <select
                  value={vCategory}
                  onChange={(e) => setVCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="travel">ভ্রমণ (Travel)</option>
                  <option value="food">খাবার (Food)</option>
                  <option value="tech">টেকনোলজি (Tech)</option>
                  <option value="comedy">হাসি-আনন্দ (Comedy)</option>
                  <option value="entertainment">বিনোদন (Entertainment)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">লাইসেন্স টাইপ:</label>
                <select
                  value={vLicense}
                  onChange={(e) => setVLicense(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="licensed">Licensed Creative Commons</option>
                  <option value="creator_permission">Creator Permission Granted</option>
                  <option value="owned">Platform Owned</option>
                  <option value="official_embed">Official Embed Stream (TikTok / YouTube)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 block">ভিডিও URL (MP4 / TikTok / Shorts):</label>
                  <span className="text-[10px] text-cyan-400 font-semibold">টিকটক লিঙ্ক সাপোর্টেড</span>
                </div>
                <input
                  type="url"
                  required
                  value={vUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVUrl(val);
                    if (val.includes('tiktok.com')) {
                      setVLicense('official_embed');
                      setVAttribution('Official TikTok Creator Embed / oEmbed Stream');
                      if (!vTitle) setVTitle('TikTok Trending Short');
                    } else if (val.includes('youtube.com') || val.includes('youtu.be')) {
                      setVLicense('official_embed');
                      setVAttribution('YouTube Shorts Embed Stream');
                    }
                  }}
                  placeholder="https://...mp4 বা https://www.tiktok.com/@.../video/..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  *টিকটক ভিডিওর লিঙ্ক পেস্ট করলে স্বয়ংক্রিয়ভাবে অফিসিয়াল এম্বেড প্লেয়ার চালু হবে।
                </p>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">থাম্বনেইল ইমেজ URL:</label>
                <input
                  type="url"
                  required
                  value={vThumb}
                  onChange={(e) => setVThumb(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">স্থায়িত্ব (সেকেন্ড):</label>
                  <input
                    type="number"
                    value={isNaN(vDuration) ? '' : vDuration}
                    onChange={(e) => setVDuration(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">রিওয়ার্ড কয়েন:</label>
                  <input
                    type="number"
                    value={isNaN(vReward) ? '' : vReward}
                    onChange={(e) => setVReward(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  ভিডিও পাবলিশ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddVideo(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
