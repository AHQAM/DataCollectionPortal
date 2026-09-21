import React from 'react';
import { ArrowLeft, ArrowRight, Save, Sliders, Sparkles, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { RequestItem } from '../../../types';

interface FormBuilderHeaderProps {
  lang: 'ar' | 'en';
  dir: 'rtl' | 'ltr';
  currentRequest?: RequestItem;
  requestId: string;
  onBack: () => void;
  onOpenImportWizard?: (requestId: string) => void;
  handleLoadInactiveCustomersPreset: () => void;
  handleSaveAll: () => void;
  saveSuccess: boolean;
}

export const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({
  lang,
  dir,
  currentRequest,
  requestId,
  onBack,
  onOpenImportWizard,
  handleLoadInactiveCustomersPreset,
  handleSaveAll,
  saveSuccess,
}) => {
  return (
    <>
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          >
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'الرجوع لقائمة الطلبات' : 'Back'}</span>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-700" />
              <span>{lang === 'ar' ? 'مصمم الحقول الديناميكية' : 'Dynamic Form Builder'}</span>
              <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {currentRequest?.requestCode}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 truncate">
                {lang === 'ar' ? currentRequest?.titleAr : currentRequest?.titleEn}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                <span>{lang === 'ar' ? `الإصدار v${currentRequest?.formSchemaVersion || 1}` : `v${currentRequest?.formSchemaVersion || 1}`}</span>
              </span>
              {currentRequest?.status === 'Published' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'منشور ومعتمد' : 'Published'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenImportWizard && (
            <button
              type="button"
              onClick={() => onOpenImportWizard(requestId)}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title={lang === 'ar' ? 'إدراج واستيراد بيانات إكسل لهذا النموذج مباشرة' : 'Import Excel Data'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'ar' ? 'إدراج بيانات من Excel' : 'Import Excel Data'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLoadInactiveCustomersPreset}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title={lang === 'ar' ? 'إدراج حقول متابعة المديونيات وانقطاع العملاء (مع حقول للعرض فقط)' : 'Insert Customer Inactivity & Debt Preset'}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'ar' ? 'إدراج حقول المديونيات وأسباب عدم الشراء' : 'Insert Debt & Inactivity Fields'}</span>
          </button>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `تم حفظ التعديلات وترقية النموذج إلى v${currentRequest?.formSchemaVersion || 1} وتحديثه عند الجميع!`
                  : `Saved & pushed to all reps (v${currentRequest?.formSchemaVersion || 1})!`}
              </span>
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title={lang === 'ar' ? 'حفظ الحقول وترقية الإصدار وتعميم التحديثات فوراً' : 'Save changes and push version update to all representatives'}
          >
            <Save className="w-4 h-4" />
            <span>
              {currentRequest?.status === 'Published'
                ? lang === 'ar'
                  ? 'حفظ وترقية النموذج عند الجميع'
                  : 'Save & Propagate Update'
                : lang === 'ar'
                ? 'حفظ النموذج'
                : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>

      {currentRequest?.status === 'Published' && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold">
              {lang === 'ar'
                ? `النموذج منشور حالياً ومتاح للمندوبين (الإصدار v${currentRequest.formSchemaVersion || 1})`
                : `Campaign is currently Published & Live (Version v${currentRequest.formSchemaVersion || 1})`}
            </span>
            <span className="text-emerald-700 hidden sm:inline">
              —{' '}
              {lang === 'ar'
                ? 'يمكنك إضافة أعمدة أو تعديل الحقول في أي وقت، وسيتم فوراً ترقية الإصدار وتحديث النموذج على أجهزة المندوبين دون المساس بالبيانات المحفوظة مسبقاً.'
                : 'You can add columns or edit fields anytime. Changes will auto-bump the schema version and reflect on mobile devices without losing existing records.'}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded">
            Auto-Sync Live
          </span>
        </div>
      )}
    </>
  );
};
