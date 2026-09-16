import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavbar } from './components/common/TopNavbar';
import { AuthPortal } from './components/common/AuthPortal';
import { AdminLayout } from './components/admin/AdminLayout';

const MainAppContent: React.FC = () => {
  const { lang, dir, currentUser } = useApp();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);
  if (!currentUser) {
    return <AuthPortal />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-purple-900 selection:text-white">
      {/* Navigation and authenticated user controls */}
      <TopNavbar />

      {/* Main View Mode Container */}
      <div className="flex-1">
        <AdminLayout />
      </div>

      {/* Global Brand & Security Compliance Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-2.5 px-4 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">
            {lang === 'ar' ? 'منصة جمع البيانات الميدانية والمبيعات' : 'Field Sales Collection Hub'}
          </span>
          <span className="text-slate-400 font-mono">v2.4.0 Enterprise</span>
        </div>

        <div className="text-[10px] text-slate-400">
          {lang === 'ar'
            ? 'متوافق مع حوكمة أمان الأجهزة وتغيير كلمات المرور الإلزامي ونظام الأوفلاين التلقائي'
            : 'Compliant with device binding security, mandatory PIN change, and auto offline sync'}
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
