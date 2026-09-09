import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Smartphone,
  LayoutDashboard,
  Lock,
  User as UserIcon,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Globe,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { lang, setLang, dir, login, users } = useApp();

  // Check URL query parameters for default tab
  const [activeTab, setActiveTab] = useState<'rep' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'mobile' || params.get('role') === 'rep' || window.innerWidth < 768) {
        return 'rep';
      }
    }
    return 'admin';
  });

  // Rep form
  const [repRegion, setRepRegion] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [repError, setRepError] = useState<string | null>(null);

  // Admin form
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleRepLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repRegion.trim()) {
      setRepError(lang === 'ar' ? 'يرجى إدخال رقم المنطقة أو اسم المستخدم' : 'Please enter Region Number or username');
      return;
    }
    if (!repPassword.trim()) {
      setRepError(lang === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    setLoading(true);
    setRepError(null);

    const result = login(repRegion.trim(), repPassword);
    setLoading(false);

    if (!result.success) {
      setRepError(lang === 'ar' ? result.messageAr : result.messageEn);
    }
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminUsername.trim()) {
      setAdminError(lang === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter username');
      return;
    }
    if (!adminPassword.trim()) {
      setAdminError(lang === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    setLoading(true);
    setAdminError(null);

    const result = login(adminUsername.trim(), adminPassword);
    setLoading(false);

    if (!result.success) {
      setAdminError(lang === 'ar' ? result.messageAr : result.messageEn);
    }
  };

  // Quick Demo Fillers
  const fillRep = (regionNo: string, pwd = '1234') => {
    setRepRegion(regionNo);
    setRepPassword(pwd);
    setRepError(null);
  };

  const fillAdmin = (user = 'admin', pwd = '1234') => {
    setAdminUsername(user);
    setAdminPassword(pwd);
    setAdminError(null);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-100 via-purple-50/40 to-slate-200/80">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/60 border border-purple-400/40 flex items-center justify-center font-black text-lg shadow-md">
                ف
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white">
                  {lang === 'ar' ? 'منصة جمع البيانات الميدانية والمبيعات' : 'Field Sales Collection Hub'}
                </h1>
                <p className="text-[11px] text-purple-200 mt-0.5 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'بوابة تسجيل الدخول المعتمدة والمحمية' : 'Secure Enterprise Authentication Portal'}</span>
                </p>
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-purple-900/70 border border-purple-700/50 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('rep');
                setRepError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'rep'
                  ? 'bg-white text-purple-950 shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-purple-800/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'ar' ? 'بوابة المندوب الميداني' : 'Field Representative'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAdminError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-purple-950 shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-purple-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{lang === 'ar' ? 'لوحة الإدارة والمشرفين' : 'Admin & Supervisors'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'rep' ? (
            /* ========================================================================= */
            /* FIELD REPRESENTATIVE LOGIN FORM */
            /* ========================================================================= */
            <form onSubmit={handleRepLogin} className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === 'ar'
                    ? 'هذه البوابة مخصصة للمناديب الميدانيين. عند تسجيل الدخول، ستفتح لك مهام منطقتك حصرياً على تطبيق الجوال دون أي صلاحيات إدارية.'
                    : 'Dedicated portal for field representatives. Logging in directly opens your mobile region tasks without admin privileges.'}
                </p>
              </div>

              {repError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{repError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'رقم المنطقة المعتمد (اسم المستخدم)' : 'Assigned Region Number (Username)'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                  <input
                    type="text"
                    required
                    value={repRegion}
                    onChange={(e) => setRepRegion(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: 101 أو 102 أو 104' : 'e.g. 101, 102, 104'}
                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور / الرمز السري' : 'Password / PIN'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                  <input
                    type="password"
                    required
                    value={repPassword}
                    onChange={(e) => setRepPassword(e.target.value)}
                    placeholder={lang === 'ar' ? 'الرمز الافتراضي: 1234' : 'Default PIN: 1234'}
                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{lang === 'ar' ? 'دخول تطبيق الميدان' : 'Login to Field App'}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Quick Demo Rep Accounts Helper */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                  <span>{lang === 'ar' ? 'تجربة سريعة لحسابات المناديب:' : 'Quick Demo Rep Accounts:'}</span>
                  <span className="text-[10px] text-purple-700 font-bold">{lang === 'ar' ? 'الرمز: 1234' : 'PIN: 1234'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillRep('101', '1234')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-[11px] font-bold text-center transition-all cursor-pointer"
                  >
                    <div>101</div>
                    <div className="text-[9px] text-purple-700">{lang === 'ar' ? 'الرياض' : 'Riyadh'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillRep('102', '1234')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-[11px] font-bold text-center transition-all cursor-pointer"
                  >
                    <div>102</div>
                    <div className="text-[9px] text-purple-700">{lang === 'ar' ? 'جدة' : 'Jeddah'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillRep('104', '1234')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-[11px] font-bold text-center transition-all cursor-pointer"
                  >
                    <div>104</div>
                    <div className="text-[9px] text-purple-700">{lang === 'ar' ? 'القصيم' : 'Qassim'}</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* ADMIN & SUPERVISOR LOGIN FORM */
            /* ========================================================================= */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 text-xs text-purple-950 flex items-start gap-2">
                <LayoutDashboard className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {lang === 'ar'
                    ? 'بوابة الدخول الإدارية لمدير النظام والمشرفين لمتابعة العمليات الميدانية والتحكم بنماذج الفروع وإعدادات النظام.'
                    : 'Administrative portal for system admins and supervisors to manage operations, forms, and branches.'}
                </p>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'اسم المستخدم الإداري' : 'Admin / Supervisor Username'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder={lang === 'ar' ? 'admin أو sup_riyadh' : 'admin or sup_riyadh'}
                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{lang === 'ar' ? 'دخول لوحة تحكم الإدارة' : 'Login to Admin Dashboard'}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Quick Demo Admin Accounts Helper */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                  <span>{lang === 'ar' ? 'تجربة سريعة للحسابات الإدارية:' : 'Quick Demo Admin Accounts:'}</span>
                  <span className="text-[10px] text-purple-700 font-bold">{lang === 'ar' ? 'انقر للتعبئة' : 'Click to fill'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillAdmin('admin', 'admin123')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-[11px] font-bold text-center transition-all cursor-pointer"
                  >
                    <div>{lang === 'ar' ? 'مدير النظام (Admin)' : 'System Admin'}</div>
                    <div className="text-[9px] text-purple-700 font-mono">admin / admin123</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillAdmin('sup_riyadh', '1234')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-[11px] font-bold text-center transition-all cursor-pointer"
                  >
                    <div>{lang === 'ar' ? 'مشرف فرع الرياض' : 'Riyadh Supervisor'}</div>
                    <div className="text-[9px] text-purple-700 font-mono">sup_riyadh / 1234</div>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'ar' ? 'حوكمة الأجهزة وتغيير الرمز الإلزامي' : 'Device Governance & Mandatory Security'}</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
      </div>
    </div>
  );
};
