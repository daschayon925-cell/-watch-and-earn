import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Mail, 
  Globe, 
  Smartphone,
  ExternalLink
} from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'fraud' | 'support';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = React.useState<PolicyTab>(initialTab);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col font-['Hind_Siliguri','Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Legal & Quality Compliance Center
              </h3>
              <p className="text-[11px] text-slate-400">
                TimeWall, Google & Global Ad Network Standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('fraud')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'fraud'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Anti-Fraud & Quality</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact & Support</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-300 space-y-4 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300">
                <p className="font-semibold text-[11px] mb-1">Last Updated: October 2026</p>
                <p>
                  Watch & Earn BD is committed to safeguarding the privacy and personal information of all users, visitors, and advertisers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Information We Collect</h4>
                <p>
                  We collect account identifiers (phone number or guest ID), reward history, coin balances, and device telemetry necessary to ensure fraud protection, fair reward attribution, and offerwall transaction postbacks.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Third-Party Offerwall & Ad Partners</h4>
                <p>
                  We partner with compliant global offerwalls including <strong>TimeWall (timewall.io)</strong>, <strong>BitLabs</strong>, <strong>CPALead</strong>, and <strong>Monlix</strong>. When you interact with third-party offers or surveys, non-personally identifiable pseudonymous user identifiers (such as User SubID) are securely transmitted via server-side postbacks to ensure accurate reward crediting.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Cookies & Tracking</h4>
                <p>
                  Cookies and local web storage are used strictly to maintain session state, track daily watch streaks, and prevent repetitive advertising fraud. We do not sell user data to data brokers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Data Security & Retention</h4>
                <p>
                  All transactional communication is secured via SSL/TLS encryption. You may request account deletion or data erasure at any time through our support center.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl text-blue-300">
                <p className="font-semibold text-[11px] mb-1">Publisher & User Service Agreement</p>
                <p>
                  By accessing Watch & Earn BD, you acknowledge and agree to comply with these terms, our community guidelines, and partner terms.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">1. Eligibility & User Accounts</h4>
                <p>
                  Users must be at least 13 years of age. Each individual is strictly permitted to operate only <strong>one active account</strong>. Creating duplicate, bot-driven, or proxy-automated accounts is strictly prohibited.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">2. Reward System & Payouts</h4>
                <p>
                  Coins earned from completing licensed video streams, verified tasks, sponsor visits, and partner offerwalls have no speculative monetary value outside our platform. Coins can be redeemed for supported payout methods (bKash, Nagad, Mobile Top-Up) subject to minimum thresholds and manual anti-fraud review.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">3. Partner Offerwall Compliance</h4>
                <p>
                  Users agree to provide truthful and authentic responses when answering offerwall surveys (such as TimeWall or BitLabs). Chargebacks or offer cancellations by advertisers will result in deduction of credited coins.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">4. Termination of Service</h4>
                <p>
                  We reserve the right to suspend or terminate accounts that breach quality guidelines, utilize auto-clickers, or exploit system vulnerabilities.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'fraud' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-300">
                <p className="font-semibold text-[11px] mb-1">Strict Anti-Fraud & Traffic Quality Standards</p>
                <p>
                  We enforce zero tolerance for fraudulent traffic to ensure high publisher CPM and partner trust.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Strict VPN & Proxy Prohibition:</strong> Using VPNs, Tor, residential proxies, or data-center hosting IPs to spoof geographical location is strictly forbidden and auto-detected by our systems and TimeWall.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Human Interaction Verification:</strong> All video views and ad interactions require active browser focus, session heartbeats, and human verification timers.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">One Device, One Account:</strong> Multiple registrations under single devices or automated farm setups are permanently blacklisted.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Authentic Survey Responses:</strong> Speeding through surveys or inputting contradictory answers triggers instant rejection by advertiser networks.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-indigo-300">
                <p className="font-semibold text-[11px] mb-1">Publisher & User Support Contacts</p>
                <p>
                  Need assistance with withdrawals, offerwall crediting, or compliance audits? Reach out to our team.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Official Publisher Email:</span>
                  <a href="mailto:daschayon925@gmail.com" className="text-cyan-400 hover:underline font-mono">
                    daschayon925@gmail.com
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Platform Domain:</span>
                  <span className="text-emerald-400 font-mono">Watch & Earn BD</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Support Hours:</span>
                  <span className="text-white">24/7 Mon-Sun (BST/UTC)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Postback Webhook Status:</span>
                  <span className="text-emerald-400 font-bold">🟢 Active & Verifiable</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                For TimeWall publisher inquiries, our server accepts postbacks at <code className="text-cyan-300">/api/postback/timewall</code>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            © 2026 Watch & Earn BD • All Rights Reserved
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
