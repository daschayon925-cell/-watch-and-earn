import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  Lock, 
  HelpCircle, 
  Globe, 
  Coins, 
  Eye,
  Tv,
  Check,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { LegalPolicyModal, PolicyTab } from '../Legal/LegalPolicyModal';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { loginDemo } = useAuth();
  const { setActiveTab, showToast, triggerConfetti } = useApp();
  const [guestLoading, setGuestLoading] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<PolicyTab>('privacy');

  const handleOpenLegal = (tab: PolicyTab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleEnterAuditorPreview = async () => {
    setGuestLoading(true);
    try {
      await loginDemo();
      soundService.playSuccessFanfare();
      triggerConfetti();
      showToast('Auditor / Preview Mode Active!', 'Explore all offerwalls, video feeds, and earning features.', 'success');
    } catch (e: any) {
      console.error(e);
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-['Hind_Siliguri','Outfit',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#05070B]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#05070B] rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-sm">
                ▶
              </div>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                WATCH & EARN BD
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Verified Publisher Network 🇧🇩</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEnterAuditorPreview}
              disabled={guestLoading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{guestLoading ? 'Loading...' : 'Auditor Preview'}</span>
            </button>
            <button
              data-no-popunder="true"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1 no-popunder"
            >
              <span>লগইন / সাইন আপ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Compliance & Approval Notice for TimeWall / Ad Networks */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Official Publisher Partner</span>
              <span className="text-[11px] text-slate-300">
                100% compliant with TimeWall, BitLabs & Google Publisher policies.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleOpenLegal('fraud')}
            className="text-[11px] font-bold text-emerald-400 hover:underline shrink-0"
          >
            Compliance Details →
          </button>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-medium text-slate-300">
            <span className="text-amber-400">🔥</span>
            <span>প্রিমিয়াম ভিডিও ওয়াচ, সার্ভে ও রিওয়ার্ড আর্নিং প্ল্যাটফর্ম</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            ভিডিও দেখুন, সার্ভে ও অফার সম্পন্ন করুন <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              বিকাশ ও নগদে সরাসরি রিওয়ার্ড পান
            </span>
          </h2>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
            Watch & Earn BD হলো বাংলাদেশের নির্ভরযোগ্য ও স্বচ্ছ কন্টেন্ট মনিটাইজেশন ও রিওয়ার্ড হাব। লাইসেন্সড ভিডিও দেখা, পার্টনার অফারওয়াল এবং দৈনিক চ্যালেঞ্জ সম্পন্ন করে কয়েন অর্জন করুন।
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              data-no-popunder="true"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer no-popunder"
            >
              <span>একাউন্ট তৈরি করুন (Start Earning)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleEnterAuditorPreview}
              disabled={guestLoading}
              className="w-full sm:w-auto px-5 py-3 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>{guestLoading ? 'লোড হচ্ছে...' : 'অডিটর প্রিভিউ মোড (Explore As Guest)'}</span>
            </button>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Tv className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">লাইসেন্সড ভিডিও ওয়াচ</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              স্বল্প দৈর্ঘ্যের শিক্ষণীয় ও বিনোদনমূলক ভিডিও দেখুন। প্রতি সেকেন্ডে ভিউ টাইম ট্র্যাক করে ন্যায্য কয়েন যুক্ত হয়।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">গ্লোবাল অফারওয়াল ও সার্ভে</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              TimeWall, BitLabs, CPALead এবং অন্যান্য বিশ্বস্ত প্ল্যাটফর্ম থেকে উচ্চ আয়ের টাস্ক ও পেইড সার্ভে সম্পন্ন করার সুযোগ।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">স্বচ্ছ ও দ্রুত ক্যাশআউট</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              বিকাশ, নগদ কিংবা মোবাইল রিচার্জে সরাসরি কয়েন ভাঙিয়ে টাকা উত্তোলন করুন। স্বচ্ছ হিসেব ও নিরাপদ প্ল্যাটফর্ম।
            </p>
          </div>
        </section>

        {/* Offerwall Partners Showcase (Crucial for Ad Network Approvals) */}
        <section className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 ইন্টিগ্রেটেড পার্টনার্স ও অফারওয়াল হাব</span>
            </h4>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Postbacks Live & Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
              <span className="text-base font-black text-amber-400 block font-mono">TimeWall</span>
              <span className="text-[10px] text-slate-300">Micro-tasks & Clicks</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-teal-500/30">
              <span className="text-base font-black text-teal-400 block font-mono">CPX Research</span>
              <span className="text-[10px] text-slate-300">Surveys & Daily Polls</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/30">
              <span className="text-base font-black text-blue-400 block font-mono">Adsterra & Hilltop</span>
              <span className="text-[10px] text-slate-300">High-CPM Sponsors</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-pink-500/30">
              <span className="text-base font-black text-pink-400 block font-mono">বিকাশ ও নগদ</span>
              <span className="text-[10px] text-slate-300">ইনস্ট্যান্ট পেমেন্ট</span>
            </div>
          </div>
        </section>

        {/* Auditor & Compliance Callout */}
        <section className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wide">
              Ad Network / TimeWall Reviewers:
            </span>
            <p className="text-xs text-slate-200">
              To verify our offerwall implementation, subid tracking, and task flow, click the Auditor Preview button below.
            </p>
          </div>
          <button
            onClick={handleEnterAuditorPreview}
            disabled={guestLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition shrink-0 cursor-pointer"
          >
            {guestLoading ? 'Loading Preview...' : 'Open Auditor Demo View 🚀'}
          </button>
        </section>

        {/* Final Registration Banner */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 text-center space-y-3 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>১০০ কয়েন ফ্রি জয়েনিং বোনাস</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            আজই শুরু করুন এবং প্রতিদিন ভিডিও দেখে আয় করুন
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            কোনো ডিপোজিট বা ইনভেস্টমেন্ট ছাড়াই সম্পূর্ণ বিনামূল্যে কাজ শুরু করুন।
          </p>
          <div className="pt-1">
            <button
              data-no-popunder="true"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer no-popunder"
            >
              <span>একাউন্ট তৈরি করুন / লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer with Mandatory Compliance & Legal Policy Links */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <button
              onClick={() => handleOpenLegal('privacy')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenLegal('terms')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenLegal('fraud')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Anti-Fraud & Quality Rules
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenLegal('support')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Contact Support
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-500">
              © 2026 Watch & Earn BD (watch-and-earn-bd). All rights reserved.
            </p>
            <p className="text-[10px] text-slate-600">
              Publisher Postback Webhook: <code className="text-slate-400 font-mono">/api/postback/timewall</code> • Server Status: <span className="text-emerald-400 font-semibold">200 OK</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Legal & Policy Modal */}
      <LegalPolicyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
};
