import React from "react";
import {
  RequestField,
  FieldType,
  FieldOption,
  ConditionalRule,
} from "../../../types";
import { Copy, Trash2, Lock } from "lucide-react";
import { ALL_FIELD_TYPES } from "./formBuilderTypes";

interface FieldPropertiesEditorProps {
  lang: string;
  selectedField: RequestField | undefined;
  formFields: RequestField[];
  onUpdateField: (updates: Partial<RequestField>) => void;
  onDuplicateField: (field: RequestField) => void;
  onDeleteField: (fieldId: string) => void;
}

export const FieldPropertiesEditor: React.FC<FieldPropertiesEditorProps> = ({
  lang,
  selectedField,
  formFields,
  onUpdateField,
  onDuplicateField,
  onDeleteField,
}) => {
  if (!selectedField) {
    return (
      <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-center min-h-[400px]">
        <div className="p-8 text-center text-slate-400 text-xs">
          {lang === "ar"
            ? "اختر حقلاً من القائمة الجانبية لتعديله"
            : "Select a field to edit"}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs overflow-y-auto max-h-[750px]">
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="font-extrabold text-sm text-slate-900">
            {lang === "ar"
              ? "خصائص الحقل وقواعد الإلزام والشرطية"
              : "Field Settings & Rules"}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicateField(selectedField)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title={lang === "ar" ? "استنساخ الحقل" : "Duplicate"}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteField(selectedField.fieldId)}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              title={lang === "ar" ? "حذف الحقل" : "Delete"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Field Type Selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === "ar" ? "نوع الحقل (24 نوعاً متاحاً)" : "Field Type"}
          </label>
          <select
            value={selectedField.fieldType}
            onChange={(e) =>
              onUpdateField({ fieldType: e.target.value as FieldType })
            }
            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-bold text-purple-950"
          >
            {ALL_FIELD_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.icon} {lang === "ar" ? t.labelAr : t.labelEn} ({t.type})
              </option>
            ))}
          </select>
        </div>

        {/* Field Key & Required */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar" ? "مفتاح الحقل البرمجي" : "Field Key (Unique)"}
            </label>
            <input
              type="text"
              value={selectedField.fieldKey}
              onChange={(e) =>
                onUpdateField({ fieldKey: e.target.value.trim() })
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={
                  selectedField.isRequired &&
                  !(selectedField.readOnlyRule || selectedField.isReadOnly)
                }
                disabled={
                  !!selectedField.readOnlyRule || !!selectedField.isReadOnly
                }
                onChange={(e) =>
                  onUpdateField({ isRequired: e.target.checked })
                }
                className="rounded text-purple-900 w-4 h-4 disabled:opacity-40"
              />
              <span
                className={
                  selectedField.readOnlyRule || selectedField.isReadOnly
                    ? "text-slate-400"
                    : ""
                }
              >
                {lang === "ar" ? "حقل إلزامي من المستخدم" : "Required from User"}
              </span>
            </label>
          </div>
        </div>

        {/* Read-Only Mode Toggle (Excel Pre-filled) */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950 text-xs">
            <input
              type="checkbox"
              checked={
                !!selectedField.readOnlyRule || !!selectedField.isReadOnly
              }
              onChange={(e) =>
                onUpdateField({
                  readOnlyRule: e.target.checked,
                  isReadOnly: e.target.checked,
                  isRequired: e.target.checked
                    ? false
                    : selectedField.isRequired,
                })
              }
              className="rounded text-amber-700 w-4 h-4"
            />
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {lang === "ar"
                  ? "حقل للعرض فقط (بيانات مستوردة عبر الإكسل - غير قابلة للتعديل من المستخدم)"
                  : "Read-Only Field (Imported via Excel - Non-editable by user)"}
              </span>
            </div>
          </label>
          <p className="text-[11px] text-amber-800/90 leading-relaxed ps-6">
            {lang === "ar"
              ? "عند تفعيل هذا الخيار، يتم استيراد القيمة (مثل: رقم السجل، اسم الجهة، الفرع، الموقع) من ملف الإكسل وتظهر للمستخدم كمرجع ثابت بدون إمكانية التعديل، بينما يقوم بتعبئة الحقول الأخرى."
              : "When enabled, this value is imported from Excel (e.g. Record ID, Target Name, Branch, Location) and shown to the user as read-only, allowing them to fill other fields."}
          </p>
        </div>

        {/* Labels AR & EN */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === "ar" ? "تسمية الحقل بالعربية" : "Label (Arabic)"}
          </label>
          <input
            type="text"
            value={selectedField.fieldLabelAr}
            onChange={(e) => onUpdateField({ fieldLabelAr: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === "ar" ? "تسمية الحقل بالإنجليزية" : "Label (English)"}
          </label>
          <input
            type="text"
            value={selectedField.fieldLabelEn}
            onChange={(e) => onUpdateField({ fieldLabelEn: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
          />
        </div>

        {/* Placeholders / Help Text */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar" ? "نص إرشادي بالعربية" : "Help Text (Arabic)"}
            </label>
            <input
              type="text"
              value={selectedField.helpTextAr || ""}
              onChange={(e) => onUpdateField({ helpTextAr: e.target.value })}
              className="w-full h-9 px-3 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar" ? "نص إرشادي بالإنجليزية" : "Help Text (English)"}
            </label>
            <input
              type="text"
              value={selectedField.helpTextEn || ""}
              onChange={(e) => onUpdateField({ helpTextEn: e.target.value })}
              className="w-full h-9 px-3 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Options Manager */}
        {[
          "select",
          "single_choice",
          "multi_choice",
          "searchable_dropdown",
        ].includes(selectedField.fieldType) && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                {lang === "ar"
                  ? "خيارات القائمة المتاحة للمستخدم"
                  : "Options Available to User"}
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
                  onUpdateField({ options: [...currentOpts, newOpt] });
                }}
                className="text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                + {lang === "ar" ? "إضافة خيار" : "Add Option"}
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
                      onUpdateField({ options: next });
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
                      onUpdateField({ options: next });
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
                      onUpdateField({ options: next });
                    }}
                    className="flex-1 h-8 px-2 rounded border border-slate-300 text-xs"
                    placeholder="English"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (selectedField.options || []).filter(
                        (_, idx) => idx !== i,
                      );
                      onUpdateField({ options: next });
                    }}
                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
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
            {lang === "ar"
              ? "قاعدة الظهور الشرطي (Conditional Visibility)"
              : "Conditional Visibility Rule"}
          </span>
          <p className="text-[11px] text-slate-500">
            {lang === "ar"
              ? "إظهار هذا الحقل فقط إذا تحققت قيمة معينة في حقل آخر"
              : "Show this field only when target field equals value"}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={selectedField.visibilityRule?.targetFieldKey || ""}
              onChange={(e) => {
                if (!e.target.value) {
                  onUpdateField({ visibilityRule: undefined });
                } else {
                  onUpdateField({
                    visibilityRule: {
                      targetFieldKey: e.target.value,
                      operator: "equals",
                      value: "other_reason",
                    },
                  });
                }
              }}
              className="h-8 px-2 rounded border border-slate-300 text-[11px]"
            >
              <option value="">
                {lang === "ar" ? "-- بدون شرط --" : "-- No Condition --"}
              </option>
              {formFields
                .filter((f) => f.fieldId !== selectedField.fieldId)
                .map((f) => (
                  <option key={f.fieldId} value={f.fieldKey}>
                    {f.fieldLabelAr} ({f.fieldKey})
                  </option>
                ))}
            </select>

            <select
              value={selectedField.visibilityRule?.operator || "equals"}
              onChange={(e) => {
                if (selectedField.visibilityRule) {
                  onUpdateField({
                    visibilityRule: {
                      ...selectedField.visibilityRule,
                      operator: e.target.value as ConditionalRule["operator"],
                    },
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
              value={selectedField.visibilityRule?.value || ""}
              onChange={(e) => {
                if (selectedField.visibilityRule) {
                  onUpdateField({
                    visibilityRule: {
                      ...selectedField.visibilityRule,
                      value: e.target.value,
                    },
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
    </div>
  );
};
