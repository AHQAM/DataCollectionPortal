import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestField, FieldType } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Sliders,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { FieldListSidebar } from './form-builder/FieldListSidebar';
import { FieldPropertiesEditor } from './form-builder/FieldPropertiesEditor';
import { FormMobilePreview } from './form-builder/FormMobilePreview';

interface Props {
  requestId: string;
  onBack: () => void;
  onOpenImportWizard?: (requestId: string) => void;
}

export const AdminFormBuilder: React.FC<Props> = ({ requestId, onBack, onOpenImportWizard }) => {
  const { lang, dir, requests, fields, updateRequestFields } = useApp();

  const currentRequest = requests.find((r) => r.requestId === requestId);
  const initialFields = fields.filter((f) => f.requestId === requestId);

  const [formFields, setFormFields] = useState<RequestField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialFields.length > 0 ? initialFields[0].fieldId : null
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const selectedField = formFields.find((f) => f.fieldId === selectedFieldId);

  const handleAddField = (type: FieldType = 'select') => {
    const newId = `field_${Date.now()}`;
    const newFieldKey = `custom_${formFields.length + 1}`;
    const newField: RequestField = {
      fieldId: newId,
      requestId,
      fieldKey: newFieldKey,
      fieldType: type,
      fieldLabelAr: `حقل جديد #${formFields.length + 1}`,
      fieldLabelEn: `New Field #${formFields.length + 1}`,
      isRequired: false,
      sortOrder: formFields.length + 1,
      options:
        type === 'select' || type === 'single_choice' || type === 'multi_choice'
          ? [
              { id: 'opt_1', value: 'opt_1', labelAr: 'خيار 1', labelEn: 'Option 1' },
              { id: 'opt_2', value: 'opt_2', labelAr: 'خيار 2', labelEn: 'Option 2' },
            ]
          : undefined,
      schemaVersion: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFormFields([...formFields, newField]);
    setSelectedFieldId(newId);
  };

  const handleDuplicateField = (field: RequestField) => {
    const copyId = `field_${Date.now()}`;
    const copy: RequestField = {
      ...field,
      fieldId: copyId,
      fieldKey: `${field.fieldKey}_copy`,
      fieldLabelAr: `${field.fieldLabelAr} (نسخة)`,
      fieldLabelEn: `${field.fieldLabelEn} (Copy)`,
      sortOrder: formFields.length + 1,
    };
    setFormFields([...formFields, copy]);
    setSelectedFieldId(copyId);
  };

  const handleDeleteField = (fieldId: string) => {
    const updated = formFields.filter((f) => f.fieldId !== fieldId);
    setFormFields(updated);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(updated.length > 0 ? updated[0].fieldId : null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formFields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...formFields];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    next.forEach((f, i) => {
      f.sortOrder = i + 1;
    });

    setFormFields(next);
  };

  const updateSelectedField = (updates: Partial<RequestField>) => {
    if (!selectedFieldId) return;
    setFormFields((prev) =>
      prev.map((f) => (f.fieldId === selectedFieldId ? { ...f, ...updates } : f))
    );
  };

  const handleSaveAll = () => {
    updateRequestFields(requestId, formFields);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadInactiveCustomersPreset = () => {
    const templateFields: RequestField[] = [
      {
        fieldId: 'fld_cust_no_' + Date.now(),
        requestId,
        fieldKey: 'customer_no',
        fieldType: 'text',
        fieldLabelAr: 'رقم العميل',
        fieldLabelEn: 'Customer No',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_cust_name_' + (Date.now() + 1),
        requestId,
        fieldKey: 'customer_name',
        fieldType: 'text',
        fieldLabelAr: 'اسم العميل',
        fieldLabelEn: 'Customer Name',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_branch_' + (Date.now() + 2),
        requestId,
        fieldKey: 'branch_name',
        fieldType: 'text',
        fieldLabelAr: 'الفرع',
        fieldLabelEn: 'Branch',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_loc_' + (Date.now() + 3),
        requestId,
        fieldKey: 'location',
        fieldType: 'text',
        fieldLabelAr: 'الموقع / العنوان',
        fieldLabelEn: 'Location / Address',
        placeholderAr: 'يُستورد تلقائياً من الإكسل',
        placeholderEn: 'Imported from Excel',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_debit_' + (Date.now() + 4),
        requestId,
        fieldKey: 'debit_balance',
        fieldType: 'currency',
        fieldLabelAr: 'المديونية الحالية',
        fieldLabelEn: 'Debit Balance',
        placeholderAr: '0.00',
        placeholderEn: '0.00',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_last_deal_' + (Date.now() + 5),
        requestId,
        fieldKey: 'last_deal_date',
        fieldType: 'date',
        fieldLabelAr: 'تاريخ آخر تعامل',
        fieldLabelEn: 'Last Deal Date',
        isRequired: false,
        readOnlyRule: true,
        isReadOnly: true,
        schemaVersion: 1,
        sortOrder: 6,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_inact_reason_' + (Date.now() + 6),
        requestId,
        fieldKey: 'inactivity_reason',
        fieldType: 'select',
        fieldLabelAr: 'سبب عدم الشراء',
        fieldLabelEn: 'Reason for Not Buying',
        helpTextAr: 'يحدد المندوب سبب انقطاع العميل أو عدم شرائه بعد الزيارة الميدانية',
        helpTextEn: 'Representative selects why the customer stopped buying after the field visit',
        isRequired: true,
        readOnlyRule: false,
        isReadOnly: false,
        schemaVersion: 1,
        options: [
          { id: 'opt_1', value: 'أسعار المنافسين أقل', labelAr: 'أسعار المنافسين أقل', labelEn: 'Competitor prices lower' },
          { id: 'opt_2', value: 'إغلاق المحل أو انتقال النشاط', labelAr: 'إغلاق المحل أو انتقال النشاط', labelEn: 'Store closed or relocated' },
          { id: 'opt_3', value: 'وجود بضاعة سابقة متراكمة', labelAr: 'وجود بضاعة سابقة متراكمة', labelEn: 'Accumulated stock in store' },
          { id: 'opt_4', value: 'مشكلة ائتمانية / إيقاف التوريد بسبب المديونية', labelAr: 'مشكلة ائتمانية / إيقاف التوريد بسبب المديونية', labelEn: 'Credit block due to debt' },
          { id: 'opt_5', value: 'تأخر مواعيد التسليم والتوصيل', labelAr: 'تأخر مواعيد التسليم والتوصيل', labelEn: 'Delivery service delays' },
          { id: 'opt_6', value: 'شكوى من جودة المنتجات أو الصلاحية', labelAr: 'شكوى من جودة المنتجات أو الصلاحية', labelEn: 'Quality or expiry complaint' },
          { id: 'opt_7', value: 'المطالبة بخصومات وعروض إضافية', labelAr: 'المطالبة بخصومات وعروض إضافية', labelEn: 'Demands higher discounts/promos' },
          { id: 'opt_8', value: 'سبب آخر (يُذكر في الملاحظات)', labelAr: 'سبب آخر (يُذكر في الملاحظات)', labelEn: 'Other reason (specified in notes)' },
        ],
        sortOrder: 7,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        fieldId: 'fld_rep_notes_' + (Date.now() + 7),
        requestId,
        fieldKey: 'rep_visit_notes',
        fieldType: 'textarea',
        fieldLabelAr: 'ملاحظات الزيارة والإجراء المتخذ',
        fieldLabelEn: 'Visit Notes & Action Plan',
        placeholderAr: 'سجل تفاصيل مقابلة العميل، الاتفاق على التسوية، أو موعد الزيارة القادمة...',
        placeholderEn: 'Record meeting details, settlement agreement, or next visit date...',
        isRequired: false,
        readOnlyRule: false,
        isReadOnly: false,
        schemaVersion: 1,
        sortOrder: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setFormFields(templateFields);
    setSelectedFieldId(templateFields[6].fieldId);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
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

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <FieldListSidebar
          lang={lang}
          formFields={formFields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onAddField={handleAddField}
          onMoveField={handleMove}
        />

        <FieldPropertiesEditor
          lang={lang}
          selectedField={selectedField}
          formFields={formFields}
          onUpdateField={updateSelectedField}
          onDuplicateField={handleDuplicateField}
          onDeleteField={handleDeleteField}
        />

        <FormMobilePreview
          lang={lang}
          formFields={formFields}
          previewValues={previewValues}
          onPreviewValueChange={(key, val) => setPreviewValues((prev) => ({ ...prev, [key]: val }))}
        />
      </div>
    </div>
  );
};
