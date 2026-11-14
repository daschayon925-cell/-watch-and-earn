import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Flame, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AffiliateDeal } from '../../types';

export const AffiliateDealsHub: React.FC = () => {
  const { user, awardCoinsLocally } = useAuth();
  const { showToast, language } = useApp();
  const [deals, setDeals] = useState<AffiliateDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gadget' | 'app' | 'tech'>('all');

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const res = await api.getAffiliateDeals();
      if (res?.success && Array.isArray(res.deals)) {
        setDeals(res.deals);
      }
    } catch (err) {
      console.error('Failed to load affiliate deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeal = async (deal: AffiliateDeal) => {
    try {
      showToast(
        language === 'bn' ? `অফার পেজ খোলা হচ্ছে... 🛍️` : `Opening offer page...`,
        language === 'bn' ? `পণ্য কিনলে বা সাইন-আপ করলে +${deal.cashbackCoins} কয়েন ক্যাশব্যাক পাবেন!` : `Get +${deal.cashbackCoins} cashback coins!`,
        'coin'
      );
      
      // Track click in backend
      const res = await api.clickAffiliateDeal(deal.id);
      const urlToOpen = res?.trackingUrl || deal.affiliateUrl || 'https://s.daraz.com.bd/s.Y39Ff?cc';
      
      // Open offer in new tab
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.open(deal.affiliateUrl || 'https://s.daraz.com.bd/s.Y39Ff?cc', '_blank', 'noopener,noreferrer');
    }
  };

  const filteredDeals = selectedFilter === 'all' 
    ? deals 
    : deals.filter(d => d.category === selectedFilter);

  return (
    <div className="space-y-4">
      {/* 🌟 Top Hero Banner */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 border border-rose-500/40 shadow-2xl">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-black text-rose-300 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              দারাজ ও অফিশিয়াল হট ডিলস
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              দারাজ পার্টনার ভেরিফায়েড
            </div>
          </div>
          <h2 className="text-lg font-black text-white">
            হট ডিলস কিনুন ও নিশ্চিত ক্যাশব্যাক পান 🛍️
          </h2>
          <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
            দারাজ ও শীর্ষ পার্টনারদের আকর্ষণীয় গ্যাজেট ও অফারে কেনাকাটা করুন এবং আপনার ওয়ালেটে ফ্রি ক্যাশব্যাক কয়েন সংগ্রহ করুন। প্রতিটি কেনাকাটায় সরাসরি দারাজ থেকে কমিশন যুক্ত হয়।
          </p>
        </div>
      </div>

      {/* 🏷️ Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'সকল ডিলস' },
          { id: 'gadget', label: 'গ্যাজেট ও ঘড়ি ⌚' },
          { id: 'tech', label: 'মাইক্রোফোন ও টেক 🎙️' },
          { id: 'app', label: 'ফ্রি অ্যাপ সাইন-আপ 🎁' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedFilter === tab.id
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 📦 Deals List */}
      <div className="space-y-3">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-[#0c1420] border border-slate-800 hover:border-rose-500/50 transition shadow-lg flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                <img
                  src={deal.imageUrl}
                  alt={deal.titleBn}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-center text-[9px] font-black text-rose-400 py-0.5">
                  {deal.storeName}
                </span>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {deal.badgeBn}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    🔥 {deal.clicksCount || 10}+ জন আগ্রহ দেখিয়েছে
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {deal.titleBn}
                </h3>

                <div className="flex items-baseline gap-2 mt-1.5">
                  {deal.priceBDT !== undefined && deal.priceBDT > 0 ? (
                    <>
                      <span className="text-sm font-black text-rose-400">
                        ৳{deal.priceBDT}
                      </span>
                      {deal.originalPriceBDT && (
                        <span className="text-[11px] text-slate-500 line-through">
                          ৳{deal.originalPriceBDT}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-black text-emerald-400">
                      ১০০% ফ্রি সাইন-আপ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Reward Strip & Action Button */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-black">
                  +{deal.cashbackCoins} কয়েন ক্যাশব্যাক
                </span>
              </div>

              <button
                onClick={() => handleOpenDeal(deal)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition active:scale-95"
              >
                <span>অফারটি নিন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 💡 Info Notice */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>ক্যাশব্যাক পাওয়ার নিয়ম:</span>
        </div>
        <p>
          "অফারটি নিন" বাটনে ক্লিক করে সংশ্লিষ্ট ওয়েবসাইটে গিয়ে অর্ডার সম্পন্ন করুন অথবা ফ্রি অ্যাকাউন্ট খুলুন। সফলভাবে সম্পন্ন হলে স্বয়ংক্রিয়ভাবে ক্যাশব্যাক কয়েন আপনার অ্যাকাউন্টে জমা হবে।
        </p>
      </div>
    </div>
  );
};
