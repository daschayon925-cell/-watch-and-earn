import React from 'react';
import { X, CheckCheck, Coins, ArrowDownLeft, Sparkles, Bell, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markAllNotificationsRead,
    setActiveTab,
    language
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-full bg-[#090E17] border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notifications'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {language === 'bn' ? 'সব পঠিত' : 'Mark all read'}
            </button>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-xs">
                {language === 'bn' ? 'এখনো কোনো নোটিফিকেশন নেই' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isPriv = n.isPrivate || (n.userId !== 'all' && n.type === 'system');
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.linkTab) {
                      setActiveTab(n.linkTab as any);
                      setIsNotificationDrawerOpen(false);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    isPriv
                      ? (!n.read ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-950/40' : 'bg-slate-900/60 border-cyan-500/20 text-slate-300')
                      : (!n.read
                        ? 'bg-slate-800/80 border-emerald-500/30 hover:border-emerald-500/60'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-400')
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      isPriv 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                        : 'bg-slate-950 border-slate-800'
                    }`}>
                      {isPriv ? (
                        <Lock className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <>
                          {n.type === 'reward' && <Coins className="w-4 h-4 text-amber-400" />}
                          {n.type === 'withdrawal' && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                          {n.type === 'streak' && <Sparkles className="w-4 h-4 text-cyan-400" />}
                          {n.type === 'system' && <Bell className="w-4 h-4 text-slate-300" />}
                        </>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isPriv && (
                        <div className="mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/30">
                            🔒 ব্যক্তিগত নোটিশ (Private)
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold truncate ${isPriv ? 'text-cyan-100 font-black' : 'text-slate-100'}`}>{n.title}</h4>
                        {!n.read && (
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isPriv ? 'bg-cyan-400 ring-2 ring-cyan-400/40' : 'bg-emerald-400'}`} />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-slate-500 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
