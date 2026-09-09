import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Smartphone, AlertCircle, KeyRound, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';

export const MobileLogin: React.FC = () => {
  const { lang, setLang, t, login, requestPasswordReset, simulatedDeviceId, simulateNewDevice, users } = useApp();

  const [regionNo, setRegionNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetRegionNo, setResetRegionNo] = useState('');
  const [resetNotes, setResetNotes] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = login(regionNo, password);
    if (!res.success) {
      setErrorMessage(lang === 'ar' ? res.messageAr || 'حدث خطأ في الدخول' : res.messageEn || 'Login failed');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestPasswordReset(resetRegionNo, resetNotes);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowForgotModal(false);
      setResetNotes('');
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-900 justify-between p-6">
      {/* Top Brand & Language Bar */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-900 flex items-center justify-center text-white text-base">
              📊
            </div>
            <span className="font-bold text-sm text-purple-950">
              {lang === 'ar' ? 'منصة جمع البيانات' : 'Collection Hub'}
            </span>
          </div>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-all"
          >
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>

        {/* Hero Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-purple-950 tracking-tight">
            {lang === 'ar' ? 'تسجيل دخول المندوب' : 'Representative Sign In'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'أدخل رقم المنطقة وكلمة المرور المسندة لحسابك'
              : 'Enter assigned Region Number and password'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {lang === 'ar' ? 'رقم المنطقة (اسم المستخدم)' : 'Region Number (Username)'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={regionNo}
                onChange={(e) => setRegionNo(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: 101 أو 102' : 'e.g. 101 or 102'}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                required
              />
              <div className="absolute top-3 end-3 text-xs text-slate-400 font-mono"># REG</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>{lang === 'ar' ? 'الرمز الافتراضي للحسابات الجديدة: 1234' : 'Default initial PIN: 1234'}</span>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-purple-700 hover:text-purple-900 font-bold"
              >
                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 bg-purple-900 hover:bg-purple-800 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-purple-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
        </form>

        {/* Device Binding Trust Badge */}
        <div className="mt-6 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900/90 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
          <div className="leading-tight">
            <span className="font-bold">{lang === 'ar' ? 'حماية ربط الجهاز: ' : 'Device Binding Protection: '}</span>
            {lang === 'ar'
              ? 'يتم قفل الحساب على جهازك المعتمد فور تسجيل الدخول.'
              : 'Your account is bound to your authorized mobile device.'}
          </div>
        </div>
      </div>

      {/* Footer: Device Simulator Controls */}
      <div className="pt-6 border-t border-slate-200/80">
        <div className="text-[10px] text-slate-400 flex items-center justify-between">
          <span className="font-mono truncate max-w-[170px]">UUID: {simulatedDeviceId.substring(0, 16)}...</span>
          <button
            onClick={simulateNewDevice}
            className="text-purple-700 hover:text-purple-950 font-bold underline"
            title="Generates a new InstallationDeviceId to test device binding lockout"
          >
            {lang === 'ar' ? 'محاكاة هاتف جديد' : 'Simulate New Phone'}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              {lang === 'ar' ? 'طلب إعادة تعيين كلمة المرور' : 'Password Reset Request'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar'
                ? 'سيتم إرسال الطلب لمدير النظام لإعادة تعيين كلمة المرور إلى 1234'
                : 'Request will be sent to Admin to reset password to 1234'}
            </p>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold text-center">
                {lang === 'ar' ? 'تم إرسال الطلب للإدارة بنجاح!' : 'Request sent to administrator!'}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'رقم المنطقة' : 'Region Number'}
                  </label>
                  <input
                    type="text"
                    value={resetRegionNo}
                    onChange={(e) => setResetRegionNo(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'سبب الطلب أو ملاحظات' : 'Reason or Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={resetNotes}
                    onChange={(e) => setResetNotes(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: فقدت كلمة المرور الجديدة' : 'e.g. Forgot newly set password'}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-lg bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold"
                  >
                    {lang === 'ar' ? 'إرسال الطلب' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
