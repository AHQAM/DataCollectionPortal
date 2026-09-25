import React from "react";
import { RequestField } from "../../../types";
import { Eye, Lock } from "lucide-react";
import i18n from "../../../i18n";

interface FormMobilePreviewProps {
  lang: string;
  formFields: RequestField[];
  previewValues: Record<string, any>;
  onPreviewValueChange: (fieldKey: string, value: any) => void;
}

export const FormMobilePreview: React.FC<FormMobilePreviewProps> = ({
  lang,
  formFields,
  previewValues,
  onPreviewValueChange,
}) => {
  const isPreviewFieldVisible = (field: RequestField): boolean => {
    if (!field.visibilityRule) return true;
    const targetVal = previewValues[field.visibilityRule.targetFieldKey];
    const ruleVal = field.visibilityRule.value;
    if (field.visibilityRule.operator === "equals")
      return String(targetVal) === String(ruleVal);
    if (field.visibilityRule.operator === "not_equals")
      return String(targetVal) !== String(ruleVal);
    if (field.visibilityRule.operator === "is_not_empty")
      return (
        targetVal !== undefined &&
        targetVal !== null &&
        String(targetVal).trim() !== ""
      );
    return true;
  };

  return (
    <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col max-h-[750px]">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
        <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-purple-700" />
          <span>
            {i18n.t("auto.liveInteractivePreview")}
          </span>
        </span>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          {i18n.t("auto.live")}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pe-1">
        {formFields.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {i18n.t("auto.formIsEmptyAdd")}
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
                  isReadOnly
                    ? "bg-amber-50/40 border-amber-200/90"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>
                      {lang === "ar" ? f.fieldLabelAr : f.fieldLabelEn}
                    </span>
                    {f.isRequired && !isReadOnly && (
                      <span className="text-rose-600 font-bold mx-1">*</span>
                    )}
                  </label>
                  {isReadOnly && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{i18n.t("auto.readonly")}</span>
                    </span>
                  )}
                </div>

                {isReadOnly ? (
                  <div className="w-full h-8 px-2.5 rounded-lg border border-amber-200 bg-white text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>
                      {f.defaultValue !== undefined &&
                      f.defaultValue !== null &&
                      String(f.defaultValue).trim() !== ""
                        ? String(f.defaultValue)
                        : f.fieldType === "currency"
                          ? i18n.t("auto.15000Sar")
                          : f.fieldType === "date"
                            ? "2026-06-01"
                            : lang === "ar"
                              ? `[بيانات ${f.fieldLabelAr} من ملف الإكسل]`
                              : `[${f.fieldLabelEn || f.fieldKey} from Excel]`}
                    </span>
                    <span className="text-[9px] text-amber-700 font-medium">
                      {i18n.t("auto.excelImported")}
                    </span>
                  </div>
                ) : (
                  <>
                    {f.fieldType === "select" && (
                      <select
                        value={val || ""}
                        onChange={(e) =>
                          onPreviewValueChange(f.fieldKey, e.target.value)
                        }
                        className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs"
                      >
                        <option value="">-- اختر --</option>
                        {(f.options || []).map((opt) => (
                          <option key={opt.id} value={opt.value}>
                            {lang === "ar" ? opt.labelAr : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    )}

                    {f.fieldType === "yes_no" && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewValueChange(f.fieldKey, true)}
                          className={`flex-1 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            val === true
                              ? "bg-purple-900 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {i18n.t("auto.yes")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onPreviewValueChange(f.fieldKey, false)
                          }
                          className={`flex-1 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            val === false
                              ? "bg-purple-900 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {i18n.t("auto.no")}
                        </button>
                      </div>
                    )}

                    {f.fieldType === "textarea" && (
                      <textarea
                        rows={2}
                        value={val || ""}
                        onChange={(e) =>
                          onPreviewValueChange(f.fieldKey, e.target.value)
                        }
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                      />
                    )}

                    {f.fieldType === "currency" && (
                      <div className="relative">
                        <input
                          type="number"
                          value={val || ""}
                          onChange={(e) =>
                            onPreviewValueChange(f.fieldKey, e.target.value)
                          }
                          className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs"
                        />
                        <span className="absolute top-1.5 end-2 text-[10px] text-slate-400 font-bold">
                          ر.س
                        </span>
                      </div>
                    )}

                    {!["select", "yes_no", "textarea", "currency"].includes(
                      f.fieldType,
                    ) && (
                      <input
                        type="text"
                        value={val || ""}
                        onChange={(e) =>
                          onPreviewValueChange(f.fieldKey, e.target.value)
                        }
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
  );
};
