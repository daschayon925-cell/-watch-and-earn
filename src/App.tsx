import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/Home/HomeScreen';
import { WatchScreen } from './components/Watch/WatchScreen';
import { GamesScreen } from './components/Games/GamesScreen';
import { TasksScreen } from './components/Tasks/TasksScreen';
import { WalletScreen } from './components/Wallet/WalletScreen';
import { RewardsScreen } from './components/Rewards/RewardsScreen';
import { ProfileScreen } from './components/Profile/ProfileScreen';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { ToastContainer } from './components/UI/ToastContainer';
import { InstallPrompt } from './components/PWA/InstallPrompt';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './components/Home/LandingPage';
import { AdsterraScriptInjector } from './components/Common/AdsterraScriptInjector';
import { ContinuousSocialBar } from './components/Common/ContinuousSocialBar';
import { AdVisitTimerModal } from './components/Common/AdVisitTimerModal';
import { api } from './services/api';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (user?.uid) {
      api.sendUserHeartbeat(activeTab);
      const timer = setInterval(() => {
        api.sendUserHeartbeat(activeTab);
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [user?.uid, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070B] text-emerald-400">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl font-bold animate-pulse mb-3">
          ▶
        </div>
        <span className="text-xs font-bold font-mono tracking-widest text-slate-300">
          WATCH & EARN BD 🇧🇩
        </span>
      </div>
    );
  }

  // If user is not authenticated: Show professional, policy-compliant LandingPage with Auditor & Guest Access
  if (!user) {
    return (
      <>
        <LandingPage onOpenAuth={() => setShowAuthModal(true)} />
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070B] text-[#F8FAFC] flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-['Hind_Siliguri','Outfit',sans-serif]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Tab Content Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto relative overflow-x-hidden">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'watch' && <WatchScreen />}
        {activeTab === 'games' && <GamesScreen />}
        {activeTab === 'tasks' && <TasksScreen />}
        {activeTab === 'wallet' && <WalletScreen />}
        {activeTab === 'rewards' && <RewardsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav />

      {/* In-App Drawers & Modals */}
      <NotificationDrawer />
      <ToastContainer />
      <InstallPrompt />
      {(activeTab as string) !== 'admin' && <AdsterraScriptInjector />}
      {(activeTab as string) !== 'admin' && <ContinuousSocialBar />}
      {(activeTab as string) !== 'admin' && <AdVisitTimerModal />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
