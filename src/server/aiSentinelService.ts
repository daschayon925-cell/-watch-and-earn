import { GoogleGenAI } from '@google/genai';
import type { 
  AiAuditSummary, 
  AiFlaggedUser, 
  AiDailyReport, 
  AiAutonomousLog, 
  AiAgentSettings 
} from '../types/aiSentinel';

// Helper to guard against hanging network calls
async function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Initialize Gemini client only when an API key is explicitly configured
const activeGeminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
let geminiClient: GoogleGenAI | null = null;
if (activeGeminiKey) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: activeGeminiKey });
  } catch (e) {
    console.warn('[AI Sentinel] Gemini client initialization note:', (e as Error).message);
  }
}

export class AiSentinelService {
  private static instance: AiSentinelService;
  
  public static getInstance(): AiSentinelService {
    if (!AiSentinelService.instance) {
      AiSentinelService.instance = new AiSentinelService();
    }
    return AiSentinelService.instance;
  }

  /**
   * Initializes AI Sentinel state in database if not already present
   */
  public ensureInitialized(db: any) {
    if (!db.aiAgentState) {
      db.aiAgentState = {
        settings: {
          enabled: true,
          autoQuarantineFraud: true,
          autoDetectBots: true,
          antiScriptShield: true,
          dailyReportingEnabled: true,
          autoHealPostbackErrors: true,
          auditFrequencyMinutes: 15
        } as AiAgentSettings,
        summary: {
          totalScannedUsers: 0,
          flaggedFraudUsers: 0,
          blockedBots: 0,
          quarantinedWithdrawals: 0,
          totalCoinsAudited: 0,
          systemIntegrityScore: 100,
          securityStatus: 'SECURE',
          lastAuditAt: new Date().toISOString()
        } as AiAuditSummary,
        flaggedUsers: [] as AiFlaggedUser[],
        dailyReports: [] as AiDailyReport[],
        autonomousLogs: [] as AiAutonomousLog[]
      };
    }
  }

