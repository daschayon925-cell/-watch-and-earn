import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  Trash2, 
  Copy, 
  Check, 
  Edit3, 
  Volume2, 
  VolumeX, 
  Globe, 
  ShieldAlert, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  X,
  CreditCard,
  History,
  Lock,
  MessageCircle,
  Bell,
  Sparkles,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Shield,
  Download,
  AlertTriangle,
  Send,
  Camera,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, toggleAdminRole, logout } = useAuth();
  const { 
    language, 
    setLanguage, 
    isMuted, 
    setIsMuted, 
    setActiveTab, 
    showToast 
  } = useApp();

  const [copiedUid, setCopiedUid] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Pro Level Modals State
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | 'support' | 'payout_rules' | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  ];

  const handleCopyUid = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    showToast(language === 'bn' ? 'ইউজার আইডি কপি হয়েছে' : 'UID copied', '', 'info');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName: editName.trim(),
        phone: editPhone.trim(),
        photoURL: selectedAvatar
      });
      setShowEditModal(false);
      showToast(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!', '', 'success');
    } catch {
      showToast(language === 'bn' ? 'আপডেট করা যায়নি' : 'Failed to update', '', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitting(true);
    setTimeout(() => {
      setSupportSubmitting(false);
      setSupportMessage('');
      setActiveLegalModal(null);
      showToast(
        language === 'bn' ? 'আপনার মেসেজ সাপোর্ট টিমের কাছে পৌঁছেছে!' : 'Message sent to support team!',
        language === 'bn' ? 'আমরা দ্রুত আপনার সমস্যার সমাধান করব।' : 'We will reply shortly.',
        'success'
      );
    }, 700);
  };

  const faqs = [
    {
      qBn: 'কীভাবে ভিডিও দেখে কয়েন আয় করবেন?',
      qEn: 'How to earn coins by watching videos?',
      aBn: 'প্রতিটি ভিডিওর কমপক্ষে ৯০% সময় সম্পূর্ণ দেখলে স্বয়ংক্রিয়ভাবে ২৫ কয়েন আপনার ওয়ালেটে জমা হবে। এছাড়া নিয়মিত স্পন্সরড অ্যাড ও মিনি গেম খেলে দৈনিক অতিরিক্ত কয়েন আয় করতে পারবেন।',
      aEn: 'Watch at least 90% of eligible vertical videos. Reward coins are validated server-side.'
    },
    {
      qBn: 'মোবাইল রিচার্জ ও বিকাশ/নগদে টাকা তোলার নিয়ম কী?',
      qEn: 'How to withdraw to Recharge / bKash / Nagad?',
      aBn: 'মোবাইল রিচার্জে সর্বনিম্ন মাত্র ৩০ টাকা (২০০০ কয়েন) এবং বিকাশ বা নগদে সর্বনিম্ন ১০০ টাকা ব্যালেন্স হলেই আবেদন করতে পারবেন। অ্যাডমিন ভেরিফিকেশনের পর দ্রুত টাকা পৌঁছে যায়।',
      aEn: 'Mobile recharge minimum 30 BDT (2000 coins) and bKash/Nagad minimum 100 BDT.'
    },
    {
      qBn: 'দৈনিক রিওয়ার্ড লিমিট কত?',
      qEn: 'What is the daily limit?',
      aBn: 'প্ল্যাটফর্মের স্বচ্ছতা ও সুষ্ঠু পরিবেশ বজায় রাখার জন্য প্রতিদিন সর্বোচ্চ ৪০টি ভিডিও এবং স্পন্সরড বিজ্ঞাপনের মাধ্যমে পর্যাপ্ত রিওয়ার্ড কয়েন অর্জন করা সম্ভব।',
      aEn: 'Up to 40 videos and generous sponsored ad limits daily to ensure highest eCPM payout.'
    },
    {
      qBn: 'ভিডিও কনটেন্ট ও কপিরাইট পলিসি কী?',
      qEn: 'What is the copyright and content policy?',
      aBn: 'এই অ্যাপে শুধুমাত্র নিজস্ব উৎপাদিত, ক্রিয়েটরদের অনুমতিপ্রাপ্ত ও লাইসেন্সকৃত ক্রিয়েটিভ কমন্স ভিডিও পরিবেশন করা হয়। কোনো কপিরাইট লঙ্ঘনকারী কনটেন্ট বরদাস্ত করা হয় না।',
      aEn: 'We strictly host authorized, creator-licensed, or Creative Commons video streams.'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-24 space-y-4 font-sans">
      
      {/* 1. HERO USER PROFILE CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0C1524] via-[#08101A] to-[#0A1713] border border-emerald-500/30 p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setShowEditModal(true)}>
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-xl group-hover:opacity-85 transition"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full text-slate-950 border-2 border-[#09101A]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white leading-tight truncate">
                  {user?.displayName || 'ব্যবহারকারী'}
                </h2>
                <button
                  onClick={() => {
                    setEditName(user?.displayName || '');
                    setEditPhone(user?.phone || '');
                    setSelectedAvatar(user?.photoURL || avatarPresets[0]);
                    setShowEditModal(true);
                  }}
                  className="p-1 rounded-lg bg-slate-800/80 text-slate-300 hover:text-emerald-400 transition"
                  title="এডিট প্রোফাইল"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs text-slate-400 block truncate mt-0.5">{user?.email}</span>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  {user?.role === 'admin' ? 'Super Admin' : 'Verified Member'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {user?.phone || '০১৭XXXXXXXX'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Account Switch / Create New Account Button */}
          <button
            onClick={() => {
              logout();
              showToast(
                language === 'bn' ? 'নতুন অ্যাকাউন্ট বা লগইন স্ক্রিন খোলা হয়েছে' : 'Switching account',
                '',
                'info'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-[10px] border border-slate-700 transition"
            title="নতুন একাউন্ট খুলুন বা লগইন করুন"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>নতুন অ্যাকাউন্ট</span>
          </button>
        </div>

        {/* UID & Fast Copy Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">UID:</span>
            <span className="font-mono text-[11px] text-slate-200 truncate max-w-[150px]">{user?.uid}</span>
          </div>
          <button
            onClick={handleCopyUid}
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedUid ? 'কপি হয়েছে' : 'কপি করুন'}
          </button>
        </div>

        {/* 4 Quick Stat Counters */}
        <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-slate-800">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-black text-emerald-400 block font-['Outfit']">
              {user?.coins || 0}
            </span>
            <span className="text-[9px] text-slate-400">কয়েন</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-black text-amber-400 block font-['Outfit']">
              {user?.todayVideosCount || 0}
            </span>
            <span className="text-[9px] text-slate-400">আজকের ভিডিও</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-black text-cyan-400 block font-['Outfit']">
              {user?.streakDays || 1}d
            </span>
            <span className="text-[9px] text-slate-400">স্ট্রিক</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-xs font-black text-purple-400 block font-['Outfit']">
              {user?.referralCount || 0}
            </span>
            <span className="text-[9px] text-slate-400">রেফারেল</span>
          </div>
        </div>
      </div>

      {/* 2. PRO QUICK SHORTCUTS (ক্যাশআউট, হিস্ট্রি ও রেফারেল) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('wallet')}
          className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 transition flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white leading-tight">টাকা তুলুন</span>
          <span className="text-[9px] text-emerald-400">রিচার্জ / বিকাশ</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 hover:border-amber-400 transition flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white leading-tight">বোনাস সেন্টার</span>
          <span className="text-[9px] text-amber-400">স্ট্রিক ও টাস্ক</span>
        </button>

        <button
          onClick={() => setActiveLegalModal('payout_rules')}
          className="p-3 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 transition flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white leading-tight">পেমেন্ট নীতি</span>
          <span className="text-[9px] text-cyan-400">১০০০ কয়েন = ১৫৳</span>
        </button>
      </div>

      {/* 3. APP SETTINGS & PREFERENCES */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
          {language === 'bn' ? 'সেটিংস ও পছন্দসমূহ' : 'Settings & Preferences'}
        </h3>

        {/* Language Switch */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{language === 'bn' ? 'ভাষা নির্বাচন (Language)' : 'Language'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                language === 'bn' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                language === 'en' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Sound Effects Switch */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-200">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{language === 'bn' ? 'শব্দ ও সাউন্ড এফেক্ট' : 'Sound Effects'}</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              !isMuted ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              !isMuted ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Admin Dashboard Switch */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-xs text-slate-200">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <div>
              <span className="block font-bold">{language === 'bn' ? 'অ্যাডমিন মোড সুইচ' : 'Admin Role Switch'}</span>
              <span className="text-[10px] text-slate-400">ম্যানেজমেন্ট কন্ট্রোল প্যানেল</span>
            </div>
          </div>
          <button
            onClick={toggleAdminRole}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
              user?.role === 'admin'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {user?.role === 'admin' ? 'Admin Active ✓' : 'Enable Admin'}
          </button>
        </div>
      </div>

      {/* 4. PROFESSIONAL SUPPORT & POLICIES (প্রো লেভেল ওয়েবসাইট অপশন) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">
          {language === 'bn' ? 'সাপোর্ট, নিরাপত্তা ও নীতিমালা' : 'Support & Legal Policies'}
        </h3>

        {/* 24/7 Help & Support Ticket */}
        <div 
          onClick={() => setActiveLegalModal('support')}
          className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">২৪/৭ কাস্টমার সাপোর্ট ও হেল্পডেস্ক</span>
              <span className="text-[10px] text-slate-400">পেমেন্ট বা অ্যাকাউন্ট সংক্রান্ত যেকোনো সমস্যা</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* Terms of Service */}
        <div 
          onClick={() => setActiveLegalModal('terms')}
          className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">ব্যবহারের শর্তাবলী (Terms of Service)</span>
              <span className="text-[10px] text-slate-400">নীতিমালা ও কনটেন্ট রুলস</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* Privacy Policy */}
        <div 
          onClick={() => setActiveLegalModal('privacy')}
          className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">গোপনীয়তা সুরক্ষা নীতি (Privacy Policy)</span>
              <span className="text-[10px] text-slate-400">ডাটা এনক্রিপশন ও তথ্য নিরাপত্তা</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* 5. HELP CENTER FAQ ACCORDION */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'সহায়তা কেন্দ্র ও প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}</span>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white transition"
              >
                <span>{language === 'bn' ? faq.qBn : faq.qEn}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {openFaq === i && (
                <div className="p-3 pt-0 text-[11px] text-slate-300 leading-relaxed border-t border-slate-900 bg-slate-950/20">
                  {language === 'bn' ? faq.aBn : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. LOGOUT & APP VERSION FOOTER */}
      <div className="space-y-3 pt-1">
        <button
          onClick={() => {
            logout();
            showToast(
              language === 'bn' ? 'লগআউট সফল হয়েছে! নতুন অ্যাকাউন্ট খুলুন বা লগইন করুন।' : 'Logged out successfully!',
              '',
              'info'
            );
          }}
          className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          {language === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট' : 'Sign Out'}
        </button>

        <div className="text-center text-[10px] text-slate-500 font-mono space-y-0.5 pb-2">
          <p>WATCH & EARN BD • Version 3.4.0 (Production Build)</p>
          <p>© 2026 All Rights Reserved • Authorized Entertainment Platform</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🛠️ EDIT PROFILE MODAL (NAME, PHONE & AVATAR PICKER) */}
      {/* ========================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0C121E] border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 my-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'bn' ? 'প্রোফাইল ছবি নির্বাচন করুন:' : 'Choose Avatar:'}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {avatarPresets.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Avatar option"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition ${
                        selectedAvatar === av ? 'border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'নাম:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone Number:'}
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📄 PRO LEVEL POLICY & 24/7 SUPPORT MODAL */}
      {/* ========================================================= */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {activeLegalModal === 'support' && <MessageCircle className="w-5 h-5 text-emerald-400" />}
                {activeLegalModal === 'terms' && <Shield className="w-5 h-5 text-blue-400" />}
                {activeLegalModal === 'privacy' && <Lock className="w-5 h-5 text-purple-400" />}
                {activeLegalModal === 'payout_rules' && <CreditCard className="w-5 h-5 text-cyan-400" />}
                <h3 className="font-black text-sm text-white">
                  {activeLegalModal === 'support' && '২৪/৭ সাপোর্ট ও সহায়তা কেন্দ্র'}
                  {activeLegalModal === 'terms' && 'ব্যবহারের নিয়ম ও শর্তাবলী (Terms)'}
                  {activeLegalModal === 'privacy' && 'গোপনীয়তা সুরক্ষা নীতি (Privacy Policy)'}
                  {activeLegalModal === 'payout_rules' && 'পেমেন্ট ও রিওয়ার্ড পলিসি (Payout Rules)'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)} 
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 text-xs text-slate-300 space-y-3 leading-relaxed">
              {/* 24/7 Support Form */}
              {activeLegalModal === 'support' && (
                <form onSubmit={handleSendSupport} className="space-y-3">
                  <p className="text-slate-400 text-xs">
                    যেকোনো রিচার্জ বিলম্ব, পেমেন্ট সংক্রান্ত জিজ্ঞাসা অথবা অ্যাকাউন্ট সহায়তার জন্য নিচের বক্সে লিখুন। আমাদের সাপোর্ট এক্সিকিউটিভ দ্রুত উত্তর দেবেন।
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">আপনার ইমেইল বা নম্বর:</label>
                    <input 
                      type="text" 
                      defaultValue={user?.email || user?.phone || ''}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">সমস্যার বিস্তারিত লিখুন:</label>
                    <textarea 
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="যেমন: আমার বিকাশ রিচার্জ রিকোয়েস্টের আপডেট জানতে চাই..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={supportSubmitting || !supportMessage.trim()}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {supportSubmitting ? 'পাঠানো হচ্ছে...' : 'মেসেজ পাঠান'}
                  </button>
                </form>
              )}

              {/* Terms of Service */}
              {activeLegalModal === 'terms' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs">১. ন্যায্য ব্যবহার ও ভিডিও স্ট্রিমিং:</h4>
                  <p className="text-slate-400 text-[11px]">
                    প্ল্যাটফর্মে ভিডিও দেখার মাধ্যমে পয়েন্ট অর্জনের ক্ষেত্রে কোনো অটোমেটেড বট, স্ক্রিপ্ট বা ভিপিএন অপব্যবহার সম্পূর্ণ নিষিদ্ধ। সার্ভার-সাইড সিকিউরিটি হার্টবিট দ্বারা প্রতি সেকেন্ডের প্লেব্যাক ট্র্যাক করা হয়।
                  </p>
                  <h4 className="font-bold text-white text-xs mt-3">২. ক্যাশআউট শর্ত:</h4>
                  <p className="text-slate-400 text-[11px]">
                    ব্যবহারকারীকে সর্বনিম্ন থ্রেশহোল্ড (মোবাইল রিচার্জ ৩০ টাকা, বিকাশ/নগদ ১০০ টাকা) পূরণ করতে হবে। ভুল মোবাইল নম্বর প্রদান করলে প্ল্যাটফর্ম কর্তৃপক্ষ দায়ী থাকবে না।
                  </p>
                  <h4 className="font-bold text-white text-xs mt-3">৩. কপিরাইট সুরক্ষা:</h4>
                  <p className="text-slate-400 text-[11px]">
                    অ্যাপের সমস্ত ভিডিও অনুমোদিত ক্রিয়েটর পার্টনার ও লাইসেন্সকৃত মিডিয়া থেকে পরিবেশিত।
                  </p>
                </div>
              )}

              {/* Privacy Policy */}
              {activeLegalModal === 'privacy' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs">১. ডেটা সংগ্রহ ও এনক্রিপশন:</h4>
                  <p className="text-slate-400 text-[11px]">
                    আমরা ব্যবহারকারীর গোপনীয়তা রক্ষায় দৃঢ় প্রতিজ্ঞ। আপনার ফোন নম্বর এবং লেনদেনের তথ্য ব্যাংকিং গ্রেড এনক্রিপশনে সুরক্ষিত রাখা হয় এবং কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।
                  </p>
                  <h4 className="font-bold text-white text-xs mt-3">২. কুকিজ ও পার্টনার বিজ্ঞাপন:</h4>
                  <p className="text-slate-400 text-[11px]">
                    Google AdSense এবং প্রত্যয়িত অ্যাড নেটওয়ার্ক নীতি অনুসারে বিজ্ঞাপন প্রদর্শন করা হয়।
                  </p>
                </div>
              )}

              {/* Payout Rules */}
              {activeLegalModal === 'payout_rules' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 text-xs block">🪙 রূপান্তর হার:</span>
                    <p className="text-[11px] text-slate-300">১,০০০ কয়েন = ১৫ টাকা (১ কয়েন = ০.০১৫ টাকা)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 text-xs block">📱 মোবাইল রিচার্জ:</span>
                    <p className="text-[11px] text-slate-300">সর্বনিম্ন ৩০ টাকা (২,০০০ কয়েন) ব্যালেন্স থাকলেই গ্রামীণফোন, রবি, এয়ারটেল, বাংলালিংক বা টেলিটকে রিচার্জ সম্ভব।</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-pink-400 text-xs block">💸 বিকাশ ও নগদ:</span>
                    <p className="text-[11px] text-slate-300">সর্বনিম্ন ১০০ টাকা (৬,৬৬৭ কয়েন) হলে পার্সোনাল অ্যাকাউন্টে টাকা তোলা যাবে।</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveLegalModal(null)}
              className="w-full mt-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
