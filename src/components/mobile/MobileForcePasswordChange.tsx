import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const MobileForcePasswordChange: React.FC = () => {
  const { lang, t, changePassword, currentUser } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(
        lang === 'ar'
          ? 'يجب ألا تقل كلمة المرور عن 6 خانات (أرقام أو حروف).'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword === '1234') {
      setError(
        lang === 'ar'
          ? 'لا يمكنك استخدام كلمة المرور الافتراضية 1234. يرجى اختيار كلمة مرور شخصية قوية.'
          : 'Cannot use default password 1234. Please choose a strong personal password.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        lang === 'ar'
          ? 'كلمتا المرور غير متطابقتين. يرجى إعادة التأكيد.'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    const res = changePassword(newPassword);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 p-6 justify-between">
      <div>
        {/* Security Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 mx-auto shadow-inner">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            {lang === 'ar' ? 'تغيير كلمة المرور إلزامي' : 'Mandatory Password Change'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {lang === 'ar'
              ? `مرحباً ${currentUser?.repNameAr || ''}، لأسباب أمنية ولحماية بيانات العملاء، يجب تغيير الرمز الافتراضي 1234 عند أول تسجيل دخول.`
              : `Hello ${currentUser?.repNameEn || currentUser?.repNameAr || ''}, for security compliance, you must replace default PIN 1234 upon first sign in.`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <div className="font-bold text-sm">
              {lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!'}
            </div>
            <div className="text-xs text-emerald-700 mt-1">
              {lang === 'ar' ? 'جاري تحويلك إلى طلبات جمع البيانات...' : 'Redirecting to your requests...'}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={lang === 'ar' ? '6 خانات على الأقل' : 'Min 6 characters'}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-700 mb-0.5">
                {lang === 'ar' ? 'شروط كلمة المرور:' : 'Password Requirements:'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={newPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  ✓ {lang === 'ar' ? '6 خانات أو أكثر' : '6 characters minimum'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={newPassword !== '1234' && newPassword.length > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  ✓ {lang === 'ar' ? 'تختلف عن الرمز الافتراضي 1234' : 'Different from default 1234'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-purple-900 hover:bg-purple-800 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ وتفعيل الحساب' : 'Save & Activate Account'}</span>
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-400 pt-6">
        {lang === 'ar'
          ? 'لا يمكن تخطي هذه الشاشة بدون تغيير الرمز لحماية الحساب'
          : 'This security screen cannot be bypassed until password is changed'}
      </div>
    </div>
  );
};
