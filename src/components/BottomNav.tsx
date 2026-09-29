import React from 'react';
import { Home, PlaySquare, Wallet, Gift, User as UserIcon, ShieldAlert, Youtube, Gamepad2, CheckSquare } from 'lucide-react';
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
      icon: <Home className="w-4 h-4" />
    },
    {
      id: 'watch',
      labelBn: 'ভিডিও',
      labelEn: 'Watch',
      icon: <PlaySquare className="w-4 h-4 text-pink-500 fill-pink-500/20" />,
      badge: 'EARN'
    },
    {
      id: 'games',
      labelBn: 'গেম',
      labelEn: 'Games',
      icon: <Gamepad2 className="w-4 h-4 text-blue-400" />,
      badge: 'NEW'
    },
    {
      id: 'tasks',
      labelBn: 'টাস্ক/কুইজ',
      labelEn: 'Tasks',
      icon: <CheckSquare className="w-4 h-4 text-purple-400" />
    },
    {
      id: 'wallet',
      labelBn: 'ওয়ালেট',
      labelEn: 'Wallet',
      icon: <Wallet className="w-4 h-4" />
    },
    {
      id: 'profile',
      labelBn: 'প্রোফাইল',
      labelEn: 'Profile',
      icon: <UserIcon className="w-4 h-4" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#070B11]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 group ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active subtle pill background */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </div>

                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-black bg-rose-600 text-white rounded-full uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                isActive ? 'font-bold text-emerald-400' : 'text-slate-400'
              }`}>
                {language === 'bn' ? item.labelBn : item.labelEn}
              </span>
            </button>
          );
        })}

        {/* Admin Quick Switch (if role is admin) */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center px-2 py-1 transition-all duration-200 ${
              activeTab === 'admin' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-cyan-300'
            }`}
          >
            {activeTab === 'admin' && (
              <span className="absolute -top-1 w-6 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
            )}
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[9px] font-semibold">অ্যাডমিন</span>
          </button>
        )}
      </div>
    </nav>
  );
};
