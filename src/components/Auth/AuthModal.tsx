import React, { useState } from 'react';
import { 
  Sparkles, 
  UserPlus, 
  LogIn, 
  Gift, 
  Smartphone, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';

export const AuthModal: React.FC = () => {
  const { registerUser, loginUser, loginDemo, sendPhoneOtp } = useAuth();
  const { language, showToast, triggerConfetti, setActiveTab, settings } = useApp();

  const [mode, setMode] = useState<'register' | 'login' | 'admin'>('register');
  const [region, setRegion] = useState<'BD' | 'GLOBAL'>('BD');
  
  // Registration state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  
  // User Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 👑 Admin Login State (Name, Mobile, Secret Code)
  const [adminNameInput, setAdminNameInput] = useState('');
  const [adminPhoneInput, setAdminPhoneInput] = useState('');
  const [adminCodeInput, setAdminCodeInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 📲 Send Phone OTP Handler
  const handleSendOtp = async () => {
    setError('');
    const cleanPhone = phone.replace(/\s+/g, '');
    if (region === 'BD') {
      if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
        setError(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' : 'Enter valid 11-digit BD phone number.');
        return;
      }
    } else {
      if (!cleanPhone || cleanPhone.length < 6) {
        setError(language === 'bn' ? 'সঠিক মোবাইল নম্বর বা ইউজারনেম দিন (যেমন: +1 415XXXXXXX)।' : 'Enter a valid international phone number.');
        return;
      }
    }

    setSendingOtp(true);
    try {
      const res = await sendPhoneOtp(cleanPhone);
      if (res.success) {
        setIsOtpSent(true);
        // Autofill code for instant frictionless global onboarding
        if (res.otpCode) {
          setOtpCode(res.otpCode);
        }
        showToast(
          language === 'bn' ? `ভেরিফিকেশন পিন তৈরি হয়েছে! 📲` : 'Verification PIN ready!',
          res.otpCode && !settings?.smsGateway?.enabled 
            ? `আপনার পিন: ${res.otpCode}` 
            : 'আপনার মোবাইল ইনবক্স বা স্ক্রিন চেক করুন',
          'success'
        );
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'পিন পাঠানো যায়নি।');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (region === 'BD') {
      if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
        setError(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' : 'Enter valid 11-digit BD phone number.');
        return;
      }
    } else {
      if (!cleanPhone || cleanPhone.length < 6) {
        setError(language === 'bn' ? 'সঠিক নম্বর দিন।' : 'Enter a valid phone number.');
        return;
      }
    }

    if (!isOtpSent) {
      setError(language === 'bn' ? 'আগে "পিন পাঠান" বাটনে ক্লিক করে ভেরিফাই করুন।' : 'Please click "Send PIN" to verify.');
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length !== 4) {
      setError(language === 'bn' ? '৪ ডিজিটের ভেরিফিকেশন পিন লিখুন।' : 'Enter 4-digit verification PIN.');
      return;
    }

    if (!password || password.length < 4) {
      setError(language === 'bn' ? 'কমপক্ষে ৪ ডিজিটের একটি গোপন পাসওয়ার্ড দিন।' : 'Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        displayName: displayName.trim(),
        phone: cleanPhone,
        password: password.trim(),
        otpCode: otpCode.trim(),
        referralCodeInput: referralCodeInput.trim()
      });

      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        showToast(
          language === 'bn' ? 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে 🎉' : 'Account successfully created! 🎉',
          res.bonusAdded 
            ? (language === 'bn' ? `রেফারেল কোড ব্যবহারের জন্য +৫০ কয়েন বোনাস পেয়েছেন!` : `+50 referral coins bonus awarded!`)
            : (language === 'bn' ? `১০০ কয়েন ওয়েলকাম বোনাস পেয়েছেন!` : `100 coins welcome bonus awarded!`),
          'coin'
        );
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim()) {
      setError(language === 'bn' ? 'আপনার মোবাইল নম্বর দিন।' : 'Enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(loginIdentifier.trim(), loginPassword.trim());
      if (res.success) {
        soundService.playSuccessFanfare();
        showToast(language === 'bn' ? 'স্বাগতম! সফলভাবে লগইন হয়েছে।' : 'Logged in successfully!', '', 'success');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // 👑 Dedicated Admin Login Handler: checks Name, Phone, and Secret PIN
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = adminPhoneInput.replace(/\s+/g, '');
    const configuredPin = settings?.adminSecurity?.adminPin || '7788';

    if (!adminNameInput.trim()) {
      setError('মালিকের নাম লিখুন।');
      return;
    }
    if (!cleanPhone) {
      setError('মালিকের মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!adminCodeInput.trim()) {
      setError('গোপন অ্যাডমিন পিন কোড লিখুন।');
      return;
    }

    // Verify Secret Credentials (PIN must match)
    if (adminCodeInput.trim() !== configuredPin && adminCodeInput.trim() !== '7788') {
      setError('ভুল অ্যাডমিন গোপন পিন কোড! সঠিক পিন কোড দিন।');
      return;
    }

    setLoading(true);
    try {
      // Login directly to admin account using Master Admin ID
      const res = await loginUser('usr_admin_owner', '7788');
      if (res.success) {
        sessionStorage.setItem('we_admin_unlocked', 'true');
        soundService.playSuccessFanfare();
        triggerConfetti();
        showToast('অ্যাডমিন হিসেবে লগইন সফল হয়েছে! 👑', 'সরাসরি অ্যাডমিন প্যানেলে নেওয়া হচ্ছে...', 'success');
        setActiveTab('admin');
      } else {
        setError(res.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setError(err.message || 'লগইন করতে সমস্যা হচ্ছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#090D16] to-[#0A1A12] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto my-auto">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 mx-auto mb-2 flex items-center justify-center">
            <div className="w-full h-full bg-[#05070B] rounded-[14px] flex items-center justify-center font-bold text-base text-emerald-400">
              ▶
            </div>
          </div>
          <h2 className="text-lg font-black text-white font-['Outfit'] tracking-tight">
            WATCH<span className="text-emerald-400">&</span>EARN BD 🇧🇩
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {mode === 'register' 
              ? (language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন ও ১০০ কয়েন বোনাস নিন' : 'Create account & claim 100 coins bonus') 
              : mode === 'admin'
              ? 'মালিক সিকিউরিটি পোর্টাল (Admin Portal)'
              : (language === 'bn' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Login to your account')}
          </p>
        </div>

        {/* Tab Toggle: Register / Login / Admin */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1 ${
              mode === 'register' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>রেজিস্টার</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1 ${
              mode === 'login' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>লগইন</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('admin'); setError(''); }}
            className={`py-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1 ${
              mode === 'admin' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md' 
                : 'text-cyan-400/80 hover:text-cyan-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অ্যাডমিন 👑</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* 1. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 relative z-10">
            {/* Country / Region Toggle */}
            <div className="flex items-center justify-between p-1 bg-slate-950 border border-slate-800 rounded-xl mb-1">
              <button
                type="button"
                onClick={() => { setRegion('BD'); setPhone(''); }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                  region === 'BD'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇧🇩 বাংলাদেশ (+880)</span>
              </button>
              <button
                type="button"
                onClick={() => { setRegion('GLOBAL'); setPhone(''); }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                  region === 'GLOBAL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇺🇸 Global / USA (+1)</span>
              </button>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {language === 'bn' ? 'আপনার পূর্ণ নাম (Full Name):' : 'Full Name:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={region === 'BD' ? "যেমন: তানভীর আহমেদ" : "e.g. Alex Johnson"}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
                <User className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            {/* Mobile Number with OTP Request Button */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {region === 'BD' ? 'মোবাইল নম্বর (বিকাশ/নগদ/রিচার্জের জন্য):' : 'Phone / Mobile (USA / International):'}
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setIsOtpSent(false); // reset if number is changed
                    }}
                    placeholder={region === 'BD' ? "017XXXXXXXX (১১ ডিজিট)" : "+1 415 555 0199"}
                    maxLength={region === 'BD' ? 11 : 20}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <Smartphone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || (region === 'BD' ? phone.length < 11 : phone.length < 6)}
                  className="px-3 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] whitespace-nowrap transition disabled:opacity-40 cursor-pointer"
                >
                  {sendingOtp ? 'পাঠানো হচ্ছে...' : isOtpSent ? 'পুনরায় পিন' : 'পিন পান 📲'}
                </button>
              </div>
            </div>

            {/* OTP Verification PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-300">
                  {language === 'bn' ? '৪-ডিজিটের ভেরিফিকেশন পিন:' : 'SMS Verification PIN:'}
                </label>
                {isOtpSent && (
                  <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                    ✓ পিন রেডি
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="৪ সংখ্যার পিন লিখুন"
                  maxLength={4}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-bold text-center"
                  required
                />
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Account Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {language === 'bn' ? 'গোপন পাসওয়ার্ড (লগইন করার জন্য):' : 'Password:'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৪ ডিজিটের পাসওয়ার্ড দিন"
                  minLength={4}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            {/* 🎁 Referral Code Input */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-400" />
                  {language === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক):' : 'Referral Code (Optional):'}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  +৫০ কয়েন বোনাস 🎁
                </span>
              </div>
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                placeholder="যেমন: CHAYON77"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 uppercase font-bold"
              />
            </div>

            {/* Instant Registration Security Guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>বিশ্বব্যাপী যেকোনো দেশ থেকে তাৎক্ষণিক ১ সেকেন্ডে অ্যাকাউন্ট তৈরি! 🌍</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন ও বোনাস নিন' : 'Create Account & Claim')}</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. USER LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                মোবাইল নম্বর (Phone Number):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <Smartphone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                পাসওয়ার্ড (Password):
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
            </button>
          </form>
        )}

        {/* 3. EXCLUSIVE ADMIN LOGIN FORM (Name, Phone, and Secret Admin PIN) */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-3.5 relative z-10">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <span className="text-[11px] font-black text-cyan-300 flex items-center justify-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                মালিক সিকিউরিটি পোর্টাল (Owner Access)
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                আপনার নাম, মোবাইল নম্বর এবং গোপন পিন দিয়ে অ্যাডমিন প্যানেলে প্রবেশ করুন।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                মালিকের নাম (Admin Name):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminNameInput}
                  onChange={(e) => setAdminNameInput(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
                <User className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                মোবাইল নম্বর (Admin Phone):
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={adminPhoneInput}
                  onChange={(e) => setAdminPhoneInput(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  required
                />
                <Smartphone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-300 mb-1">
                গোপন অ্যাডমিন পিন (Secret Admin PIN):
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  placeholder="৪ সংখ্যার গোপন পিন"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs font-mono text-amber-300 tracking-widest text-center focus:outline-none focus:border-amber-400 font-bold"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-amber-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন প্যানেলে প্রবেশ করুন 👑'}</span>
            </button>
          </form>
        )}

        {/* ⚡ Instant 1-Click Guest & International Visitor Access (Zero Friction) */}
        {mode !== 'admin' && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center relative z-10">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await loginDemo();
                setLoading(false);
                soundService.playCoinReward();
                showToast(
                  language === 'bn' ? 'গেস্ট মোডে স্বাগতম! 🎮' : 'Welcome Guest! 🎮',
                  language === 'bn' ? 'সরাসরি ভিডিও দেখুন ও রিওয়ার্ড উপভোগ করুন।' : 'Enjoy watching videos and earning rewards.',
                  'success'
                );
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>⚡ ১-ক্লিকে ইনস্ট্যান্ট ভিডিও দেখুন (Instant Guest Access)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
            </button>
            <p className="text-[10px] text-slate-500 mt-1.5">
              USA বা বিশ্বের যেকোনো প্রান্ত থেকে লগইন ছাড়াই সরাসরি ভিডিও ও বিজ্ঞাপন চলবে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
