import React from 'react';
import { Database, AlertOctagon, Trash2, Download, RefreshCw, Check } from 'lucide-react';

interface SettingsDatabaseSectionProps {
  lang: 'ar' | 'en';
  recordsLength: number;
  requestsLength: number;
  branchesLength: number;
  regionsLength: number;
  setWipeBranchesAlso: (v: boolean) => void;
  setShowWipeModal: (v: boolean) => void;
  handleExportBackup: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (v: boolean) => void;
  resetAllData: () => void;
  wipeBranchesAlso: boolean;
  showWipeModal: boolean;
  handleConfirmWipe: () => void;
}

export const SettingsDatabaseSection: React.FC<SettingsDatabaseSectionProps> = ({
  lang,
  recordsLength,
  requestsLength,
  branchesLength,
  regionsLength,
  setWipeBranchesAlso,
  setShowWipeModal,
  handleExportBackup,
  showResetConfirm,
  setShowResetConfirm,
  resetAllData,
  wipeBranchesAlso,
  showWipeModal,
  handleConfirmWipe,
}) => {
  return (
    <>
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'سجلات العملاء' : 'Customer Records'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{recordsLength}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'طلبات الجمع' : 'Collection Requests'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{requestsLength}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'الفروع المسجلة' : 'Registered Branches'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{branchesLength}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">{lang === 'ar' ? 'المناطق والمناديب' : 'Regions & Reps'}</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{regionsLength}</div>
          </div>
        </div>

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

      {import.meta.env.DEV && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>{lang === 'ar' ? 'استعادة البيانات النموذجية للتجربة (QA Demo Seed Data)' : 'Restore Default Seed Data'}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'ar'
              ? 'أداة تطوير محلية: في حال رغبت في إعادة السجلات والطلبات النموذجية لاختبار دورة العمل والتجربة من جديد.'
              : 'Development Tool: Restore mock records, requests, and sample branch data for demo testing.'}
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
      )}

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
    </>
  );
};
