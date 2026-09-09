import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RecordItem, RequestField } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Camera,
  MapPin,
  UploadCloud,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  record: RecordItem;
  fields: RequestField[];
  onBack: () => void;
}

export const MobileRecordForm: React.FC<Props> = ({ record, fields, onBack }) => {
  const { lang, dir, t, recordResponses, saveDraftRecord, submitRecord, isOnline } = useApp();

  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const saved = recordResponses[record.recordId] || {};
    const initial: Record<string, any> = { ...saved };

    // Auto-populate from record fields / rawData if not yet answered
    fields.forEach((f) => {
      if (initial[f.fieldKey] === undefined || initial[f.fieldKey] === '') {
        const raw = record.rawData || {};
        let val =
          raw[f.fieldKey] ??
          raw[f.fieldLabelAr] ??
          raw[f.fieldLabelEn] ??
          (record as any)[f.fieldKey];

        // Standard entity attribute fallbacks
        if (val === undefined && (f.fieldKey === 'customer_no' || f.fieldKey === 'cust_no')) {
          val = record.customerNo;
        } else if (val === undefined && (f.fieldKey === 'customer_name' || f.fieldKey === 'cust_name')) {
          val = record.customerName;
        } else if (val === undefined && (f.fieldKey === 'branch_name' || f.fieldKey === 'branch')) {
          val = record.branchName;
        } else if (val === undefined && (f.fieldKey === 'location' || f.fieldKey === 'area')) {
          val = record.area;
        } else if (val === undefined && f.defaultValue !== undefined) {
          val = f.defaultValue;
        }

        if (val !== undefined && val !== null && String(val).trim() !== '') {
          initial[f.fieldKey] = val;
        }
      }
    });

    return initial;
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Sync if response changes
  useEffect(() => {
    if (recordResponses[record.recordId]) {
      setFormValues(recordResponses[record.recordId]);
    }
  }, [record.recordId, recordResponses]);

  // Evaluates conditional visibility rule
  const isFieldVisible = (field: RequestField): boolean => {
    if (!field.visibilityRule) return true;
    const targetVal = formValues[field.visibilityRule.targetFieldKey];
    const ruleVal = field.visibilityRule.value;

    switch (field.visibilityRule.operator) {
      case 'equals':
        return String(targetVal) === String(ruleVal);
      case 'not_equals':
        return String(targetVal) !== String(ruleVal);
      case 'is_not_empty':
        return targetVal !== undefined && targetVal !== null && targetVal !== '';
      default:
        return true;
    }
  };

  // Evaluates conditional required rule
  const isFieldRequired = (field: RequestField): boolean => {
    if (field.isRequired) return true;
    if (!field.requiredRule) return false;
    const targetVal = formValues[field.requiredRule.targetFieldKey];
    const ruleVal = field.requiredRule.value;
    if (field.requiredRule.operator === 'equals') {
      return String(targetVal) === String(ruleVal);
    }
    return false;
  };

  const handleChange = (fieldKey: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: val }));
    if (validationErrors[fieldKey]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const handleSaveDraft = () => {
    saveDraftRecord(record.recordId, formValues);
    setSuccessBanner(lang === 'ar' ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully');
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    fields.forEach((field) => {
      const isReadOnly = !!field.readOnlyRule || !!field.isReadOnly;
      if (!isReadOnly && isFieldVisible(field) && isFieldRequired(field)) {
        const val = formValues[field.fieldKey];
        if (val === undefined || val === null || val === '') {
          errors[field.fieldKey] =
            lang === 'ar'
              ? `حقل "${field.fieldLabelAr}" مطلوب لإكمال الاعتماد`
              : `Field "${field.fieldLabelEn}" is required`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const res = submitRecord(record.recordId, formValues);

    if (res.success) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      setSuccessBanner(
        lang === 'ar' ? 'تم الحفظ والاعتماد بنجاح (سجل مكتمل)' : 'Saved and submitted successfully'
      );
      setTimeout(() => {
        setIsSubmitting(false);
        onBack();
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  };

  const captureGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          handleChange('gps_location', coords);
          setIsCapturingGps(false);
        },
        () => {
          // Fallback realistic Saudi GPS
          handleChange('gps_location', '24.7136, 46.6753 (الرياض)');
          setIsCapturingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      handleChange('gps_location', '24.7136, 46.6753 (الرياض)');
      setIsCapturingGps(false);
    }
  };

  const simulatePhotoUpload = () => {
    handleChange(
      'shelf_photo',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80'
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all flex items-center gap-1 text-xs font-bold"
        >
          {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{lang === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>

        <div className="text-center truncate px-2">
          <div className="text-xs font-extrabold text-slate-900 truncate">{record.customerName}</div>
          <div className="text-[10px] text-slate-500 font-mono">
            {record.customerNo} • {record.assignedRegionNo}
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            record.recordStatus === 'Completed'
              ? 'bg-emerald-100 text-emerald-800'
              : record.recordStatus === 'DraftSaved'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {record.recordStatus === 'Completed'
            ? lang === 'ar' ? 'مكتمل' : 'Completed'
            : record.recordStatus === 'DraftSaved'
            ? lang === 'ar' ? 'مسودة' : 'Draft'
            : lang === 'ar' ? 'معلق' : 'Pending'}
        </span>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successBanner}</span>
          </div>
          <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded">
            {lang === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully'}
          </span>
        </div>
      )}

      {/* Main Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Read-Only Imported Customer Info Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-900 mb-2.5 pb-2 border-b border-slate-100">
            <Info className="w-4 h-4 text-purple-700" />
            <span>{lang === 'ar' ? 'بيانات العميل المستوردة (للقراءة فقط)' : 'Imported Customer Data (Read-Only)'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'رقم العميل' : 'Customer No'}</span>
              <span className="font-bold text-slate-800 font-mono">{record.customerNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'الفرع' : 'Branch'}</span>
              <span className="font-semibold text-slate-800">{record.branchName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'المنطقة' : 'Region'}</span>
              <span className="font-semibold text-slate-800 font-mono">#{record.assignedRegionNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'المندوب المسند' : 'Assigned Rep'}</span>
              <span className="font-semibold text-slate-800">{record.repName}</span>
            </div>
            {record.rawData?.TargetItem && (
              <div className="col-span-2 pt-1 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'الصنف المستهدف' : 'Target Item'}</span>
                <span className="font-bold text-purple-950">{record.rawData.TargetItem}</span>
              </div>
            )}
            {record.rawData?.PreviousStock !== undefined && (
              <div>
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'المخزون السابق' : 'Previous Stock'}</span>
                <span className="font-semibold text-slate-700">{record.rawData.PreviousStock} كرتون</span>
              </div>
            )}
            {record.rawData?.ShelfCode && (
              <div>
                <span className="text-slate-400 block text-[10px]">{lang === 'ar' ? 'رمز الرف' : 'Shelf Code'}</span>
                <span className="font-mono text-slate-700">{record.rawData.ShelfCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Fields Section */}
        <form id="record-form" onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>{lang === 'ar' ? 'نموذج جمع البيانات الميدانية' : 'Field Collection Form'}</span>
            <span className="text-[10px] text-purple-700 font-mono">v{fields[0]?.schemaVersion || 1}.0 Schema</span>
          </div>

          {fields.map((field) => {
            if (!isFieldVisible(field)) return null;

            const isReadOnly = !!field.readOnlyRule || !!field.isReadOnly;
            const required = !isReadOnly && isFieldRequired(field);
            const error = validationErrors[field.fieldKey];
            const value = formValues[field.fieldKey];

            return (
              <div
                key={field.fieldId}
                className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                  error
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isReadOnly
                    ? 'border-amber-200/80 bg-slate-50/60'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Field Label & Required/ReadOnly Mark */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? field.fieldLabelAr : field.fieldLabelEn}</span>
                    {required && <span className="text-rose-600 font-bold">*</span>}
                  </label>
                  <div className="flex items-center gap-1">
                    {isReadOnly && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 font-bold border border-amber-300/70 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>{lang === 'ar' ? 'للعرض فقط' : 'Read Only'}</span>
                      </span>
                    )}
                    {field.visibilityRule && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                        {lang === 'ar' ? 'حقل شرطي' : 'Conditional'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Help text */}
                {(field.helpTextAr || field.helpTextEn) && (
                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'ar' ? field.helpTextAr : field.helpTextEn}
                  </p>
                )}

                {/* Read-only field representation: Clean, non-editable data view */}
                {isReadOnly ? (
                  <div className="w-full rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between text-xs shadow-2xs">
                    <div className="font-extrabold text-slate-900">
                      {field.fieldType === 'currency' ? (
                        <span>
                          {typeof value === 'number'
                            ? value.toLocaleString()
                            : !isNaN(Number(value)) && value !== ''
                            ? Number(value).toLocaleString()
                            : String(value || '0')}{' '}
                          {lang === 'ar' ? 'ر.س' : 'SAR'}
                        </span>
                      ) : field.fieldType === 'date' ? (
                        <span>
                          {value
                            ? new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')
                            : lang === 'ar'
                            ? 'غير محدد'
                            : 'N/A'}
                        </span>
                      ) : (
                        <span>
                          {value !== undefined && value !== null && String(value).trim() !== ''
                            ? String(value)
                            : lang === 'ar'
                            ? 'غير مسجل'
                            : 'N/A'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {lang === 'ar' ? 'بيانات معتمدة من الإكسل' : 'Imported from Excel'}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Field Input by Type */}
                    {field.fieldType === 'select' && field.options && (
                      <select
                        value={value || ''}
                        onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="">{lang === 'ar' ? '-- اختر من القائمة --' : '-- Select an option --'}</option>
                        {field.options.map((opt) => (
                          <option key={opt.id} value={opt.value}>
                            {lang === 'ar' ? opt.labelAr : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    )}

                {field.fieldType === 'textarea' && (
                  <textarea
                    rows={3}
                    value={value || ''}
                    onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                    placeholder={lang === 'ar' ? field.placeholderAr || 'اكتب هنا...' : field.placeholderEn || 'Type here...'}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                )}

                {field.fieldType === 'yes_no' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange(field.fieldKey, true)}
                      className={`flex-1 h-11 rounded-xl text-xs font-bold border transition-all ${
                        value === true || value === 'true'
                          ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'ar' ? 'نعم' : 'Yes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange(field.fieldKey, false)}
                      className={`flex-1 h-11 rounded-xl text-xs font-bold border transition-all ${
                        value === false || value === 'false'
                          ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'ar' ? 'لا' : 'No'}
                    </button>
                  </div>
                )}

                {field.fieldType === 'currency' && (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={value || ''}
                      onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <div className="absolute top-3 end-3 text-xs text-slate-400 font-bold">
                      {lang === 'ar' ? 'ر.س' : 'SAR'}
                    </div>
                  </div>
                )}

                {field.fieldType === 'date' && (
                  <div className="relative">
                    <input
                      type="date"
                      value={value || ''}
                      onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                )}

                {field.fieldType === 'photo' && (
                  <div>
                    {value ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-300">
                        <img src={value} alt="Shelf" className="w-full h-36 object-cover" />
                        <button
                          type="button"
                          onClick={() => handleChange(field.fieldKey, null)}
                          className="absolute top-2 end-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow"
                        >
                          {lang === 'ar' ? 'حذف الصورة' : 'Remove'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={simulatePhotoUpload}
                        className="w-full h-24 border-2 border-dashed border-slate-300 hover:border-purple-600 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-purple-50/50 text-slate-600 transition-all cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-purple-700" />
                        <span className="text-xs font-bold text-slate-700">
                          {lang === 'ar' ? 'التقاط أو رفع صورة الرف' : 'Take or Upload Shelf Photo'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lang === 'ar' ? 'يدعم الكاميرا والاستوديو' : 'Supports Camera & Gallery'}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {field.fieldType === 'gps' && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={value || ''}
                        placeholder={lang === 'ar' ? 'لم يتم تحديد الموقع بعد' : 'Coordinates not recorded yet'}
                        className="flex-1 h-11 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={captureGps}
                        disabled={isCapturingGps}
                        className="h-11 px-3.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{isCapturingGps ? (lang === 'ar' ? 'تحديد...' : 'Locating...') : (lang === 'ar' ? 'تسجيل الموقع' : 'Record GPS')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* General text input fallback for text/integer/etc */}
                {!['select', 'textarea', 'yes_no', 'currency', 'date', 'photo', 'gps'].includes(field.fieldType) && (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                    placeholder={lang === 'ar' ? field.placeholderAr || '' : field.placeholderEn || ''}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                )}
                </>
              )}

                {/* Validation Error Text */}
                {error && (
                  <div className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            );
          })}
        </form>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 flex gap-2 shadow-lg">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4 text-slate-600" />
          <span>{lang === 'ar' ? 'حفظ كمسودة' : 'Save Draft'}</span>
        </button>

        <button
          type="submit"
          form="record-form"
          disabled={isSubmitting}
          className="flex-2 h-12 rounded-xl bg-purple-900 hover:bg-purple-800 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isSubmitting
              ? lang === 'ar' ? 'جاري الاعتماد...' : 'Submitting...'
              : lang === 'ar' ? 'اعتماد وإرسال السجل' : 'Submit & Complete'}
          </span>
        </button>
      </div>
    </div>
  );
};
