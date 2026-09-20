import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecordItem, RequestField, RequestItem } from '../../types';
import {
  X,
  FileText,
  User,
  Building,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Printer,
  Compass,
  PenTool,
  Download,
  Info,
} from 'lucide-react';

interface Props {
  record: RecordItem | null;
  request: RequestItem | undefined;
  fields: RequestField[];
  response: Record<string, any> | undefined;
  onClose: () => void;
}

export const RecordResponseModal: React.FC<Props> = ({
  record,
  request,
  fields,
  response,
  onClose,
}) => {
  const { lang } = useApp();
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);

  if (!record) return null;

  const respData: Record<string, any> = response || record.rawData || {};

  // Find any extra keys in respData that aren't mapped to known fields
  const knownKeys = new Set<string>();
  fields.forEach((f) => {
    knownKeys.add(f.fieldKey);
    knownKeys.add(f.fieldId);
  });
  // System keys to ignore from "extra keys"
  const ignoredKeys = new Set([
    'recordId',
    'requestId',
    'activityId',
    'submittedBy',
    'submittedAt',
    'updatedAt',
    'createdAt',
    'id',
    'data',
    'formData',
  ]);

  const extraEntries = Object.entries(respData).filter(
    ([key]) => !knownKeys.has(key) && !ignoredKeys.has(key)
  );

  const getFieldValue = (field: RequestField) => {
    if (respData[field.fieldKey] !== undefined && respData[field.fieldKey] !== null) {
      return respData[field.fieldKey];
    }
    if (respData[field.fieldId] !== undefined && respData[field.fieldId] !== null) {
      return respData[field.fieldId];
    }
    return undefined;
  };

  const formatFieldValue = (field: RequestField, val: any) => {
    if (val === undefined || val === null || val === '') {
      return (
        <span className="text-slate-400 italic text-xs">
          {lang === 'ar' ? 'لم يتم تقديم إجابة' : 'No response provided'}
        </span>
      );
    }

    // Boolean or Yes/No
    if (typeof val === 'boolean' || val === 'true' || val === 'false' || val === 'yes' || val === 'no' || val === 'نعم' || val === 'لا') {
      const isYes = val === true || val === 'true' || val === 'yes' || val === 'نعم';
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            isYes ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {isYes ? '✓ ' + (lang === 'ar' ? 'نعم' : 'Yes') : '✕ ' + (lang === 'ar' ? 'لا' : 'No')}
        </span>
      );
    }

    // Photos / Images
    if (
      field.fieldType === 'photo' ||
      field.fieldType === 'multi_photo' ||
      (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/')))
    ) {
      const urls = Array.isArray(val) ? val : [val];
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {urls.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-24 h-24 cursor-pointer shadow-xs hover:shadow-md transition-all"
              onClick={() => setActiveImagePreview(url)}
            >
              <img
                src={url}
                alt={field.fieldLabelAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Signature
    if (field.fieldType === 'signature' && typeof val === 'string' && (val.startsWith('data:image') || val.startsWith('http'))) {
      return (
        <div className="p-2 bg-white rounded-xl border border-slate-200 max-w-xs shadow-inner">
          <img src={val} alt="Signature" className="max-h-24 object-contain mx-auto" />
        </div>
      );
    }

    // GPS / Location
    if (field.fieldType === 'gps' || (typeof val === 'object' && val.latitude !== undefined)) {
      const lat = typeof val === 'object' ? val.latitude : parseFloat(String(val).split(',')[0]);
      const lng = typeof val === 'object' ? val.longitude : parseFloat(String(val).split(',')[1]);
      const hasCoords = !isNaN(lat) && !isNaN(lng);

      return (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800">
            {hasCoords ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : String(val)}
          </span>
          {hasCoords && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'عرض على خرائط Google' : 'Open in Google Maps'}</span>
            </a>
          )}
        </div>
      );
    }

    // Option / Select / Radio
    if (field.options && field.options.length > 0) {
      const match = field.options.find((opt) => opt.value === String(val) || opt.id === String(val));
      if (match) {
        return (
          <span className="inline-block font-semibold text-xs text-purple-900 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
            {lang === 'ar' ? match.labelAr : match.labelEn}
          </span>
        );
      }
    }

    // Array / Multi-select
    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {val.map((item, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Default text/number
    return (
      <div className="text-xs font-semibold text-slate-800 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap">
        {String(val)}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Submitted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'Submitted' ? (lang === 'ar' ? 'تم الإرسال' : 'Submitted') : (lang === 'ar' ? 'مكتمل' : 'Completed')}</span>
          </span>
        );
      case 'DraftSaved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مسودة محفوظة' : 'Draft Saved'}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {lang === 'ar' ? 'تفاصيل استجابة السجل الميداني' : 'Field Record Response Details'}
                </h2>
                {getStatusBadge(record.recordStatus)}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {request?.requestCode} - {lang === 'ar' ? request?.titleAr : request?.titleEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={lang === 'ar' ? 'طباعة' : 'Print'}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>{lang === 'ar' ? 'العميل' : 'Customer'}</span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">{record.customerName}</div>
              <div className="text-[10px] font-mono text-slate-400">{record.customerNo}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>{lang === 'ar' ? 'المندوب والمنطقة' : 'Rep & Region'}</span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">{record.repName || '-'}</div>
              <div className="text-[10px] font-mono text-purple-700">#{record.assignedRegionNo || record.regionNo || '-'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <Building className="w-3.5 h-3.5 text-purple-600" />
                <span>{lang === 'ar' ? 'الفرع' : 'Branch'}</span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">{record.branchName || '-'}</div>
              <div className="text-[10px] font-mono text-slate-400">{record.branchId || '-'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>{lang === 'ar' ? 'تاريخ التحديث / الإرسال' : 'Submission Date'}</span>
              </div>
              <div className="text-xs font-black text-slate-900">
                {record.submittedAt || record.updatedAt
                  ? new Date(record.submittedAt || record.updatedAt).toLocaleDateString()
                  : '-'}
              </div>
              <div className="text-[10px] text-slate-400">
                {record.submittedAt || record.updatedAt
                  ? new Date(record.submittedAt || record.updatedAt).toLocaleTimeString()
                  : ''}
              </div>
            </div>
          </div>

          {/* Form Fields Responses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>{lang === 'ar' ? 'الاستجابات وإجابات الحقول' : 'Field Responses & Answers'}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {fields.length} {lang === 'ar' ? 'حقل معرف' : 'fields defined'}
              </span>
            </div>

            {fields.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                {lang === 'ar' ? 'لا توجد حقول معرفة لهذا الطلب.' : 'No form fields defined for this campaign.'}
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const val = getFieldValue(field);
                  return (
                    <div
                      key={field.fieldId || index}
                      className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-200 transition-colors space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-purple-50 text-purple-700 font-black text-[11px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {lang === 'ar' ? field.fieldLabelAr : field.fieldLabelEn}
                          </span>
                          {field.isRequired && (
                            <span className="text-rose-500 font-bold text-xs" title="مطلوب / Required">
                              *
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          {field.fieldType}
                        </span>
                      </div>

                      {(field.helpTextAr || field.helpTextEn) && (
                        <p className="text-[11px] text-slate-400">
                          {lang === 'ar' ? field.helpTextAr : field.helpTextEn}
                        </p>
                      )}

                      <div className="pt-1">{formatFieldValue(field, val)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Extra / Raw Data Section (if any keys exist beyond the defined fields) */}
          {extraEntries.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'ar' ? 'بيانات وحقول إضافية مسجلة' : 'Additional Response Data'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extraEntries.map(([key, val]) => (
                  <div key={key} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-mono text-[10px] text-slate-500 block mb-1">{key}</span>
                    <span className="font-semibold text-slate-800">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            {lang === 'ar' ? 'معرف السجل:' : 'Record ID:'} {record.recordId}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent flex flex-col items-center">
            <img
              src={activeImagePreview}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setActiveImagePreview(null)}
              className="mt-3 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white text-xs font-bold backdrop-blur-md transition-all"
            >
              {lang === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
