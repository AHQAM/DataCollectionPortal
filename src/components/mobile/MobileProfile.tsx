import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User as UserIcon,
  Shield,
  Smartphone,
  Globe,
  KeyRound,
  PhoneCall,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Building,
  Layers,
  HelpCircle,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { MobileForcePasswordChange } from './MobileForcePasswordChange';

export const MobileProfile: React.FC = () => {
  const { lang, setLang, dir, t, currentUser, logout, simulatedDeviceId, appSettings } = useApp();

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (showPasswordChange) {
    return (
      <div className="h-full flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setShowPasswordChange(false)}
            className="text-xs font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1"
          >
            {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'الرجوع للملف الشخصي' : 'Back to Profile'}</span>
          </button>
        </div>
        <div className="flex-1">
          <MobileForcePasswordChange />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <h1 className="text-base font-extrabold text-slate-900">
          {lang === 'ar' ? 'الملف الشخصي والإعدادات' : 'Profile & Settings'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-900 text-white flex items-center justify-center text-xl font-bold shadow-md mb-2">
            {currentUser?.repNameAr ? currentUser.repNameAr.charAt(0) : 'م'}
          </div>
          <h2 className="font-extrabold text-sm text-slate-900">{currentUser?.repNameAr}</h2>
          <div className="text-xs text-purple-800 font-bold mt-0.5">
            {lang === 'ar' ? `مندوب المنطقة #${currentUser?.regionNo}` : `Region Rep #${currentUser?.regionNo}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {currentUser?.branchNameAr || 'فرع المنطقة الوسطى (الرياض)'}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-start text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'رقم المندوب' : 'Rep No'}</span>
              <span className="font-bold text-slate-800 font-mono">{currentUser?.repNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'المناطق المصرحة' : 'Authorized Regions'}</span>
              <span className="font-bold text-slate-800 font-mono">
                {currentUser?.allowedRegionNos.join(', ') || currentUser?.regionNo}
              </span>
            </div>
          </div>
        </div>

        {/* Bound Device Information (Section 6) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-900 mb-2.5 pb-2 border-b border-slate-100">
            <Smartphone className="w-4 h-4 text-purple-700" />
            <span>{lang === 'ar' ? 'بيانات الجهاز المعتمد' : 'Authorized Device Binding'}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{lang === 'ar' ? 'حالة الربط' : 'Binding Status'}</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                {lang === 'ar' ? 'جهاز معتمد ونشط' : 'Active & Bound'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{lang === 'ar' ? 'طراز الجهاز' : 'Device Label'}</span>
              <span className="font-bold text-slate-800">{currentUser?.boundDeviceLabel || 'Google Pixel 8'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{lang === 'ar' ? 'معرّف الجهاز (UUID)' : 'Installation UUID'}</span>
              <span className="font-mono text-[10px] text-slate-600 truncate max-w-[150px]">
                {simulatedDeviceId}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 leading-tight">
              {lang === 'ar'
                ? 'الحساب مرتبط بهذا الهاتف فقط ولا يمكن الدخول من هاتف آخر إلا بفك الارتباط من لوحة الإدارة.'
                : 'Account locked to this device only. Releasing requires Admin approval.'}
            </div>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 divide-y divide-slate-100 overflow-hidden text-xs">
          {/* Change Password */}
          <button
            onClick={() => setShowPasswordChange(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all text-start"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-purple-700" />
              <span className="font-bold text-slate-800">
                {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </span>
            </div>
            {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all text-start"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-700" />
              <span className="font-bold text-slate-800">
                {lang === 'ar' ? 'اللغة / Language' : 'Language / اللغة'}
              </span>
            </div>
            <span className="text-xs text-purple-700 font-bold">
              {lang === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>

          {/* Help & Support */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-all text-start"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-purple-700" />
              <span className="font-bold text-slate-800">
                {lang === 'ar' ? 'مساعدة / التواصل مع الإدارة' : 'Help / Contact Administration'}
              </span>
            </div>
            {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-rose-50 transition-all text-start text-rose-600"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              <span className="font-bold">{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
            </div>
            {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              {lang === 'ar' ? 'قنوات الدعم الفني والمبيعات' : 'Support & Admin Channels'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar'
                ? 'لأي استفسار بخصوص فك ارتباط الجهاز أو إعادة تعيين كلمة المرور:'
                : 'For device unbinding or password reset queries:'}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-purple-700" />
                <div>
                  <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'الهاتف الموحد' : 'Phone'}</div>
                  <div className="font-bold text-slate-800 font-mono">{appSettings.supportContact.phone}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-700" />
                <div>
                  <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                  <div className="font-bold text-slate-800 font-mono">{appSettings.supportContact.email}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-slate-400">{lang === 'ar' ? 'واتساب الإدارة' : 'WhatsApp'}</div>
                  <div className="font-bold text-slate-800 font-mono">{appSettings.supportContact.whatsapp}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-4 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 text-center">
            <LogOut className="w-8 h-8 mx-auto text-rose-600 mb-2" />
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              {lang === 'ar' ? 'تأكيد تسجيل الخروج' : 'Confirm Logout'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {lang === 'ar'
                ? 'سيتم إنهاء الجلسة ومسح البيانات المؤقتة. هل تريد المتابعة؟'
                : 'Session will end and temporary cache cleared. Continue?'}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {lang === 'ar' ? 'تأكيد الخروج' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
