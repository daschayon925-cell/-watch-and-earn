import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Video } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface ReportModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ video, isOpen, onClose }) => {
  const [reason, setReason] = useState('কপিরাইট লঙ্ঘন (Copyright Infringement)');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, showToast } = useApp();

  if (!isOpen) return null;

  const reasons = [
    'কপিরাইট লঙ্ঘন (Copyright Infringement)',
    'অনুপযুক্ত বা ক্ষতিকর কনটেন্ট (Inappropriate / Harmful Content)',
    'ভুল তথ্য বা বিভ্রান্তিকর থাম্বনেইল (Misleading Information)',
    'ভিডিও লোড বা প্লেব্যাক সমস্যা (Broken Video / Playback Error)',
    'অন্যান্য (Other)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const msg = await api.reportVideo(video.id, reason, details);
      showToast(language === 'bn' ? 'রিপোর্ট গ্রহণ করা হয়েছে' : 'Report submitted', msg, 'success');
      onClose();
    } catch {
      showToast(language === 'bn' ? 'রিপোর্ট পাঠানো যায়নি' : 'Failed to submit report', '', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-[#0E1522] border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? 'কনটেন্ট রিপোর্ট বা কপিরাইট দাবি' : 'Report / Copyright Notice'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* License Attribution Note */}
        <div className="my-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>লাইসেন্স স্ট্যাটাস: {video.contentLicense.toUpperCase()}</span>
          </div>
          <p className="text-[10px] text-slate-300 italic">{video.licenseAttribution}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'bn' ? 'রিপোর্টের কারণ নির্বাচন করুন:' : 'Select reason:'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {reasons.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'bn' ? 'বিস্তারিত লিখুন (ঐচ্ছিক):' : 'Additional details (optional):'}
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={language === 'bn' ? 'কপিরাইট সংক্রান্ত বিস্তারিত তথ্য বা কারণ...' : 'Specify details...'}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {loading ? '...' : (language === 'bn' ? 'রিপোর্ট পাঠান' : 'Submit Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