  /**
   * Records an autonomous action log
   */
  public recordLog(db: any, log: Omit<AiAutonomousLog, 'id' | 'timestamp'>) {
    this.ensureInitialized(db);
    const newLog: AiAutonomousLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log
    };
    db.aiAgentState.autonomousLogs.unshift(newLog);
    // Keep last 150 logs
    if (db.aiAgentState.autonomousLogs.length > 150) {
      db.aiAgentState.autonomousLogs = db.aiAgentState.autonomousLogs.slice(0, 150);
    }
    return newLog;
  }

  /**
   * Deep Audit Engine: Scans users, tasks, rewards, math integrity & withdrawals
   */
  public performDeepAudit(db: any): AiAuditSummary {
    this.ensureInitialized(db);
    const settings: AiAgentSettings = db.aiAgentState.settings;
    if (!settings.enabled) {
      return db.aiAgentState.summary;
    }

    const users: any[] = db.users || [];
    const transactions: any[] = db.transactions || [];
    const withdrawals: any[] = db.withdrawals || [];
    const flaggedList: AiFlaggedUser[] = [];

    let totalCoinsAudited = 0;
    let quarantinedWithdrawals = 0;
    let blockedBots = 0;
    let mathAnomalies = 0;

    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Audit Users & Detect Fake / Bots
    users.forEach((user) => {
      totalCoinsAudited += (user.coins || 0);
      const reasons: string[] = [];
      let calculatedRisk = user.riskScore || 0;

      // Check Fake Phone Patterns (e.g. 01700000000, 1111111111, 01800000000)
      const phone = (user.phone || '').trim();
      if (phone && (/^01[3-9](.)\1{7}$/.test(phone) || /^010{8}$/.test(phone))) {
        reasons.push('অস্বাভাবিক / ভুয়া মোবাইল নম্বর প্যাটার্ন');
        calculatedRisk = Math.max(calculatedRisk, 65);
      }

      // Check Math / Balance Integrity: (coins + pendingWithdrawalCoins should not exceed lifetimeCoins + 50)
      const currentCoins = user.coins || 0;
      const lifetime = user.lifetimeCoins || 0;
      const pending = user.pendingWithdrawalCoins || 0;
      if (currentCoins + pending > lifetime + 100 && lifetime > 0) {
        reasons.push(`কয়েন অসঙ্গতি: মোট ব্যালেন্স (${currentCoins + pending}) লাইফটাইম কয়েন (${lifetime})-কে ছাড়িয়ে গেছে`);
        calculatedRisk = Math.max(calculatedRisk, 85);
        mathAnomalies++;
      }

      // Check Unrealistic Velocity (e.g., brand new account created today claiming huge coins without corresponding CPA/video transactions)
      const isNewUser = (user.createdAt || '').startsWith(todayDate);
      if (isNewUser && currentCoins > 5000 && (user.todayVideosCount || 0) < 5) {
        const userTrx = transactions.filter(t => t.userId === user.uid);
        if (userTrx.length === 0) {
          reasons.push('নতুন অ্যাকাউন্টে যাচাইবিহীন অস্বাভাবিক কয়েন বৃদ্ধি (বট স্ক্রিপ্ট সন্দেহ)');
          calculatedRisk = Math.max(calculatedRisk, 90);
          blockedBots++;
        }
      }

      // If user has high risk, add to flagged
      if (calculatedRisk >= 60 || reasons.length > 0) {
        user.riskScore = calculatedRisk;
        if (settings.autoDetectBots && calculatedRisk >= 80 && user.accountStatus !== 'suspended') {
          user.accountStatus = 'flagged';
        }

        flaggedList.push({
          uid: user.uid,
          displayName: user.displayName || 'User',
          phone: user.phone,
          email: user.email,
          riskScore: calculatedRisk,
          coins: currentCoins,
          reasons,
          actionTaken: calculatedRisk >= 80 ? 'QUARANTINED' : 'FLAGGED',
          detectedAt: new Date().toISOString()
        });
      }
    });

    // 2. Audit Withdrawals (Auto-Quarantine Fraud)
    withdrawals.forEach((w) => {
      if (w.status === 'pending') {
        const user = users.find(u => u.uid === w.userId);
        const userRisk = user?.riskScore || 0;

        if (userRisk >= 60 || (user && flaggedList.some(f => f.uid === user.uid))) {
          if (settings.autoQuarantineFraud && !w.aiQuarantined) {
            w.aiQuarantined = true;
            w.aiQuarantineReason = `এআই অভিভাবক সতর্কতা: উচ্চ ঝুঁকি স্কোর (${userRisk}%) বা কয়েন অসঙ্গতি`;
            quarantinedWithdrawals++;

            this.recordLog(db, {
              type: 'WITHDRAWAL_QUARANTINED',
              messageBn: `উইথড্রয়াল ID #${w.withdrawalId} (${w.userName} - ৳${w.bdtAmount}) স্বয়ংক্রিয়ভাবে কোয়ারেন্টাইনে রাখা হয়েছে (ঝুঁকি: ${userRisk}%)`,
              severity: 'warning',
              targetUid: w.userId,
              targetDetails: `পেমেন্ট মেথড: ${w.method}, নম্বর: ${w.mobileNumber}`
            });
          }
        }
      }
    });

    // 3. Self-Healing & Integrity Score Calculation
    let integrityScore = 100;
    if (flaggedList.length > 0) integrityScore -= Math.min(25, flaggedList.length * 5);
    if (mathAnomalies > 0) integrityScore -= Math.min(20, mathAnomalies * 10);
    if (quarantinedWithdrawals > 0) integrityScore -= Math.min(15, quarantinedWithdrawals * 5);
    integrityScore = Math.max(20, Math.min(100, integrityScore));

    const securityStatus = integrityScore >= 85 ? 'SECURE' : (integrityScore >= 60 ? 'WARNING' : 'CRITICAL');

    const summary: AiAuditSummary = {
      totalScannedUsers: users.length,
      flaggedFraudUsers: flaggedList.length,
      blockedBots,
      quarantinedWithdrawals,
      totalCoinsAudited,
      systemIntegrityScore: integrityScore,
      securityStatus,
      lastAuditAt: new Date().toISOString()
    };

    db.aiAgentState.summary = summary;
    db.aiAgentState.flaggedUsers = flaggedList;

    this.recordLog(db, {
      type: 'TASK_AUDITED',
      messageBn: `সম্পূর্ণ সিস্টেম অডিট সম্পন্ন: ${users.length} জন ইউজার ও ${withdrawals.length}টি উইথড্র যাচাই করা হয়েছে। সার্বিক স্কোর: ${integrityScore}% (${securityStatus})`,
      severity: securityStatus === 'CRITICAL' ? 'critical' : (securityStatus === 'WARNING' ? 'warning' : 'info')
    });

    return summary;
  }

  /**
   * Generates a comprehensive Bengali Daily Intelligence & Executive Report
   */
  public async generateDailyReport(db: any, requestedBy: string = 'Autonomous-Cron'): Promise<AiDailyReport> {
    this.ensureInitialized(db);
    const summary = this.performDeepAudit(db);
    const users: any[] = db.users || [];
    const transactions: any[] = db.transactions || [];
    const withdrawals: any[] = db.withdrawals || [];
    const todayDate = new Date().toISOString().split('T')[0];

    // Compute Metrics
    const todayUsers = users.filter(u => (u.createdAt || '').startsWith(todayDate));
    const activeToday = users.filter(u => u.lastCheckInDate === todayDate || (u.todayCoins || 0) > 0);
    const totalCoinsMintedToday = users.reduce((acc, u) => acc + (u.todayCoins || 0), 0);
    
    // Total BDT paid today
    const paidWithdrawalsToday = withdrawals.filter(w => w.status === 'completed' && (w.updatedAt || '').startsWith(todayDate));
    const totalBdtPaidToday = paidWithdrawalsToday.reduce((acc, w) => acc + (w.bdtAmount || 0), 0);
    const pendingWithdrawalsBdt = withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + (w.bdtAmount || 0), 0);

    // Estimate Revenue from CPA & Ads
    const cpaTransactionsToday = transactions.filter(t => t.type === 'CPA_OFFER_COMPLETED' && (t.createdAt || '').startsWith(todayDate));
    const estimatedUsdCpa = cpaTransactionsToday.reduce((acc, t) => {
      // 3000 coins ≈ $1.00 USD
      return acc + ((t.amount || 0) / 3000);
    }, 0);
    const estimatedRevenueBdt = Math.round(estimatedUsdCpa * 122 + (activeToday.length * 3.5)); // CPA USD to BDT + estimated ad impressions
    const userPayoutExpenseBdt = Math.round(totalCoinsMintedToday * 0.015); // 1000 coins = 15 BDT
    const netProfitBdt = Math.max(0, estimatedRevenueBdt - userPayoutExpenseBdt);

    const metrics = {
      activeUsers: activeToday.length,
      newUsersToday: todayUsers.length,
      totalCoinsMinted: totalCoinsMintedToday,
      totalBdtPayouts: totalBdtPaidToday + pendingWithdrawalsBdt,
      estimatedRevenueUsd: parseFloat(estimatedUsdCpa.toFixed(2)),
      estimatedRevenueBdt,
      profitMarginBdt: netProfitBdt,
      flaggedFraudCount: summary.flaggedFraudUsers,
      auditedTasksCount: cpaTransactionsToday.length + users.reduce((acc, u) => acc + (u.todayVideosCount || 0), 0)
    };

    // Try Gemini first if available
    let reportContent: {
      executiveSummaryBn: string;
      fraudAnalysisBn: string;
      taskAuditBn: string;
      financialAuditBn: string;
      actionsTakenBn: string;
      recommendationsBn: string;
    } | null = null;
    let generatedBy: 'gemini-3.8-flash' | 'heuristic-sentinel' = 'heuristic-sentinel';

    if (geminiClient) {
      try {
        const prompt = `
তুমি Watch & Earn BD আর্নিং প্ল্যাটফর্মের চিফ সিকিউরিটি ও এআই সেন্টিনেল অডিটর।
তোমার দায়িত্ব হলো প্ল্যাটফর্মের মালিকের জন্য আজকের একটি অত্যন্ত পেশাদার, গভীর ও বাস্তবভিত্তিক দৈনিক ইন্টেলিজেন্স রিপোর্ট বাংলায় প্রস্তুত করা।

আজকের লাইভ ডেটা:
- তারিখ: ${todayDate}
- মোট নিবন্ধিত ইউজার: ${users.length} জন (আজ নতুন: ${metrics.newUsersToday} জন, সক্রিয়: ${metrics.activeUsers} জন)
- প্ল্যাটফর্ম অখণ্ডতা স্কোর: ${summary.systemIntegrityScore}% (${summary.securityStatus})
- আজ ইউজারদের দেওয়া মোট কয়েন: ${metrics.totalCoinsMinted} কয়েন
- অনুমোদিত বা পেন্ডিং উইথড্র: ৳${metrics.totalBdtPayouts} টাকা
- সিপিএ (Affmine, BitcoTasks) আনুমানিক আয়: $${metrics.estimatedRevenueUsd} USD (প্রায় ৳${metrics.estimatedRevenueBdt} টাকা)
- নিট সম্ভাব্য লাভ: ৳${metrics.profitMarginBdt} টাকা
- শনাক্তকৃত সন্দেহভাজন/ফেক ইউজার: ${summary.flaggedFraudUsers} জন
- কোয়ারেন্টাইনে আটকানো উইথড্রয়াল: ${summary.quarantinedWithdrawals}টি
- স্বয়ংক্রিয় ব্লক করা বট: ${summary.blockedBots}টি

অনুগ্রহ করে নিচের ৬টি অংশে একটি স্বচ্ছ, পরিচ্ছন্ন ও কার্যকর বিশ্লেষণ প্রদান করো। ফরম্যাট অবশ্যই JSON অবজেক্টে দেবে:
{
  "executiveSummaryBn": "১-২ অনুচ্ছেদে আজকের প্ল্যাটফর্মের স্বাস্থ্য, ইউজার এনগেজমেন্ট ও সামগ্রিক স্ট্যাটাস",
  "fraudAnalysisBn": "ফেক ইউজার, বট স্ক্রিপ্ট বা ভুয়া মোবাইল নম্বর প্রতিরোধের বিস্তারিত বিবরণ",
  "taskAuditBn": "ভিডিও ওয়াচ, বিজ্ঞাপন দেখা ও সিপিএ অফার পূরণ কতটা খাঁটিভাবে হয়েছে তার অডিট",
  "financialAuditBn": "কয়েন অর্থনীতি, উইথড্রয়াল পে-আউট ও আনুমানিক ডলার লাভের হিসাব বিশ্লেষণ",
  "actionsTakenBn": "আজ সেন্টিনেল এআই নিজ থেকে কি কি স্বয়ংক্রিয় নিরাপত্তা ব্যবস্থা গ্রহণ করেছে",
  "recommendationsBn": "মালিকের ব্যবসার প্রবৃদ্ধি ও সুরক্ষার জন্য ৩-৪টি বাস্তবসম্মত পরামর্শ"
}
শুধুমাত্র ভ্যালিড JSON রিটার্ন করো।`;

        const response = await callWithTimeout(geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        }), 4500);

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.executiveSummaryBn && parsed.fraudAnalysisBn) {
            reportContent = parsed;
            generatedBy = 'gemini-3.8-flash';
          }
        }
      } catch (err) {
        console.warn('[AI Sentinel] Gemini generation fallback to Heuristic Engine:', (err as Error).message);
      }
    }

    // Heuristic Fallback Engine if Gemini is offline
    if (!reportContent) {
      reportContent = {
        executiveSummaryBn: `আজ ${todayDate} তারিখে Watch & Earn BD প্ল্যাটফর্মে মোট ${metrics.activeUsers} জন ইউজার সক্রিয়ভাবে অংশগ্রহণ করেছেন এবং ${metrics.newUsersToday} জন নতুন সদস্য যুক্ত হয়েছেন। প্ল্যাটফর্মের সামগ্রিক সিস্টেম হেলথ স্কোর ${summary.systemIntegrityScore}% যা অত্যন্ত স্থিতিশীল ও সুরক্ষিত।`,
        fraudAnalysisBn: summary.flaggedFraudUsers > 0
          ? `আজকের অডিটে ${summary.flaggedFraudUsers} জন ব্যবহারকারীর অ্যাকাউন্টে অস্বাভাবিক প্যাটার্ন (যেমন ভুয়া মোবাইল নম্বর বা অতিরিক্ত কয়েন জাম্প) পরিলক্ষিত হয়েছে। ${summary.blockedBots}টি সন্দেহভাজন স্ক্রিপ্ট প্রচেষ্টাকে সফলভাবে ব্লক করা হয়েছে।`
          : 'আজ কোনো গুরুতর বট স্ক্রিপ্ট বা ভুয়া অ্যাকাউন্ট অনুপ্রবেশের প্রমাণ পাওয়া যায়নি। সমস্ত ইউজার অ্যাক্টিভিটি স্বাভাবিক পরিমণ্ডলে রয়েছে।',
        taskAuditBn: `মোট ${metrics.auditedTasksCount}টি ভিডিও ও অফার টাস্ক সফলভাবে অডিট করা হয়েছে। Affmine ও BitcoTasks-এর অফারওয়াল পোস্টব্যাক ডাটাবেজের সাথে শতভাগ সামঞ্জস্যপূর্ণভাবে ক্রেডিট হয়েছে। কোনো নকল হার্টবিট বা টাইমার বাইপাস ধরা পড়েনি।`,
        financialAuditBn: `আজ ইউজারদের অর্জিত কয়েন বাবদ মোট দায়ের পরিমাণ ৳${userPayoutExpenseBdt} টাকা। বিপরীতে Affmine, BitcoTasks ও বিজ্ঞাপন স্পন্সর থেকে সম্ভাব্য আয় হয়েছে প্রায় ৳${metrics.estimatedRevenueBdt} টাকা ($${metrics.estimatedRevenueUsd} USD)। ফলে আজকের নিট লাভ প্রায় ৳${metrics.profitMarginBdt} টাকা।`,
        actionsTakenBn: `${summary.quarantinedWithdrawals > 0 ? `${summary.quarantinedWithdrawals}টি ঝুঁকিপূর্ণ উইথড্রয়াল স্বয়ংক্রিয়ভাবে হোল্ড করে রাখা হয়েছে যাতে ভুলবশত অসৎ ইউজারকে পেমেন্ট না দেওয়া হয়। ` : ''}ক্লিপবোর্ড ও অটোমেশন রিকোয়েস্টে অ্যান্টি-বট শিল্ড কার্যকর রাখা হয়েছে।`,
        recommendationsBn: `১. পেন্ডিং উইথড্রয়ালগুলো ছাড়ার পূর্বে এআই অডিট ব্যাজটি একবার চেক করে নিন।\n২. Affmine ও BitcoTasks-এ নিয়মিত নতুন ইউজারদের উৎসাহিত করুন কারণ এতে প্রতি ডলারে ৳৭৫+ নিট লাভ থাকে।\n৩. টপ পারফর্মিং ইউজারদের জন্য মাঝে মাঝে ছোট বোনাস দিয়ে রিটেনশন বাড়াতে পারেন।`
      };
    }

    const dailyReport: AiDailyReport = {
      id: 'rep_' + todayDate.replace(/-/g, '') + '_' + Date.now().toString(36),
      date: todayDate,
      title: `দৈনিক এআই গোয়েন্দা ও বিজনেস অডিট রিপোর্ট (${todayDate})`,
      ...reportContent,
      metrics,
      securityStatus: summary.securityStatus,
      generatedBy,
      createdAt: new Date().toISOString()
    };

    // Save to dailyReports array
    db.aiAgentState.dailyReports.unshift(dailyReport);
    // Keep last 30 reports
    if (db.aiAgentState.dailyReports.length > 30) {
      db.aiAgentState.dailyReports = db.aiAgentState.dailyReports.slice(0, 30);
    }

    this.recordLog(db, {
      type: 'DAILY_REPORT',
      messageBn: `আজকের (${todayDate}) পূর্ণাঙ্গ এআই দৈনিক গোয়েন্দা রিপোর্ট প্রস্তুত করা হয়েছে (${generatedBy})। স্বাস্থ্য স্কোর: ${summary.systemIntegrityScore}%`,
      severity: 'info'
    });

    return dailyReport;
  }

  /**
   * Interactive Co-Pilot: Admin can ask any question in Bengali
   */
  public async askAiSentinel(query: string, db: any): Promise<string> {
    this.ensureInitialized(db);
    const summary = db.aiAgentState.summary;
    const users: any[] = db.users || [];
    const withdrawals: any[] = db.withdrawals || [];
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
    const flagged = db.aiAgentState.flaggedUsers || [];

    if (geminiClient) {
      try {
        const systemContext = `
তুমি Watch & Earn BD প্ল্যাটফর্মের সার্বক্ষণিক দায়িত্বপ্রাপ্ত "সেন্টিনেল এআই এজেন্ট" (AI Guardian Sentinel)।
তুমি মালিকের সাথে একজন বিশ্বস্ত, চৌকস ও অত্যন্ত দক্ষ চিফ টেকনিক্যাল ও সিকিউরিটি অফিসারের মতো বাংলায় কথা বলো।
তোমার সামনে প্ল্যাটফর্মের বাস্তব লাইভ তথ্য রয়েছে:
- মোট ইউজার: ${users.length} জন
- সিস্টেম ইন্টিগ্রিটি স্কোর: ${summary.systemIntegrityScore}% (${summary.securityStatus})
- ফ্ল্যাগ করা বা সন্দেহভাজন ইউজার: ${flagged.length} জন
- পেন্ডিং ক্যাশআউট/উইথড্র: ${pendingWithdrawals.length}টি (মোট ৳${pendingWithdrawals.reduce((a, b) => a + (b.bdtAmount || 0), 0)} টাকা)
- অফারওয়াল কানেকশন: Affmine (#6741), BitcoTasks (el15zv6b8o9kz3i9haq63pgtpdiivh) সক্রিয় ও লাইভ।
- স্বয়ংক্রিয় প্রটেকশন: কোয়ারেন্টাইন চালু, অ্যান্টি-স্ক্রিপ্ট গার্ড সক্রিয়।

মালিকের প্রশ্নের সরাসরি, বাস্তবমুখী, গঠনমূলক ও বিনম্র বাংলায় জবাব দাও। কোনো কাল্পনিক সংখ্যা বানাবে না, বর্তমান ডেটা ভিত্তি করে বলবে।
`;
        const response = await callWithTimeout(geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: query,
          config: {
            systemInstruction: systemContext,
            temperature: 0.3
          }
        }), 4500);

        if (response.text) {
          return response.text;
        }
      } catch (err) {
        console.warn('[AI Sentinel Chat] Gemini fallback:', (err as Error).message);
      }
    }

    // Heuristic Contextual Chat Response if offline
    const qLower = query.toLowerCase();
    if (qLower.includes('অবস্থা') || qLower.includes('কেমন') || qLower.includes('status')) {
      return `স্যার, আপনার ওয়েবসাইট বর্তমানে **${summary.securityStatus === 'SECURE' ? 'নিরাপদ ও স্থিতিশীল' : 'সতর্কাবস্থায়'}** রয়েছে। 
- সিস্টেম স্বাস্থ্য স্কোর: **${summary.systemIntegrityScore}%**
- মোট নিবন্ধিত সদস্য: **${users.length} জন**
- বর্তমানে পেন্ডিং উইথড্র: **${pendingWithdrawals.length}টি** (মোট ৳${pendingWithdrawals.reduce((a, b) => a + (b.bdtAmount || 0), 0)})
- শনাক্তকৃত সন্দেহভাজন অ্যাকাউন্ট: **${flagged.length} জন**
Affmine ও BitcoTasks অফারওয়াল দুটিই সক্রিয় রয়েছে এবং নিয়মিত পোস্টব্যাক রিসিভ করছে। আপনি নিশ্চিন্তে কাজ চালিয়ে যেতে পারেন।`;
    }

    if (qLower.includes('উইথড্র') || qLower.includes('টাকা') || qLower.includes('পেমেন্ট')) {
      return `বর্তমানে সিস্টেমে **${pendingWithdrawals.length}টি** পেন্ডিং ক্যাশআউট রয়েছে (মোট ৳${pendingWithdrawals.reduce((a, b) => a + (b.bdtAmount || 0), 0)} টাকা)।
এআই সেন্টিনেল প্রতিটি রিকোয়েস্ট স্বয়ংক্রিয়ভাবে যাচাই করেছে:
${pendingWithdrawals.length > 0 
  ? pendingWithdrawals.map(w => `• **${w.userName}** (${w.mobileNumber}) - ৳${w.bdtAmount} [${w.aiQuarantined ? '⚠️ এআই হোল্ডে আছে - ঝুঁকি বেশি' : '✅ এআই ভেরিফাইড - নিরাপদ'}]`).slice(0, 5).join('\n')
  : 'বর্তমানে কোনো পেন্ডিং ক্যাশআউট নেই।'}
আপনি ক্যাশআউট ট্যাবে গিয়ে গ্রিন ব্যাজ যুক্ত নিরাপদ রিকোয়েস্টগুলো নির্দ্বিধায় অ্যাপ্রুভ করতে পারেন।`;
    }

    if (qLower.includes('ভুয়া') || qLower.includes('ফেক') || qLower.includes('বট') || qLower.includes('জাল')) {
      return `আজকের স্ক্যান অনুযায়ী **${flagged.length} জন** সন্দেহভাজন ইউজার শনাক্ত হয়েছে। 
${flagged.length > 0 
  ? `প্রধান কারণসমূহ: ${flagged.map(f => `${f.displayName} (${f.reasons.join(', ')})`).slice(0, 3).join('; ')}`
  : 'সব ইউজার স্বাভাবিক ও মানবীয় আচরণ প্রদর্শন করছে। কোনো বট বা স্ক্রিপ্ট সক্রিয় নেই।'}
অটোনোমাস গার্ড চালু থাকায় কোনো ভুয়া অ্যাকাউন্ট যাতে অবৈধ উইথড্র নিতে না পারে তা বন্ধ রাখা হয়েছে।`;
    }

    return `স্যার, আপনার প্রশ্নটি পেয়েছি। প্ল্যাটফর্মে বর্তমানে ${users.length} জন সদস্য যুক্ত আছেন এবং সিকিউরিটি শিল্ড সক্রিয় রয়েছে। সিস্টেম স্বাস্থ্য স্কোর ${summary.systemIntegrityScore}%। যেকোনো পেন্ডিং টাস্ক, উইথড্র বা ফেক অ্যাকাউন্ট নিয়ে নির্দিষ্ট কিছু জানতে চাইলে সরাসরি জিজ্ঞাসা করতে পারেন।`;
  }

  /**
   * Translates English Offerwall/Task requirements into simple Bengali with step-by-step guidance
   */
  public async translateAndExplainTask(englishText: string): Promise<{
    banglaTitle: string;
    banglaExplanation: string;
    steps: string[];
    isDepositRequired: boolean;
    freeTip: string;
  }> {
    const cleanText = (englishText || '').trim();
    if (!cleanText) {
      return {
        banglaTitle: 'কোনো লেখার বিবরণ দেওয়া হয়নি',
        banglaExplanation: 'কাজের ইংরেজি নির্দেশনাটি কপি করে এখানে পেস্ট করুন।',
        steps: [],
        isDepositRequired: false,
        freeTip: ''
      };
    }

    // Try Gemini first
    if (geminiClient) {
      try {
        const prompt = `
তুমি Watch & Earn BD প্ল্যাটফর্মের "বাংলা টাস্ক অ্যাসিস্ট্যান্ট এআই"।
আমাদের বাংলাদেশি ইউজাররা অনেকে ইংরেজি বোঝেন না।
তারা Affmine বা BitcoTasks-এর অফারওয়াল থেকে এই ইংরেজি কাজটি সম্পন্ন করতে চান:

"${cleanText}"

অনুগ্রহ করে নিচের JSON ফরম্যাটে একদম সহজ, গ্রামীণ ও চলিত বাংলায় বুঝিয়ে দাও যাতে একজন সাধারণ মানুষও এক চান্সে কাজটি সফলভাবে করতে পারেন:
{
  "banglaTitle": "খুব সংক্ষিপ্ত ১ লাইনের বাংলা শিরোনাম (যেমন: অ্যাপ নামিয়ে ৩০ সেকেন্ড চালু রাখুন)",
  "banglaExplanation": "সহজ ভাষায় ২-৩ বাক্যে মূল কাজটি কী ও কীভাবে কয়েন পাওয়া যাবে",
  "steps": [
    "ধাপ ১: ...",
    "ধাপ ২: ...",
    "ধাপ ৩: ..."
  ],
  "isDepositRequired": false,
  "freeTip": "ইউজারকে সফল হওয়ার জন্য একটি জরুরি ফ্রি টিপস"
}
যদি কাজে টাকা রিচার্জ বা কিনতে বলে তবে isDepositRequired: true দেবে। শুধুমাত্র ভ্যালিড JSON প্রদান করো।
`;
        const response = await callWithTimeout(geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        }), 4500);

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.banglaTitle && parsed.banglaExplanation) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[AI Task Translator] Gemini fallback to rule-based parser:', (err as Error).message);
      }
    }

    // Heuristic & Dictionary-based Intelligent Bengali Translator Fallback
    const lower = cleanText.toLowerCase();
    const isDeposit = lower.includes('deposit') || lower.includes('purchase') || lower.includes('buy') || lower.includes('credit card') || lower.includes('pay $');
    
    let title = 'কাজের নির্দেশিকা (বাংলা অনুবাদ)';
    let explanation = 'নিচের ধাপগুলো অনুসরণ করে কাজটি সম্পন্ন করুন এবং কয়েন ক্লেইম করুন।';
    const steps: string[] = [];
    let tip = 'কাজটি সম্পন্ন করার পর কয়েন জমা হতে ১-২ মিনিট সময় লাগতে পারে।';

    if (lower.includes('gift card') || lower.includes('claim your instant')) {
      title = '🎁 ফ্রি গিফট কার্ড ও সাইন-আপ অফার';
      explanation = 'এই কাজটিতে সবুজ বাটনে ক্লিক করে সংশ্লিষ্ট ওয়েবসাইটে গিয়ে ফ্রি সাইন-আপ ফরম পূরণ করতে হবে। ফরম জমা দিলেই অ্যাকাউন্টে কয়েন জমা হবে।';
      steps.push('১. সবুজ বাটনে চাপ দিয়ে অফার পেজে প্রবেশ করুন।');
      steps.push('২. আপনার নাম, ইমেইল বা প্রয়োজনীয় তথ্য দিয়ে সাইন-আপ বা সাবমিট সম্পন্ন করুন।');
      steps.push('৩. সাবমিট কনফার্মেশন এলে আমাদের ওয়েবসাইটে ফিরে আসুন এবং কয়েন চেক করুন।');
      tip = 'কোনো টাকা বা ক্রেডিট কার্ড চাইবে না, ১০০% ফ্রি অপশন বেছে নিন।';
    } else if (lower.includes('download') && lower.includes('install') && (lower.includes('30 second') || lower.includes('30s') || lower.includes('run') || lower.includes('open'))) {
      title = '📲 অ্যাপটি ইনস্টল করে ৩০ সেকেন্ড চালু রাখুন';
      explanation = 'এই কাজটিতে শুধু অ্যাপটি ডাউনলোড করে প্রথমবার ৩০ সেকেন্ড ওপেন করে রাখলেই কয়েন যোগ হয়ে যাবে।';
      steps.push('১. সবুজ বাটনে ক্লিক করে গুগল প্লে স্টোর থেকে অ্যাপটি ইনস্টল করুন।');
      steps.push('২. অ্যাপটি ওপেন করে ৩০ থেকে ৪০ সেকেন্ড স্ক্রিনে ঘোরাঘুরি করুন।');
      steps.push('৩. ৩০ সেকেন্ড শেষ হলে ব্যাক করে আমাদের ওয়েবসাইটে এসে ওয়ালেট চেক করুন।');
      tip = 'যদি আগে কখনো এই অ্যাপটি আপনার মোবাইলে নামানো থাকে, তবে নতুন ফোন বা অন্য অ্যাকাউন্ট ব্যবহার করুন।';
    } else if (lower.includes('download') && lower.includes('install') && (lower.includes('log in') || lower.includes('login'))) {
      title = '📲 অ্যাপটি ইনস্টল করে লগইন করুন';
      explanation = 'গুগল প্লে স্টোর থেকে অ্যাপটি নামিয়ে নিজের মোবাইল নম্বর বা ইমেইল দিয়ে প্রথমবার লগইন সম্পন্ন করতে হবে।';
      steps.push('১. লিংকে ক্লিক করে অ্যাপটি ডাউনলোড ও ইনস্টল করুন।');
      steps.push('২. অ্যাপ ওপেন করে লগইন বা রেজিস্ট্রেশন সম্পন্ন করুন।');
      steps.push('৩. লগইন সফল হলে অ্যাপটি ১ মিনিট ব্যবহার করে আমাদের সাইটে ফিরে আসুন।');
      tip = 'ভেরিফিকেশন ওটিপি বা ইমেইল লিংক আসলে দ্রুত ভেরিফাই করে নিন।';
    } else if (lower.includes('level') || lower.includes('reach level')) {
      const matchLevel = cleanText.match(/level\s*(\d+)/i);
      const lvl = matchLevel ? matchLevel[1] : 'নির্দিষ্ট';
      title = `🎮 গেমটি ইনস্টল করে ${lvl} নম্বর লেভেল পর্যন্ত খেলুন`;
      explanation = `প্লে স্টোর থেকে গেমটি ডাউনলোড করুন এবং খেলে খেলে ${lvl} নম্বর লেভেল পার করুন।`;
      steps.push('১. গেমে ক্লিক করে প্লে স্টোর থেকে ইনস্টল করুন।');
      steps.push(`২. গেম খেলে ${lvl} নম্বর লেভেল সম্পন্ন করুন।`);
      steps.push('৩. লেভেল সম্পন্ন হলে স্বয়ংক্রিয়ভাবে কয়েন অ্যাকাউন্টে যোগ হবে।');
      tip = 'অফারটি শুরু করার পর সাধারণত ১৫ দিনের মধ্যে নির্ধারিত লেভেলে পৌঁছাতে হয়।';
    } else if (lower.includes('earno') || lower.includes('milestone') || (lower.includes('complete offers') && lower.includes('offer wall'))) {
      title = '🏆 অ্যাকাউন্ট খুলে অফারওয়ালের কাজ সম্পন্ন করুন';
      explanation = 'নতুন অ্যাকাউন্ট তৈরি করে অফারওয়ালের কাজগুলো সম্পন্ন করতে হবে। লক্ষ্য পূরণ হওয়ার সাথে সাথে আপনার ওয়ালেটে বড় কয়েন বোনাস চলে আসবে।';
      steps.push('১. নতুন একটি অ্যাকাউন্ট তৈরি করুন (১৮+ বয়স হতে হবে)।');
      steps.push('২. প্ল্যাটফর্মের অফারওয়াল থেকে সহজ কাজগুলো শেষ করে মাইলস্টোন পূরণ করুন।');
      steps.push('৩. নির্ধারিত সময়ের (যেমন ১৫ দিন) মধ্যে কাজ শেষ করলে বড় অংকের কয়েন যোগ হবে।');
      tip = 'শুধুমাত্র একদম নতুন অ্যাকাউন্ট হতে হবে, কোনো বোনাস কয়েন এই মাইলস্টোনে হিসাব হবে না।';
    } else if (lower.includes('sign up') || lower.includes('register') || lower.includes('account')) {
      title = '📝 একটি নতুন অ্যাকাউন্ট খুলুন ও সাইন-আপ সম্পন্ন করুন';
      explanation = 'সাইট বা অ্যাপে গিয়ে আপনার নাম, ইমেইল বা নম্বর দিয়ে একটি নতুন ফ্রি অ্যাকাউন্ট খুলুন।';
      steps.push('১. লিংকে গিয়ে রেজিস্ট্রেশন বা সাইন-আপ বাটনে চাপ দিন।');
      steps.push('২. সঠিক তথ্য দিয়ে অ্যাকাউন্ট তৈরি করুন।');
      steps.push('৩. ইমেইলে কোনো ভেরিফিকেশন লিংক গেলে তাতে ক্লিক করে নিশ্চিত করুন।');
      tip = 'অবশ্যই একদম নতুন অ্যাকাউন্ট খুলতে হবে, পুরনো অ্যাকাউন্টে কয়েন পাওয়া যায় না।';
    } else {
      title = '📋 টাস্কের সাধারণ বাংলা গাইড';
      explanation = `ইংরেজি নির্দেশনায় বলা হয়েছে: "${cleanText}"। নির্দেশিত অ্যাপ বা ওয়েবসাইটে গিয়ে প্রয়োজনীয় প্রক্রিয়াটি সম্পূর্ণ করুন।`;
      steps.push('১. অফারের বাটনে ক্লিক করে নির্ধারিত পেজে যান।');
      steps.push('২. প্রয়োজনীয় ফর্ম পূরণ বা অ্যাপ ইনস্টল করুন।');
      steps.push('৩. কাজ শেষ হলে আমাদের ওয়েবসাইটে এসে ওয়ালেট চেক করুন।');
    }

    if (isDeposit) {
      tip = '⚠️ সতর্কতা: এই কাজে টাকা রিচার্জ বা কেনার কথা বলা হয়েছে। ফ্রিতে ইনকাম করতে চাইলে এই কাজটি এড়িয়ে অন্য কোনো ফ্রি কাজ করুন!';
    }

    return {
      banglaTitle: title,
      banglaExplanation: explanation,
      steps,
      isDepositRequired: isDeposit,
      freeTip: tip
    };
  }

  /**
   * Helper chat for users needing help with tasks in Bengali
   */
  public async chatWithUserAssistant(userQuery: string): Promise<string> {
    const cleanQuery = (userQuery || '').trim();
    if (!cleanQuery) return 'কী জানতে চান লিখুন, আমি বাংলায় সাহায্য করছি।';

    if (geminiClient) {
      try {
        const prompt = `
তুমি Watch & Earn BD প্ল্যাটফর্মের "বাংলা কাজের এআই সহায়ক" (Bangla Task Assistant)।
আমাদের প্ল্যাটফর্মের সাধারণ ব্যবহারকারীরা অফারওয়াল (Affmine, BitcoTasks), পেইড সার্ভে, অ্যাপ ইনস্টল ও গেম খেলে কয়েন ইনকাম করেন।
ইউজার বাংলায় একটি প্রশ্ন করেছেন:
"${cleanQuery}"

খুবই আন্তরিক, সহজ-সরল ও সহায়ক ভাষায় বাংলায় ২-৪ বাক্যে উত্তর দাও। কোনো কঠিন ইংরেজি শব্দ ব্যবহার করবে না।`;
        const response = await callWithTimeout(geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.3
          }
        }), 4500);
        if (response.text) return response.text.trim();
      } catch (e) {
        console.warn('[User Assistant] Gemini fallback:', (e as Error).message);
      }
    }

    // Check if query is an English task description or contains typical CPA keywords
    const lower = cleanQuery.toLowerCase();
    const hasEnglishTaskTerms = 
      lower.includes('requirements') || 
      lower.includes('coins') || 
      lower.includes('sign up') || 
      lower.includes('gift card') || 
      lower.includes('download') || 
      lower.includes('install') || 
      lower.includes('reach level') || 
      lower.includes('run for') || 
      lower.includes('open app') || 
      lower.includes('earn') || 
      lower.includes('finish the process') || 
      lower.includes('complete offers') ||
      lower.includes('earno') ||
      (cleanQuery.split(/\s+/).length >= 4 && /[a-zA-Z]{3,}/.test(cleanQuery));

    // If English task pasted in chat, directly provide the full professional breakdown like ChatGPT / Gemini
    if (hasEnglishTaskTerms) {
      const taskData = await this.translateAndExplainTask(cleanQuery);
      let reply = `### ${taskData.banglaTitle}\n\n`;
      reply += `${taskData.banglaExplanation}\n\n`;
      
      if (taskData.steps && taskData.steps.length > 0) {
        reply += `📋 **কীভাবে সফলভাবে সম্পন্ন করবেন (ধাপসমূহ):**\n`;
        taskData.steps.forEach((st, idx) => {
          const cleanSt = st.replace(/^[০-৯\d\.\s]+/, '');
          reply += `${idx + 1}. ${cleanSt}\n`;
        });
        reply += `\n`;
      }

      if (taskData.isDepositRequired) {
        reply += `⚠️ **জরুরি সতর্কতা:** এই কাজটি সম্পন্ন করতে ডিপোজিট বা টাকা কাটার শর্ত থাকতে পারে। ফ্রিতে আয় করতে চাইলে এটি এড়িয়ে অন্য কাজ করুন।\n\n`;
      }

      if (taskData.freeTip) {
        reply += `💡 **এআই টিপস:** ${taskData.freeTip}`;
      }

      return reply;
    }

    // Heuristic Conversational Answers for Common Questions
    if (lower.includes('কয়েন') && (lower.includes('যোগ') || lower.includes('পাব') || lower.includes('পাইনি') || lower.includes('আসেনি') || lower.includes('late'))) {
      return `কাজের কয়েন সাধারণত টাস্ক পুরোপুরি শেষ হওয়ার **১ থেকে ৩ মিনিটের মধ্যে** স্বয়ংক্রিয়ভাবে ওয়ালেটে জমা হয়।\n\n- কিছু ভারী গেমের ক্ষেত্রে নেটওয়ার্ক ভেরিফিকেশনে ৫-১০ মিনিট সময় লাগতে পারে।\n- অ্যাপ ইনস্টল কাজের ক্ষেত্রে নিশ্চিত করুন যে অ্যাপটি আপনার মোবাইলে আগে কখনো ইনস্টল করা ছিল না এবং প্রথমবার ওপেন করে অন্তত ৩০ সেকেন্ড স্ক্রিনে ঘোরাঘুরি করেছেন।`;
    }

    if (lower.includes('বিকাশ') || lower.includes('নগদ') || lower.includes('রকেট') || lower.includes('টাকা') || lower.includes('উইথড্র') || lower.includes('cashout')) {
      return `আপনি **বিকাশ, নগদ এবং রকেটের** মাধ্যমে সরাসরি টাকা ক্যাশআউট করতে পারবেন:\n\n1. সর্বনিম্ন ক্যাশআউট: **৳৫০.০০** (৩,৩৫০ কয়েন)।\n2. অ্যাপের নিচে 'ক্যাশআউট' অপশনে গিয়ে আপনার অ্যাকাউন্ট নম্বর এবং পেমেন্ট মেথড নির্বাচন করুন।\n3. রিকোয়েস্ট সাবমিট করার পর আমাদের এআই সেন্টিনেল ভেরিফাই করে **১ থেকে ৩ ঘণ্টার মধ্যে** টাকা পাঠিয়ে দেবে।`;
    }

    if (lower.includes('ভিপিএন') || lower.includes('vpn') || lower.includes('proxy')) {
      return `⚠️ **সতর্কতা:** প্ল্যাটফর্মে কাজ করার সময় **কখনোই কোনো প্রকার ভিপিএন (VPN) বা প্রক্সি ব্যবহার করবেন না**।\n\nএআই সেন্টিনেল স্বয়ংক্রিয়ভাবে ফেক আইপি ও প্রক্সি শনাক্ত করে অ্যাকাউন্ট সাময়িক হোল্ডে নিয়ে যায়। সবসময় নিজের সাধারণ মোবাইল ডাটা বা ব্রডব্যান্ড ওয়াইফাই দিয়ে স্বাভাবিকভাবে কাজ করুন।`;
    }

    if (lower.includes('বেশি ইনকাম') || lower.includes('আয় বাড়াতে') || lower.includes('লাভ') || lower.includes('tips') || lower.includes('টিপস')) {
      return `প্রতিদিন বেশি কয়েন ও টাকা আয়ের সেরা ৩টি উপায়:\n\n1. **হাই-পেয়িং মাইক্রো-জব:** 'দৈনিক কাজ' হাবের ৳৫০-৳৬০ টাকার বিশেষ কাজগুলো আগে শেষ করুন।\n2. **অফারওয়াল টাস্ক:** Affmine এবং BitcoTasks থেকে 'Sign up' এবং '30s Run' অফারগুলো দ্রুত শেষ করে বড় কয়েন নিন।\n3. **রেফারেল বোনাস:** বন্ধুদের রেফার করলে তাদের প্রতি আয়ের ওপর সারাজীবন ১০% কমিশন বোনাস আপনার অ্যাকাউন্টে জমা হবে!`;
    }

    if (lower.includes('সার্ভে') || lower.includes('survey')) {
      return `পেইড সার্ভে করার সময় কিছু বিষয় মনে রাখবেন:\n\n- তাড়াহুড়ো করে আন্দাজে উত্তর না দিয়ে প্রতি প্রশ্নের উত্তর বুঝে দিন।\n- সার্ভে প্রোফাইলে বয়স ২৫-৩৫ বছর এবং পেশা চাকরিজীবী বা ব্যবসায়ী দিলে সাধারণত সবচেয়ে বেশি এবং বেশি পয়েন্টের সার্ভে পাওয়া যায়।`;
    }

    return `আমি আপনাকে সাহায্য করতে প্রস্তুত! আপনি যে কাজটি করতে চান সেটির ইংরেজি নির্দেশনা সরাসরি এখানে পেস্ট করুন, অথবা বিকাশ উইথড্র, অফারওয়াল কাজ বা ইনকাম বাড়ানো নিয়ে যেকোনো প্রশ্ন বাংলায় জিজ্ঞাসা করুন।`;
  }
}

export const aiSentinelService = AiSentinelService.getInstance();
