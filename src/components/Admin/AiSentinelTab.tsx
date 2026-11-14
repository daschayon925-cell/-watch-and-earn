import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Bot, 
  RefreshCw, 
  FileText, 
  Send, 
  UserX, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Lock, 
  Sliders, 
  TrendingUp, 
  BarChart2 
} from 'lucide-react';
import type { 
  AiAuditSummary, 
  AiFlaggedUser, 
  AiDailyReport, 
  AiAutonomousLog, 
  AiAgentSettings 
} from '../../types/aiSentinel';

interface AiSentinelTabProps {
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const AiSentinelTab: React.FC<AiSentinelTabProps> = ({ showToast }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [auditing, setAuditing] = useState<boolean>(false);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  
  // State
  const [summary, setSummary] = useState<AiAuditSummary | null>(null);
  const [settings, setSettings] = useState<AiAgentSettings | null>(null);
  const [flaggedUsers, setFlaggedUsers] = useState<AiFlaggedUser[]>([]);
  const [recentLogs, setRecentLogs] = useState<AiAutonomousLog[]>([]);
  const [dailyReports, setDailyReports] = useState<AiDailyReport[]>([]);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Chat Co-pilot
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'সালামু আলাইকুম স্যার! আমি আপনার প্ল্যাটফর্মের সার্বক্ষণিক "সেন্টিনেল এআই অভিভাবক"। আমি স্বয়ংক্রিয়ভাবে ওয়েবসাইট পর্যবেক্ষণ করছি, ভুয়া ইউজার ও বট স্ক্রিপ্ট প্রতিরোধ করছি এবং রিওয়ার্ড হিসাব অডিট করছি। আমাকে যেকোনো প্রশ্ন করতে পারেন বা নিচে কুইক বাটন চাপুন।',
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Load Initial Status & Reports
  const fetchSentinelStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-sentinel/status');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setSettings(data.settings);
        setFlaggedUsers(data.flaggedUsers || []);
        setRecentLogs(data.recentLogs || []);
      }

      // Also fetch reports
      const repRes = await fetch('/api/admin/ai-sentinel/daily-reports');
      const repData = await repRes.json();
      if (repData.success && repData.reports) {
        setDailyReports(repData.reports);
        if (repData.reports.length > 0 && !expandedReportId) {
          setExpandedReportId(repData.reports[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load AI sentinel status:', err);
      showToast('এআই স্ট্যাটাস লোড হতে সমস্যা হয়েছে', err.message, 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentinelStatus();
  }, []);

  // Run Immediate Full Audit
  const handleRunAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/admin/ai-sentinel/audit', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setFlaggedUsers(data.flaggedUsers || []);
        setRecentLogs(data.recentLogs || []);
        showToast('সম্পূর্ণ এআই অডিট সম্পন্ন হয়েছে 🔍', `স্কোর: ${data.summary.systemIntegrityScore}% (${data.summary.securityStatus})`, 'success');
      }
    } catch (err: any) {
      showToast('অডিট ব্যর্থ হয়েছে', err.message, 'error');
    } finally {
      setAuditing(false);
    }
  };

