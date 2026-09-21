import React from 'react';
import { RequestField } from '../../../types';
import { ExternalLink, Compass } from 'lucide-react';

interface RecordResponseWidgetProps {
  field: RequestField;
  val: any;
  lang: 'ar' | 'en';
  setActiveImagePreview: (url: string) => void;
}

export const RecordResponseWidget: React.FC<RecordResponseWidgetProps> = ({
  field,
  val,
  lang,
  setActiveImagePreview,
}) => {
  if (val === undefined || val === null || val === '') {
    return (
      <span className="text-slate-400 italic text-xs">
        {lang === 'ar' ? 'لم يتم تقديم إجابة' : 'No response provided'}
      </span>
    );
  }

  // Boolean or Yes/No
  if (
    typeof val === 'boolean' ||
    val === 'true' ||
    val === 'false' ||
    val === 'yes' ||
    val === 'no' ||
    val === 'نعم' ||
    val === 'لا'
  ) {
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
    (typeof val === 'string' &&
      (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/')))
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
  if (
    field.fieldType === 'signature' &&
    typeof val === 'string' &&
    (val.startsWith('data:image') || val.startsWith('http'))
  ) {
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
    const match = field.options.find(
      (opt) => opt.value === String(val) || opt.id === String(val)
    );
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
