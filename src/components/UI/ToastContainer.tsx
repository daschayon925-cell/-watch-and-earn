import React from 'react';
import { CheckCircle2, AlertCircle, Info, Coins, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, activeTab } = useApp();

  if (toasts.length === 0) return null;

  const isWatch = activeTab === 'watch';

  return (
    <div className={`fixed ${isWatch ? 'top-24' : 'top-16'} left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm flex flex-col gap-2 pointer-events-none transition-all duration-300`}>
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 ${
              isWatch 
                ? 'py-2 px-3.5 bg-black/85 backdrop-blur-md border border-white/20 rounded-full' 
                : 'p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80'
            } shadow-2xl animate-in slide-in-from-top duration-200`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {toast.type === 'coin' && <Coins className="w-4 h-4 text-amber-400 animate-bounce" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="min-w-0 truncate">
                <span className="text-xs font-bold text-white leading-tight">{toast.title}</span>
                {toast.message && !isWatch && (
                  <p className="text-[11px] text-slate-300 mt-0.5 truncate">{toast.message}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