  // Generate Daily Report
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch('/api/admin/ai-sentinel/generate-daily-report', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.report) {
        setDailyReports([data.report, ...dailyReports]);
        setExpandedReportId(data.report.id);
        showToast('আজকের দৈনিক রিপোর্ট তৈরি হয়েছে 📊', 'রিপোর্টে সম্পূর্ণ বিশ্লেষণ অন্তর্ভুক্ত হয়েছে', 'success');
        fetchSentinelStatus(true);
      }
    } catch (err: any) {
      showToast('রিপোর্ট তৈরি ব্যর্থ হয়েছে', err.message, 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Toggle Autonomous Setting
  const handleToggleSetting = async (key: keyof AiAgentSettings, value: boolean) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      const res = await fetch('/api/admin/ai-sentinel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        showToast('সেটিংস সংরক্ষিত হয়েছে ⚡', 'এআই অভিভাবক নতুন নিয়ম অনুযায়ী কাজ করবে', 'info');
      }
    } catch (err: any) {
      showToast('সেটিংস পরিবর্তন ব্যর্থ', err.message, 'error');
    }
  };

  // Resolve or Ban Flagged User
  const handleResolveUser = async (uid: string, action: 'CLEAR' | 'BAN') => {
    try {
      const res = await fetch('/api/admin/ai-sentinel/resolve-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action })
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === 'BAN' ? 'ইউজার স্থায়ীভাবে ব্লক করা হয়েছে 🚫' : 'ইউজার সন্দেহমুক্ত করা হয়েছে ✅', '', 'success');
        fetchSentinelStatus(true);
      }
    } catch (err: any) {
      showToast('অ্যাকশন ব্যর্থ হয়েছে', err.message, 'error');
    }
  };

  // Send Chat to Co-Pilot
  const handleSendChat = async (messageText?: string) => {
    const textToSend = (messageText || chatInput).trim();
    if (!textToSend || chatLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/admin/ai-sentinel/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend })
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: data.answer,
            time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.message || 'কোনো উত্তর পাওয়া যায়নি');
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `⚠️ দুঃখিত স্যার, তথ্য যাচাইয়ে সামান্য ত্রুটি হয়েছে: ${err.message}`,
          time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
        <p className="text-xs font-bold">এআই সেন্টিনেল অটোনোমাস গার্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  const isSecure = summary?.securityStatus === 'SECURE';
  const isWarning = summary?.securityStatus === 'WARNING';

  return (
    <div className="space-y-4">
      {/* 🤖 1. HERO BANNER & LIVE SYSTEM PULSE */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-slate-950" />
                  অটোনোমাস এআই সেন্টিনেল
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  সার্বক্ষণিক সুরক্ষায় নিয়োজিত
                </span>
              </div>
              <h2 className="text-base font-black text-white mt-1">
                স্মার্ট অভিভাবক ও স্বয়ংক্রিয় অডিট এজেন্ট
              </h2>
              <p className="text-[11px] text-slate-300">
                আপনার অনুপস্থিতিতে নিজে নিজে প্ল্যাটফর্ম পর্যবেক্ষণ, বট শনাক্তকরণ ও হিসাব পরীক্ষা করছে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRunAudit}
              disabled={auditing}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditing ? 'animate-spin' : ''}`} />
              <span>{auditing ? 'অডিট চলছে...' : 'তাৎক্ষণিক অডিট'}</span>
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{generatingReport ? 'তৈরি হচ্ছে...' : 'দৈনিক রিপোর্ট'}</span>
            </button>
          </div>
        </div>

        {/* 4 Health KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">সিস্টেম ইন্টিগ্রিটি</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-black text-cyan-400 font-['Outfit']">
                {summary?.systemIntegrityScore || 100}%
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isSecure ? 'bg-emerald-500/20 text-emerald-300' : (isWarning ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300')
              }`}>
                {summary?.securityStatus}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">যাচাইকৃত ইউজার</span>
            <div className="text-xl font-black text-white font-['Outfit'] mt-0.5">
              {summary?.totalScannedUsers || 0}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">সন্দেহভাজন / বট</span>
            <div className="text-xl font-black text-amber-400 font-['Outfit'] mt-0.5">
              {summary?.flaggedFraudUsers || 0}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">কোয়ারেন্টাইন উইথড্র</span>
            <div className="text-xl font-black text-red-400 font-['Outfit'] mt-0.5">
              {summary?.quarantinedWithdrawals || 0}
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ 2. AUTONOMOUS PROTECTION TOGGLES */}
      {settings && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>স্বয়ংক্রিয় ডিফেন্স ও অটোনোমাস রুলস (আপনার অনুপস্থিতিতে কার্যকর)</span>
            </h3>
            <span className="text-[10px] text-cyan-300 font-bold">অটো-পাইলট মোড</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-bold text-white block">সন্দেহভাজন উইথড্রয়াল অটো-কোয়ারেন্টাইন</span>
                <span className="text-[10px] text-slate-400">উচ্চ ঝুঁকি বা ফেক কয়েন পেলে উইথড্র আটকে দেবে</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoQuarantineFraud}
                onChange={(e) => handleToggleSetting('autoQuarantineFraud', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-bold text-white block">স্বয়ংক্রিয় বট ও ফেক ইউজার শনাক্তকরণ</span>
                <span className="text-[10px] text-slate-400">ভুয়া মোবাইল নম্বর বা স্ক্রিপ্ট ইউজারকে ফ্ল্যাগ করবে</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoDetectBots}
                onChange={(e) => handleToggleSetting('autoDetectBots', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-bold text-white block">অ্যান্টি-স্ক্রিপ্ট ও রেট-লিমিট শিল্ড</span>
                <span className="text-[10px] text-slate-400">অস্বাভাবিক দ্রুত অটো-ক্লিক ও স্ক্রিপ্ট প্রতিরোধ করবে</span>
              </div>
              <input
                type="checkbox"
                checked={settings.antiScriptShield}
                onChange={(e) => handleToggleSetting('antiScriptShield', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
              <div>
                <span className="text-xs font-bold text-white block">দৈনিক স্বয়ংক্রিয় গোয়েন্দা রিপোর্ট</span>
                <span className="text-[10px] text-slate-400">প্রতিদিন স্বয়ংক্রিয়ভাবে বিজনেস ও সিকিউরিটি রিপোর্ট লিখবে</span>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyReportingEnabled}
                onChange={(e) => handleToggleSetting('dailyReportingEnabled', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* 💬 3. INTERACTIVE AI CO-PILOT (মালিকের সাথে বাংলায় কথা বলুন) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>মালিকের এআই অ্যাসিস্ট্যান্ট (যেকোনো বিষয় বাংলায় জিজ্ঞাসা করুন)</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Gemini 3.8 Flash প্রস্তুত
          </span>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            'আজকের সারসংক্ষেপ দাও',
            'কোনো ভুয়া ইউজার বা বট ধরা পড়েছে?',
            'পেন্ডিং উইথড্রগুলো পরীক্ষা করে দাও',
            'সিপিএ ও বিজ্ঞাপন থেকে আনুমানিক লাভ কত?'
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendChat(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold whitespace-nowrap cursor-pointer transition active:scale-95 flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="h-56 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-sans">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-2.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>এআই ডেটাবেজ বিশ্লেষণ করে উত্তর লিখছে...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="যেমন: কোনো উইথড্র কি সন্দেহজনক আছে? বা লাভ কত হলো?"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendChat()}
            disabled={chatLoading || !chatInput.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 active:scale-95 transition cursor-pointer disabled:opacity-40"
          >
            <span>পাঠান</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ⚠️ 4. FLAGGED SUSPICIOUS USERS & BOT DETECTIONS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <UserX className="w-4 h-4 text-amber-400" />
            <span>শনাক্তকৃত সন্দেহভাজন অ্যাকাউন্ট ও বট ({flaggedUsers.length})</span>
          </h3>
          <span className="text-[10px] text-slate-400">এআই সার্বক্ষণিক নজরদারি</span>
        </div>

        {flaggedUsers.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>কোনো ভুয়া ইউজার বা বট সক্রিয় নেই। সমস্ত অ্যাকাউন্ট নিরাপদ!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {flaggedUsers.map((fu) => (
              <div
                key={fu.uid}
                className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{fu.displayName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                      ঝুঁকি স্কোর: {fu.riskScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {fu.phone || fu.email || fu.uid}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300/90 flex flex-wrap gap-1">
                    {fu.reasons.map((r, i) => (
                      <span key={i} className="bg-amber-950/60 px-2 py-0.5 rounded text-[10px] border border-amber-500/20">
                        ⚠️ {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleResolveUser(fu.uid, 'CLEAR')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold cursor-pointer transition active:scale-95"
                  >
                    সন্দেহমুক্ত করুন
                  </button>
                  <button
                    onClick={() => handleResolveUser(fu.uid, 'BAN')}
                    className="px-2.5 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-bold cursor-pointer transition active:scale-95"
                  >
                    অ্যাকাউন্ট ব্লক করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📄 5. DAILY AI INTELLIGENCE REPORTS ARCHIVE */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>দৈনিক এআই গোয়েন্দা ও বিজনেস রিপোর্ট আর্কাইভ ({dailyReports.length})</span>
          </h3>
          <span className="text-[10px] text-slate-400">স্বয়ংক্রিয় প্রাত্যহিক ব্রিফিং</span>
        </div>

        {dailyReports.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
            এখনও কোনো দৈনিক রিপোর্ট সেভ করা নেই। ওপরের &quot;দৈনিক রিপোর্ট&quot; বাটনে চাপ দিয়ে আজকের রিপোর্ট তৈরি করুন।
          </div>
        ) : (
          <div className="space-y-3">
            {dailyReports.map((report) => {
              const isExpanded = expandedReportId === report.id;
              return (
                <div
                  key={report.id}
                  className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg transition"
                >
                  {/* Report Accordion Header */}
                  <div
                    onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm">
                        📊
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-2">
                          <span>{report.title}</span>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">
                            {report.generatedBy}
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          তারিখ: {report.date} • সক্রিয় ইউজার: {report.metrics.activeUsers} জন • আনুমানিক লাভ: ৳{report.metrics.profitMarginBdt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        report.securityStatus === 'SECURE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {report.securityStatus}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Report Body */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-4 text-xs leading-relaxed text-slate-200">
                      {/* Financial & Activity KPI Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block">মোট কয়েন বিতরণ</span>
                          <span className="text-sm font-black text-amber-300 font-mono">+{report.metrics.totalCoinsMinted} 🪙</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block">সিপিএ আয় (ডলার)</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">${report.metrics.estimatedRevenueUsd} USD</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block">সম্ভাব্য মোট আয়</span>
                          <span className="text-sm font-black text-cyan-400 font-mono">৳{report.metrics.estimatedRevenueBdt}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold block">নিট সম্ভাব্য লাভ</span>
                          <span className="text-sm font-black text-emerald-300 font-mono">৳{report.metrics.profitMarginBdt}</span>
                        </div>
                      </div>

                      {/* 1. Executive Summary */}
                      <div className="space-y-1">
                        <h5 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                          <span>১. সার্বিক স্বাস্থ্য ও নিরাপত্তা অবস্থা</span>
                        </h5>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                          {report.executiveSummaryBn}
                        </p>
                      </div>

                      {/* 2. Fraud & Bot Analysis */}
                      <div className="space-y-1">
                        <h5 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                          <span>২. ফেক ইউজার ও বট স্ক্রিপ্ট অডিট</span>
                        </h5>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                          {report.fraudAnalysisBn}
                        </p>
                      </div>

                      {/* 3. Task & Reward Math Audit */}
                      <div className="space-y-1">
                        <h5 className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                          <span>৩. টাস্ক ও রিওয়ার্ডের গাণিতিক অডিট</span>
                        </h5>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                          {report.taskAuditBn}
                        </p>
                      </div>

                      {/* 4. Financial Audit */}
                      <div className="space-y-1">
                        <h5 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                          <span>৪. সিপিএ ও বিজ্ঞাপন আয়ের আর্থিক হিসাব</span>
                        </h5>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                          {report.financialAuditBn}
                        </p>
                      </div>

                      {/* 5. Autonomous Actions Taken */}
                      <div className="space-y-1">
                        <h5 className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                          <span>৫. সেন্টিনেল এআই কর্তৃক গৃহীত পদক্ষেপ</span>
                        </h5>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                          {report.actionsTakenBn}
                        </p>
                      </div>

                      {/* 6. Recommendations for Owner */}
                      <div className="space-y-1">
                        <h5 className="font-bold text-teal-300 text-xs flex items-center gap-1.5">
                          <span>৬. প্ল্যাটফর্ম প্রবৃদ্ধি ও সুরক্ষায় করণীয় সুপারিশ</span>
                        </h5>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300 whitespace-pre-line">
                          {report.recommendationsBn}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🛡️ 6. LIVE AUTONOMOUS ACTION LOG TIMELINE */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>লাইভ অটোনোমাস অ্যাকশন ফিড (সেন্টিনেল টাইমলাইন)</span>
          </h3>
          <span className="text-[10px] text-slate-400">সর্বশেষ কর্মকাণ্ড</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
          {recentLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-2">কোনো লগ রেকর্ড নেই</div>
          ) : (
            recentLogs.map((log) => {
              const isCrit = log.severity === 'critical';
              const isWarn = log.severity === 'warning';
              return (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg border flex items-start justify-between gap-2 ${
                    isCrit 
                      ? 'bg-red-950/40 border-red-500/30 text-red-200' 
                      : (isWarn ? 'bg-amber-950/30 border-amber-500/20 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-300')
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-sans block text-xs">{log.messageBn}</span>
                    {log.targetDetails && (
                      <span className="text-[10px] text-slate-400 block">{log.targetDetails}</span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
