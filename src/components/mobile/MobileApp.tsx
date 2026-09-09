import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Bell,
  RefreshCw,
  User as UserIcon,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Battery,
  Signal,
} from 'lucide-react';
import { MobileLogin } from './MobileLogin';
import { MobileForcePasswordChange } from './MobileForcePasswordChange';
import { MobileMyRequests } from './MobileMyRequests';
import { MobileNotifications } from './MobileNotifications';
import { MobileSyncStatus } from './MobileSyncStatus';
import { MobileProfile } from './MobileProfile';
import { PWAInstallBanner } from '../common/PWAInstallBanner';

export const MobileApp: React.FC = () => {
  const { lang, t, currentUser, isOnline, notifications, offlineQueue } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'notifications' | 'sync' | 'profile'>('requests');
  const [isFullWidth, setIsFullWidth] = useState(false);

  const unreadCount = notifications.filter(
    (n) => n.status !== 'READ' && (!currentUser || n.userId === currentUser.userId)
  ).length;

  // Decide screen content
  const renderContent = () => {
    if (!currentUser) {
      return <MobileLogin />;
    }

    if (currentUser.mustChangePassword) {
      return <MobileForcePasswordChange />;
    }

    switch (activeTab) {
      case 'requests':
        return <MobileMyRequests />;
      case 'notifications':
        return <MobileNotifications />;
      case 'sync':
        return <MobileSyncStatus />;
      case 'profile':
        return <MobileProfile />;
      default:
        return <MobileMyRequests />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-0 sm:p-6 min-h-[calc(100vh-4rem)]">
      {/* Frame Control Switcher (Only on desktop/tablet) */}
      <div className="w-full max-w-md hidden sm:flex justify-between items-center mb-3 px-2">
        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {lang === 'ar' ? 'محاكي تطبيق مندوب المبيعات (Flutter)' : 'Flutter Rep Mobile Simulator'}
          </span>
        </div>

        <button
          onClick={() => setIsFullWidth(!isFullWidth)}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
        >
          {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isFullWidth ? (lang === 'ar' ? 'تصغير الإطار' : 'Phone Frame') : (lang === 'ar' ? 'ملء الشاشة' : 'Full Screen')}</span>
        </button>
      </div>

      {/* Smartphone Device Frame - Expands to 100% on real phone, framed on desktop */}
      <div
        className={`w-full transition-all duration-300 ${
          isFullWidth
            ? 'max-w-xl sm:h-[840px] sm:rounded-2xl sm:shadow-xl h-[calc(100vh-4.5rem)]'
            : 'sm:max-w-[395px] sm:h-[780px] sm:rounded-[48px] sm:ring-12 sm:ring-slate-900/90 sm:shadow-2xl h-[calc(100vh-4.5rem)]'
        } bg-slate-900 flex flex-col overflow-hidden relative sm:border sm:border-slate-700`}
      >
        {/* Device Status Bar - only displayed in simulated desktop mode */}
        <div className="hidden sm:flex h-9 bg-white text-slate-900 px-6 items-center justify-between shrink-0 select-none z-30 text-[11px] font-bold border-b border-slate-100">
          <span>9:41</span>

          {/* Notch / Dynamic Island */}
          <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Signal className="w-3.5 h-3.5" />
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Main View Area */}
        <div className="flex-1 overflow-hidden bg-slate-100 flex flex-col">
          <PWAInstallBanner variant="banner" />
          {renderContent()}
        </div>

        {/* Bottom Navigation Bar (Shown when authenticated & password updated) */}
        {currentUser && !currentUser.mustChangePassword && (
          <nav className="h-16 bg-white border-t border-slate-200 px-3 flex items-center justify-around shrink-0 z-30 shadow-lg">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                activeTab === 'requests' ? 'text-purple-900 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px]">{lang === 'ar' ? 'طلباتي' : 'Requests'}</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 relative transition-all ${
                activeTab === 'notifications' ? 'text-purple-900 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 end-4 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span className="text-[10px]">{lang === 'ar' ? 'الإشعارات' : 'Alerts'}</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 relative transition-all ${
                activeTab === 'sync' ? 'text-purple-900 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              {offlineQueue.length > 0 && (
                <span className="absolute top-0 end-4 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {offlineQueue.length}
                </span>
              )}
              <span className="text-[10px]">{lang === 'ar' ? 'المزامنة' : 'Sync'}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                activeTab === 'profile' ? 'text-purple-900 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px]">{lang === 'ar' ? 'حسابي' : 'Profile'}</span>
            </button>
          </nav>
        )}

        {/* Home Indicator Bar */}
        <div className="h-3 bg-white flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
