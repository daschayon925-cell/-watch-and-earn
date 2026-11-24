import React from 'react';
import { Home, PlaySquare, Wallet, User as UserIcon, ShieldAlert, CheckSquare } from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language } = useApp();
  const { user } = useAuth();

  const navItems: { id: TabType; labelBn: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'home',
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: <Home className="w-[18px] h-[18px]" />
    },
    {
      id: 'watch',
      labelBn: 'ভিডিও',
      labelEn: 'Watch',
      icon: <PlaySquare className="w-[18px] h-[18px] text-rose-400" />,
      badge: 'EARN'
    },
    {
      id: 'tasks',
      labelBn: 'টাস্ক',
      labelEn: 'Tasks',
      icon: <CheckSquare className="w-[18px] h-[18px] text-emerald-400" />
    },
    {
      id: 'wallet',
      labelBn: 'ওয়ালেট',
      labelEn: 'Wallet',
      icon: <Wallet className="w-[18px] h-[18px]" />
    },
    {
      id: 'profile',
      labelBn: 'প্রোফাইল',
      labelEn: 'Profile',
      icon: <UserIcon className="w-[18px] h-[18px]" />
    }
  ];

  return (
    <nav 
      id="bottom-nav-bar"
      data-bottom-nav="true"
      className="fixed bottom-0 left-0 right-0 z-[99999999] max-w-md mx-auto bg-[#070B11]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] px-2 pt-1.5 pb-[max(0.55rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'tasks' && activeTab === 'games');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all duration-200 group active:scale-95 ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-7 h-0.5 rounded-full bg-emerald-400" />
              )}

              <div className="relative">
                <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </div>

                {item.badge && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-[1px] text-[7px] font-black bg-rose-600 text-white rounded-full uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold text-emerald-400' : 'font-medium text-slate-400'
              }`}>
                {language === 'bn' ? item.labelBn : item.labelEn}
              </span>
            </button>
          );
        })}

        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all duration-200 ${
              activeTab === 'admin' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            {activeTab === 'admin' && (
              <span className="absolute -top-1.5 w-7 h-0.5 rounded-full bg-cyan-400" />
            )}
            <div className="p-1">
              <ShieldAlert className="w-[18px] h-[18px]" />
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap">অ্যাডমিন</span>
          </button>
        )}
      </div>
    </nav>
  );
};
