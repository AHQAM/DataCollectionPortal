import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestField, FieldType, FieldOption } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Save,
  Eye,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  requestId: string;
  onBack: () => void;
  onOpenImportWizard?: (requestId: string) => void;
}

const ALL_FIELD_TYPES: { type: FieldType; labelAr: string; labelEn: string; icon: string }[] = [
  { type: 'text', labelAr: 'نص قصير', labelEn: 'Short Text', icon: 'Aa' },
  { type: 'textarea', labelAr: 'نص طويل / ملاحظات', labelEn: 'Long Text / Notes', icon: '¶' },
  { type: 'select', labelAr: 'قائمة منسدلة', labelEn: 'Dropdown Select', icon: '▼' },
  { type: 'yes_no', labelAr: 'نعم / لا', labelEn: 'Yes / No', icon: '✓✗' },
  { type: 'currency', labelAr: 'مبلغ مالي (ر.س)', labelEn: 'Currency (SAR)', icon: '﷼' },
  { type: 'integer', labelAr: 'عدد صحيح (كميات)', labelEn: 'Integer Quantity', icon: '123' },
  { type: 'decimal', labelAr: 'عدد عشري', labelEn: 'Decimal Number', icon: '0.0' },
  { type: 'percentage', labelAr: 'نسبة مئوية %', labelEn: 'Percentage', icon: '%' },
  { type: 'date', labelAr: 'تاريخ الزيارة/المسح', labelEn: 'Date Picker', icon: '📅' },
  { type: 'time', labelAr: 'وقت محدد', labelEn: 'Time Picker', icon: '⏰' },
  { type: 'datetime', labelAr: 'تاريخ ووقت', labelEn: 'Date & Time', icon: '📆' },
  { type: 'single_choice', labelAr: 'اختيار أحادي (Radio)', labelEn: 'Single Choice', icon: '🔘' },
  { type: 'multi_choice', labelAr: 'اختيار متعدد (Checkbox)', labelEn: 'Multi Choice', icon: '☑' },
  { type: 'searchable_dropdown', labelAr: 'قائمة قابلة للبحث', labelEn: 'Searchable Select', icon: '🔍' },
  { type: 'photo', labelAr: 'صورة واحدة للرف', labelEn: 'Single Photo', icon: '📷' },
  { type: 'multi_photo', labelAr: 'صور متعددة', labelEn: 'Multiple Photos', icon: '🖼️' },
  { type: 'barcode_scan', labelAr: 'مسح باركود الصنف', labelEn: 'Barcode Scanner', icon: '||||' },
  { type: 'qr_scan', labelAr: 'مسح رمز QR', labelEn: 'QR Code Scanner', icon: '🏁' },
  { type: 'gps', labelAr: 'إحداثيات الموقع (GPS)', labelEn: 'GPS Location', icon: '📍' },
  { type: 'signature', labelAr: 'توقيع العميل الإلكتروني', labelEn: 'Customer Signature', icon: '✍️' },
  { type: 'file_attachment', labelAr: 'ملف مرفق (PDF/Doc)', labelEn: 'File Attachment', icon: '📎' },
  { type: 'rating', labelAr: 'تقييم نجوم (1-5)', labelEn: 'Rating Stars', icon: '★' },
  { type: 'calculated_field', labelAr: 'حقل محسوب تلقائياً', labelEn: 'Calculated Field', icon: 'fx' },
  { type: 'static_instruction', labelAr: 'نص إرشادي ثابت', labelEn: 'Static Guidance', icon: 'ℹ' },
];

