import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  KeyRound,
  Lock,
  PhoneCall,
  Bell,
  Database,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  Trash2,
  Download,
  Upload,
  Check,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const {
    lang,
    t,
    appSettings,
    updateAppSettings,
    resetAllData,
    wipeDemoDataForProduction,
    records,
    requests,
    branches,
    regions,
    users,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Wipe Demo Data Modal State
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeBranchesAlso, setWipeBranchesAlso] = useState(false);
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState<string | null>(null);

  // JSON Backup export / import
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Local settings form state
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(
    appSettings.maxLoginAttempts || appSettings.securityPolicy?.maxFailedAttempts || 3
  );
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(
    appSettings.lockoutMinutes || appSettings.securityPolicy?.lockoutDurationMinutes || 15
  );
  const [phone, setPhone] = useState(appSettings.supportContact.phone);
  const [email, setEmail] = useState(appSettings.supportContact.email);
  const [whatsapp, setWhatsapp] = useState(appSettings.supportContact.whatsapp);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings({
      maxLoginAttempts: maxFailedAttempts,
      lockoutMinutes: lockoutDurationMinutes,
      securityPolicy: {
        maxFailedAttempts,
        lockoutDurationMinutes,
      },
      supportContact: {
        phone,
        email,
        whatsapp,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmWipe = () => {
    wipeDemoDataForProduction({ wipeBranchesAndRegions: wipeBranchesAlso });
    setShowWipeModal(false);
    setWipeSuccessMsg(
      lang === 'ar'
        ? 'تم تفريغ كافة البيانات التجريبية بنجاح! النظام الآن بصفحة بيضاء جاهز للتشغيل الفعلي بالشركة.'
        : 'All demo data wiped successfully! System is now a clean blank slate ready for production.'
    );
    setTimeout(() => setWipeSuccessMsg(null), 5000);
  };

  // Export full JSON database backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: '2.4.0',
      system: 'Field Sales Collection Hub',
      branches,
      regions,
      users,
      requests,
      records,
      settings: appSettings,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute(
      'download',
      `database_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    dlAnchor.click();

    setBackupSuccessMsg(lang === 'ar' ? 'تم تنزيل النسخة الاحتياطية بنجاح!' : 'Database backup downloaded successfully!');
    setTimeout(() => setBackupSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-700" />
            <span>{lang === 'ar' ? 'إعدادات النظام وسياسات الأمان' : 'System Settings & Security Policies'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'تخصيص سياسات كلمات المرور، قفل الحسابات التلقائي، وقنوات الدعم الفني'
              : 'Configure authentication rules, account lockouts, and administrative contact channels'}
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تم حفظ الإعدادات' : 'Settings Saved!'}</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Security & Lockout Policy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-purple-700" />
            <span>{lang === 'ar' ? 'سياسة كلمات المرور وقفل الحسابات (القسم 5)' : 'Password & Lockout Security Policy'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'الحد الأقصى لمحاولات الدخول الخاطئة قبل القفل' : 'Max Failed Attempts Before Lockout'}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxFailedAttempts}
                onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {lang === 'ar' ? 'القيمة المعتمدة: 3 محاولات' : 'Default: 3 attempts'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'مدة قفل الحساب التلقائي (بالدقائق)' : 'Automatic Lockout Duration (Minutes)'}
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={lockoutDurationMinutes}
                onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {lang === 'ar' ? 'القيمة المعتمدة: 15 دقيقة' : 'Default: 15 minutes'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl text-xs space-y-1 text-purple-950">
            <div className="font-bold">{lang === 'ar' ? 'القواعد الأمنية المطبقة إجبارياً:' : 'Enforced Security Rules:'}</div>
            <div className="text-[11px] text-slate-600">• الرمز الافتراضي للحسابات الجديدة هو 1234.</div>
            <div className="text-[11px] text-slate-600">• فرض تغيير كلمة المرور فور أول تسجيل دخول بنجاح.</div>
            <div className="text-[11px] text-slate-600">• منع إعادة استخدام الرمز الافتراضي 1234.</div>
            <div className="text-[11px] text-slate-600">• حصر الحساب على هاتف ذكي واحد معتمد (UUID).</div>
          </div>
        </div>

        {/* Support & Administration Contact Channels */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950 pb-2 border-b border-slate-100">
            <PhoneCall className="w-4 h-4 text-purple-700" />
            <span>{lang === 'ar' ? 'قنوات التواصل والدعم الفني للمناديب' : 'Support Channels for Representatives'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'الهاتف الموحد' : 'Phone'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'ar' ? 'رقم واتساب الإدارة' : 'WhatsApp'}
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'حفظ كافة التغييرات' : 'Save System Settings'}
          </button>
        </div>
      </form>

      {/* Success Notifications */}
      {wipeSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{wipeSuccessMsg}</span>
          </div>
          <button
            onClick={() => setWipeSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {backupSuccessMsg && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{backupSuccessMsg}</span>
          </div>
          <button
            onClick={() => setBackupSuccessMsg(null)}
            className="text-blue-700 hover:text-blue-900 text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DATABASE MANAGEMENT & LIVE PRODUCTION BLANK SLATE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
            <Database className="w-4 h-4 text-purple-700" />
            <span>{lang === 'ar' ? 'إدارة قاعدة البيانات والتشغيل الفعلي' : 'Database Management & Production Ops'}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {lang === 'ar' ? 'التحكم الإداري' : 'Admin Control'}
          </span>
        </div>

        {/* Live status stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'سجلات العملاء' : 'Customer Records'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{records.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'طلبات الجمع' : 'Collection Requests'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{requests.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'الفروع المسجلة' : 'Registered Branches'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{branches.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'المناطق والمناديب' : 'Regions & Reps'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{regions.length}</div>
          </div>
        </div>

        {/* Production Wipe Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 to-amber-50/60 border border-rose-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-950 font-black text-xs">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'تفريغ البيانات التجريبية والبدء بصفحة بيضاء للإنتاج الفعلي'
                  : 'Wipe Demo Data & Start Blank Slate for Live Production'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 max-w-xl leading-relaxed">
              {lang === 'ar'
                ? 'مسح كافة سجلات العملاء التجريبية (20 سجل)، والطلبات النموذجية، والردود والتكليفات، للبدء بصفحة بيضاء نظيفة تماماً جاهزة للتشغيل الفعلي بالشركة مع إبقاء حساب المدير فعالاً.'
                : 'Purge mock customer records, sample collection requests, and test assignments to start with a pristine blank slate for company operations while keeping Admin active.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setWipeBranchesAlso(false);
              setShowWipeModal(true);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تفريغ البيانات التجريبية' : 'Wipe Demo Data'}</span>
          </button>
        </div>

        {/* Database Export & Backup */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 text-[11px]">
            {lang === 'ar'
              ? 'تصدير نسخة احتياطية كاملة من قاعدة البيانات والإعدادات كملف JSON للأرشفة والأمان.'
              : 'Export full database backup & system settings as a JSON file for archiving.'}
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>{lang === 'ar' ? 'تصدير نسخة احتياطية (JSON)' : 'Export JSON Backup'}</span>
          </button>
        </div>
      </div>

      {/* Dangerous Zone / QA Reset */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
          <RefreshCw className="w-4 h-4 text-slate-600" />
          <span>{lang === 'ar' ? 'استعادة البيانات النموذجية للتجربة (QA Demo Seed Data)' : 'Restore Default Seed Data'}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === 'ar'
            ? 'في حال رغبت في إعادة السجلات والطلبات النموذجية لاختبار دورة العمل والتجربة من جديد.'
            : 'Restore mock records, requests, and sample branch data for demo testing.'}
        </p>

        {showResetConfirm ? (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                resetAllData();
                setShowResetConfirm(false);
              }}
              className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              {lang === 'ar' ? 'نعم، استعادة البيانات النموذجية' : 'Yes, Restore Seed Data'}
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'استعادة البيانات النموذجية الأولية' : 'Restore Initial Demo Data'}</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* WIPE DEMO DATA CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {lang === 'ar'
                  ? 'تفريغ البيانات التجريبية والبدء بصفحة بيضاء'
                  : 'Wipe Demo Data for Live Production'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                {lang === 'ar'
                  ? 'سيتم مسح كافة سجلات العملاء التجريبية (20 سجل)، والطلبات النموذجية، والردود والتكليفات، للبدء بصفحة بيضاء نظيفة تماماً جاهزة للتشغيل الفعلي بالشركة.'
                  : 'This will purge all mock customer records (20 records), sample collection requests, and test responses, giving you a completely clean blank slate for live company operations.'}
              </p>
            </div>

            {/* What will happen checklist */}
            <div className="my-4 p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2 text-xs">
              <div className="font-extrabold text-rose-950 flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'مسح سجلات العملاء والطلبات والتكليفات التجريبية (صفحة بيضاء)'
                    : 'Purge test records, requests & assignments (Blank Slate)'}
                </span>
              </div>
              <div className="font-extrabold text-rose-950 flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'إبقاء حساب مدير النظام (Admin) فعالاً لعدم إغلاق الجلسة'
                    : 'Preserve Admin user so login remains active'}
                </span>
              </div>

              {/* Optional wipe branches checkbox */}
              <div className="pt-2 border-t border-rose-200 mt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-800 font-bold select-none">
                  <input
                    type="checkbox"
                    checked={wipeBranchesAlso}
                    onChange={(e) => setWipeBranchesAlso(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    {lang === 'ar'
                      ? 'مسح الفروع والمناطق التجريبية أيضاً (لبدء استيراد ملف فروع شركتك من Excel)'
                      : 'Also wipe demo branches & regions (to import your company Excel file)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'تراجع وإلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmWipe}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'تأكيد التفريغ والبدء بصفحة بيضاء'
                    : 'Confirm Wipe & Start Clean'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
