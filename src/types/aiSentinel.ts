export type AiSecurityStatus = 'SECURE' | 'WARNING' | 'CRITICAL';
export type AiActionSeverity = 'info' | 'warning' | 'critical';

export interface AiAuditSummary {
  totalScannedUsers: number;
  flaggedFraudUsers: number;
  blockedBots: number;
  quarantinedWithdrawals: number;
  totalCoinsAudited: number;
  systemIntegrityScore: number; // 0 - 100
  securityStatus: AiSecurityStatus;
  lastAuditAt: string;
}

export interface AiFlaggedUser {
  uid: string;
  displayName: string;
  phone?: string;
  email?: string;
  riskScore: number; // 0 - 100
  coins: number;
  reasons: string[];
  actionTaken: 'FLAGGED' | 'QUARANTINED' | 'SUSPENDED' | 'RESOLVED';
  detectedAt: string;
}

export interface AiAutonomousLog {
  id: string;
  timestamp: string;
  type: 'BOT_DETECTED' | 'WITHDRAWAL_QUARANTINED' | 'TASK_AUDITED' | 'MATH_DISCREPANCY' | 'SECURITY_SHIELD' | 'DAILY_REPORT' | 'SELF_HEALING';
  messageBn: string;
  severity: AiActionSeverity;
  targetUid?: string;
  targetDetails?: string;
}

export interface AiDailyReport {
  id: string;
  date: string;
  title: string;
  executiveSummaryBn: string;
  securityStatus: AiSecurityStatus;
  metrics: {
    activeUsers: number;
    newUsersToday: number;
    totalCoinsMinted: number;
    totalBdtPayouts: number;
    estimatedRevenueUsd: number;
    estimatedRevenueBdt: number;
    profitMarginBdt: number;
    flaggedFraudCount: number;
    auditedTasksCount: number;
  };
  fraudAnalysisBn: string;
  taskAuditBn: string;
  financialAuditBn: string;
  actionsTakenBn: string;
  recommendationsBn: string;
  generatedBy: 'gemini-3.8-flash' | 'heuristic-sentinel';
  createdAt: string;
}

export interface AiAgentSettings {
  enabled: boolean;
  autoQuarantineFraud: boolean;
  autoDetectBots: boolean;
  antiScriptShield: boolean;
  dailyReportingEnabled: boolean;
  autoHealPostbackErrors: boolean;
  auditFrequencyMinutes: number;
}

export interface AiSentinelState {
  settings: AiAgentSettings;
  summary: AiAuditSummary;
  flaggedUsers: AiFlaggedUser[];
  dailyReports: AiDailyReport[];
  autonomousLogs: AiAutonomousLog[];
}