export const AdminFormBuilder: React.FC<Props> = ({ requestId, onBack, onOpenImportWizard }) => {
  const { lang, dir, t, requests, fields, updateRequestFields } = useApp();

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

    // re-assign sortOrder
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

  // Check conditional visibility in live preview
  const isPreviewFieldVisible = (field: RequestField): boolean => {
    if (!field.visibilityRule) return true;
    const targetVal = previewValues[field.visibilityRule.targetFieldKey];
    const ruleVal = field.visibilityRule.value;
    if (field.visibilityRule.operator === 'equals') return String(targetVal) === String(ruleVal);
    if (field.visibilityRule.operator === 'not_equals') return String(targetVal) !== String(ruleVal);
    return true;
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
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-1.5 text-xs"
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

      {/* 3-Column Layout: Fields List (Col 1), Field Configuration (Col 2), Live Interactive Preview (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1: Fields Tree / Order (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between max-h-[750px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="font-extrabold text-xs text-slate-800">
                {lang === 'ar' ? `حقول النموذج (${formFields.length})` : `Form Fields (${formFields.length})`}
              </span>
              <button
                onClick={() => handleAddField('select')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إضافة حقل' : 'Add'}</span>
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[620px] pe-1">
              {formFields.map((field, idx) => {
                const isSelected = field.fieldId === selectedFieldId;
                return (
                  <div
                    key={field.fieldId}
                    onClick={() => setSelectedFieldId(field.fieldId)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono opacity-70">#{idx + 1}</span>
                        <span className="font-bold truncate">
                          {lang === 'ar' ? field.fieldLabelAr : field.fieldLabelEn}
                        </span>
                        {(field.readOnlyRule || field.isReadOnly) && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5 shrink-0 ${
                              isSelected
                                ? 'bg-amber-400/30 text-amber-200 border border-amber-300/40'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>{lang === 'ar' ? 'للعرض فقط' : 'Read-only'}</span>
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                        {field.fieldType} • {field.fieldKey}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1 rounded hover:bg-black/10 disabled:opacity-20 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === formFields.length - 1}
                        className={`p-1 rounded hover:bg-black/10 disabled:opacity-20 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <span className="text-[10px] text-slate-400 block text-center">
              {lang === 'ar' ? 'يدعم 24 نوع حقل وقواعد شرطية' : 'Supports 24 field types & conditions'}
            </span>
          </div>
        </div>

        {/* Col 2: Field Details & Rules Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs overflow-y-auto max-h-[750px]">
          {selectedField ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-sm text-slate-900">
                  {lang === 'ar' ? 'خصائص الحقل وقواعد الإلزام والشرطية' : 'Field Settings & Rules'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateField(selectedField)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title={lang === 'ar' ? 'استنساخ الحقل' : 'Duplicate'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteField(selectedField.fieldId)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                    title={lang === 'ar' ? 'حذف الحقل' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Field Type Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'نوع الحقل (24 نوعاً متاحاً)' : 'Field Type'}
                </label>
                <select
                  value={selectedField.fieldType}
                  onChange={(e) => updateSelectedField({ fieldType: e.target.value as FieldType })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-bold text-purple-950"
                >
                  {ALL_FIELD_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.icon} {lang === 'ar' ? t.labelAr : t.labelEn} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Key & Required */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'مفتاح الحقل البرمجي' : 'Field Key (Unique)'}
                  </label>
                  <input
                    type="text"
                    value={selectedField.fieldKey}
                    onChange={(e) => updateSelectedField({ fieldKey: e.target.value.trim() })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedField.isRequired && !(selectedField.readOnlyRule || selectedField.isReadOnly)}
                      disabled={!!selectedField.readOnlyRule || !!selectedField.isReadOnly}
                      onChange={(e) => updateSelectedField({ isRequired: e.target.checked })}
                      className="rounded text-purple-900 w-4 h-4 disabled:opacity-40"
                    />
                    <span className={selectedField.readOnlyRule || selectedField.isReadOnly ? 'text-slate-400' : ''}>
                      {lang === 'ar' ? 'حقل إلزامي من المندوب' : 'Required from Rep'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Read-Only Mode Toggle (Excel Pre-filled) */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950 text-xs">
                  <input
                    type="checkbox"
                    checked={!!selectedField.readOnlyRule || !!selectedField.isReadOnly}
                    onChange={(e) =>
                      updateSelectedField({
                        readOnlyRule: e.target.checked,
                        isReadOnly: e.target.checked,
                        isRequired: e.target.checked ? false : selectedField.isRequired,
                      })
                    }
                    className="rounded text-amber-700 w-4 h-4"
                  />
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>
                      {lang === 'ar'
                        ? 'حقل للعرض فقط (بيانات مستوردة عبر الإكسل - غير قابلة للتعديل من المندوب)'
                        : 'Read-Only Field (Imported via Excel - Non-editable by rep)'}
                    </span>
                  </div>
                </label>
                <p className="text-[11px] text-amber-800/90 leading-relaxed ps-6">
                  {lang === 'ar'
                    ? 'عند تفعيل هذا الخيار، يتم استيراد القيمة (مثل: رقم العميل، اسم العميل، الفرع، الموقع، المديونية، تاريخ آخر تعامل) من ملف الإكسل وتظهر للمندوب كمرجع ثابت بدون إمكانية التعديل، بينما يقوم بتعبأة الحقول الأخرى مثل سبب عدم الشراء.'
                    : 'When enabled, this value is imported from Excel (e.g. Customer No, Name, Branch, Location, Debt, Last Deal Date) and shown to the rep as read-only, allowing them to fill other fields like Reason for No Purchase.'}
                </p>
              </div>

              {/* Labels AR & EN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'تسمية الحقل بالعربية' : 'Label (Arabic)'}
                </label>
                <input
                  type="text"
                  value={selectedField.fieldLabelAr}
                  onChange={(e) => updateSelectedField({ fieldLabelAr: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'تسمية الحقل بالإنجليزية' : 'Label (English)'}
                </label>
                <input
                  type="text"
                  value={selectedField.fieldLabelEn}
                  onChange={(e) => updateSelectedField({ fieldLabelEn: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              {/* Placeholders / Help Text */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نص إرشادي بالعربية' : 'Help Text (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={selectedField.helpTextAr || ''}
                    onChange={(e) => updateSelectedField({ helpTextAr: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نص إرشادي بالإنجليزية' : 'Help Text (English)'}
                  </label>
                  <input
                    type="text"
                    value={selectedField.helpTextEn || ''}
                    onChange={(e) => updateSelectedField({ helpTextEn: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Options Manager (if select, single_choice, multi_choice) */}
              {['select', 'single_choice', 'multi_choice', 'searchable_dropdown'].includes(
                selectedField.fieldType
              ) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {lang === 'ar' ? 'خيارات القائمة المتاحة للمندوب' : 'Dropdown Options'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentOpts = selectedField.options || [];
                        const newOpt: FieldOption = {
                          id: `opt_${Date.now()}`,
                          value: `val_${currentOpts.length + 1}`,
                          labelAr: `خيار جديد ${currentOpts.length + 1}`,
                          labelEn: `New Option ${currentOpts.length + 1}`,
                        };
                        updateSelectedField({ options: [...currentOpts, newOpt] });
                      }}
                      className="text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded"
                    >
                      + {lang === 'ar' ? 'إضافة خيار' : 'Add Option'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(selectedField.options || []).map((opt, i) => (
                      <div key={opt.id} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => {
                            const next = [...(selectedField.options || [])];
                            next[i].value = e.target.value;
                            updateSelectedField({ options: next });
                          }}
                          className="w-24 h-8 px-2 rounded border border-slate-300 font-mono text-[10px]"
                          placeholder="value"
                        />
                        <input
                          type="text"
                          value={opt.labelAr}
                          onChange={(e) => {
                            const next = [...(selectedField.options || [])];
                            next[i].labelAr = e.target.value;
                            updateSelectedField({ options: next });
                          }}
                          className="flex-1 h-8 px-2 rounded border border-slate-300 text-xs"
                          placeholder="عربي"
                        />
                        <input
                          type="text"
                          value={opt.labelEn}
                          onChange={(e) => {
                            const next = [...(selectedField.options || [])];
                            next[i].labelEn = e.target.value;
                            updateSelectedField({ options: next });
                          }}
                          className="flex-1 h-8 px-2 rounded border border-slate-300 text-xs"
                          placeholder="English"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (selectedField.options || []).filter((_, idx) => idx !== i);
                            updateSelectedField({ options: next });
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditional Visibility Rule Builder */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                <span className="font-bold text-purple-950 block">
                  {lang === 'ar' ? 'قاعدة الظهور الشرطي (Conditional Visibility)' : 'Conditional Visibility Rule'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {lang === 'ar'
                    ? 'إظهار هذا الحقل فقط إذا تحققت قيمة معينة في حقل آخر'
                    : 'Show this field only when target field equals value'}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selectedField.visibilityRule?.targetFieldKey || ''}
                    onChange={(e) => {
                      if (!e.target.value) {
                        updateSelectedField({ visibilityRule: undefined });
                      } else {
                        updateSelectedField({
                          visibilityRule: {
                            targetFieldKey: e.target.value,
                            operator: 'equals',
                            value: 'other_reason',
                          },
                        });
                      }
                    }}
                    className="h-8 px-2 rounded border border-slate-300 text-[11px]"
                  >
                    <option value="">{lang === 'ar' ? '-- بدون شرط --' : '-- No Condition --'}</option>
                    {formFields
                      .filter((f) => f.fieldId !== selectedField.fieldId)
                      .map((f) => (
                        <option key={f.fieldId} value={f.fieldKey}>
                          {f.fieldLabelAr} ({f.fieldKey})
                        </option>
                      ))}
                  </select>

                  <select
                    value={selectedField.visibilityRule?.operator || 'equals'}
                    onChange={(e) => {
                      if (selectedField.visibilityRule) {
                        updateSelectedField({
                          visibilityRule: { ...selectedField.visibilityRule, operator: e.target.value as any },
                        });
                      }
                    }}
                    disabled={!selectedField.visibilityRule}
                    className="h-8 px-2 rounded border border-slate-300 text-[11px]"
                  >
                    <option value="equals">يساوي / Equals</option>
                    <option value="not_equals">لا يساوي / Not Equals</option>
                    <option value="is_not_empty">ليس فارغاً / Not Empty</option>
                  </select>

                  <input
                    type="text"
                    value={selectedField.visibilityRule?.value || ''}
                    onChange={(e) => {
                      if (selectedField.visibilityRule) {
                        updateSelectedField({
                          visibilityRule: { ...selectedField.visibilityRule, value: e.target.value },
                        });
                      }
                    }}
                    disabled={!selectedField.visibilityRule}
                    placeholder="القيمة المطلوبة (Value)"
                    className="h-8 px-2 rounded border border-slate-300 text-[11px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              {lang === 'ar' ? 'اختر حقلاً من القائمة الجانبية لتعديله' : 'Select a field to edit'}
            </div>
          )}
        </div>

        {/* Col 3: Live Interactive Form Preview (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col max-h-[750px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
            <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-700" />
              <span>{lang === 'ar' ? 'المعاينة التفاعلية الحية' : 'Live Interactive Preview'}</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {lang === 'ar' ? 'مباشر' : 'Live'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pe-1">
            {formFields.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'ar' ? 'النموذج فارغ. أضف حقولاً للبدء.' : 'Form is empty. Add fields to start.'}
              </div>
            ) : (
              formFields.map((f) => {
                if (!isPreviewFieldVisible(f)) return null;

                const val = previewValues[f.fieldKey];

                const isReadOnly = !!f.readOnlyRule || !!f.isReadOnly;

                return (
                  <div
                    key={f.fieldId}
                    className={`p-3 rounded-xl border text-xs shadow-2xs transition-all ${
                      isReadOnly ? 'bg-amber-50/40 border-amber-200/90' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-800 flex items-center gap-1">
                        <span>{lang === 'ar' ? f.fieldLabelAr : f.fieldLabelEn}</span>
                        {f.isRequired && !isReadOnly && <span className="text-rose-600 font-bold mx-1">*</span>}
                      </label>
                      {isReadOnly && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'للعرض فقط' : 'Read-only'}</span>
                        </span>
                      )}
                    </div>

                    {isReadOnly ? (
                      <div className="w-full h-8 px-2.5 rounded-lg border border-amber-200 bg-white text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>
                          {f.defaultValue !== undefined && f.defaultValue !== null && String(f.defaultValue).trim() !== ''
                            ? String(f.defaultValue)
                            : f.fieldType === 'currency'
                            ? (lang === 'ar' ? '15,000 ر.س' : '15,000 SAR')
                            : f.fieldType === 'date'
                            ? '2026-06-01'
                            : (lang === 'ar' ? `[بيانات ${f.fieldLabelAr} من ملف الإكسل]` : `[${f.fieldLabelEn || f.fieldKey} from Excel]`)}
                        </span>
                        <span className="text-[9px] text-amber-700 font-medium">
                          {lang === 'ar' ? 'مستورد من الإكسل' : 'Excel Imported'}
                        </span>
                      </div>
                    ) : (
                      <>
                        {f.fieldType === 'select' && (
                          <select
                            value={val || ''}
                            onChange={(e) => setPreviewValues({ ...previewValues, [f.fieldKey]: e.target.value })}
                            className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs"
                          >
                            <option value="">-- اختر --</option>
                            {(f.options || []).map((opt) => (
                              <option key={opt.id} value={opt.value}>
                                {lang === 'ar' ? opt.labelAr : opt.labelEn}
                              </option>
                            ))}
                          </select>
                        )}

                    {f.fieldType === 'yes_no' && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewValues({ ...previewValues, [f.fieldKey]: true })}
                          className={`flex-1 py-1 rounded-lg border text-xs font-bold ${
                            val === true ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {lang === 'ar' ? 'نعم' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewValues({ ...previewValues, [f.fieldKey]: false })}
                          className={`flex-1 py-1 rounded-lg border text-xs font-bold ${
                            val === false ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {lang === 'ar' ? 'لا' : 'No'}
                        </button>
                      </div>
                    )}

                    {f.fieldType === 'textarea' && (
                      <textarea
                        rows={2}
                        value={val || ''}
                        onChange={(e) => setPreviewValues({ ...previewValues, [f.fieldKey]: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                      />
                    )}

                    {f.fieldType === 'currency' && (
                      <div className="relative">
                        <input
                          type="number"
                          value={val || ''}
                          onChange={(e) => setPreviewValues({ ...previewValues, [f.fieldKey]: e.target.value })}
                          className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs"
                        />
                        <span className="absolute top-1.5 end-2 text-[10px] text-slate-400 font-bold">ر.س</span>
                      </div>
                    )}

                    {!['select', 'yes_no', 'textarea', 'currency'].includes(f.fieldType) && (
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => setPreviewValues({ ...previewValues, [f.fieldKey]: e.target.value })}
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs"
                        placeholder={f.fieldType}
                      />
                    )}
                    </>
                  )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
