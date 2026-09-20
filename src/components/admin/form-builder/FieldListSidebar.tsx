import React from 'react';
import { RequestField, FieldType } from '../../../types';
import { Plus, ChevronUp, ChevronDown, Lock } from 'lucide-react';

interface FieldListSidebarProps {
  lang: string;
  formFields: RequestField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onAddField: (type?: FieldType) => void;
  onMoveField: (index: number, direction: 'up' | 'down') => void;
}

export const FieldListSidebar: React.FC<FieldListSidebarProps> = ({
  lang,
  formFields,
  selectedFieldId,
  onSelectField,
  onAddField,
  onMoveField,
}) => {
  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between max-h-[750px]">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <span className="font-extrabold text-xs text-slate-800">
            {lang === 'ar' ? `حقول النموذج (${formFields.length})` : `Form Fields (${formFields.length})`}
          </span>
          <button
            onClick={() => onAddField('select')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
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
                onClick={() => onSelectField(field.fieldId)}
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
                    onClick={() => onMoveField(idx, 'up')}
                    disabled={idx === 0}
                    className={`p-1 rounded hover:bg-black/10 disabled:opacity-20 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMoveField(idx, 'down')}
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
  );
};
