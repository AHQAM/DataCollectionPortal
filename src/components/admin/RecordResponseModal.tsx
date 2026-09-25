import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { RecordItem, RequestField, RequestItem } from "../../types";
import {
  X,
  FileText,
  User,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Printer,
  Info,
} from "lucide-react";
import { RecordResponseWidget } from "./records/RecordResponseWidget";

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
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(
    null,
  );

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
    "recordId",
    "requestId",
    "activityId",
    "submittedBy",
    "submittedAt",
    "updatedAt",
    "createdAt",
    "id",
    "data",
    "formData",
  ]);

  const extraEntries = Object.entries(respData).filter(
    ([key]) => !knownKeys.has(key) && !ignoredKeys.has(key),
  );

  const getFieldValue = (field: RequestField) => {
    if (
      respData[field.fieldKey] !== undefined &&
      respData[field.fieldKey] !== null
    ) {
      return respData[field.fieldKey];
    }
    if (
      respData[field.fieldId] !== undefined &&
      respData[field.fieldId] !== null
    ) {
      return respData[field.fieldId];
    }
    return undefined;
  };

  const formatFieldValue = (field: RequestField, val: any) => {
    return (
      <RecordResponseWidget
        field={field}
        val={val}
        lang={currentLang}
        setActiveImagePreview={setActiveImagePreview}
      />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
      case "Submitted":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {status === "Submitted"
                ? t("recordResponse.statusSubmitted", { lng: currentLang })
                : t("recordResponse.statusCompleted", { lng: currentLang })}
            </span>
          </span>
        );
      case "DraftSaved":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{t("recordResponse.statusDraft", { lng: currentLang })}</span>
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
                  {t("recordResponse.title", { lng: currentLang })}
                </h2>
                {getStatusBadge(record.recordStatus)}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {request?.requestCode} -{" "}
                {currentLang === "ar" ? request?.titleAr : request?.titleEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={t("recordResponse.print", { lng: currentLang })}
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
                <span>
                  {t("recordResponse.targetEntity", { lng: currentLang })}
                </span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">
                {record.targetName}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {record.targetId}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {t("recordResponse.userRegion", { lng: currentLang })}
                </span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">
                {record.userName || "-"}
              </div>
              <div className="text-[10px] font-mono text-purple-700">
                #{record.assignedRegionNo || record.regionNo || "-"}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <Building className="w-3.5 h-3.5 text-purple-600" />
                <span>{t("recordResponse.branch", { lng: currentLang })}</span>
              </div>
              <div className="text-xs font-black text-slate-900 truncate">
                {record.branchName || "-"}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {record.branchId || "-"}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {t("recordResponse.submissionDate", { lng: currentLang })}
                </span>
              </div>
              <div className="text-xs font-black text-slate-900">
                {record.submittedAt || record.updatedAt
                  ? new Date(
                      record.submittedAt || record.updatedAt,
                    ).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-[10px] text-slate-400">
                {record.submittedAt || record.updatedAt
                  ? new Date(
                      record.submittedAt || record.updatedAt,
                    ).toLocaleTimeString()
                  : ""}
              </div>
            </div>
          </div>

          {/* Form Fields Responses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>
                  {t("recordResponse.responsesHeading", { lng: currentLang })}
                </span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {t("recordResponse.fieldsDefined", {
                  count: fields.length,
                  lng: currentLang,
                })}
              </span>
            </div>

            {fields.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                {t("recordResponse.noFields", { lng: currentLang })}
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
                            {currentLang === "ar"
                              ? field.fieldLabelAr
                              : field.fieldLabelEn}
                          </span>
                          {field.isRequired && (
                            <span
                              className="text-rose-500 font-bold text-xs"
                              title="مطلوب / Required"
                            >
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
                          {currentLang === "ar"
                            ? field.helpTextAr
                            : field.helpTextEn}
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
                <span>
                  {t("recordResponse.extraData", { lng: currentLang })}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extraEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <span className="font-mono text-[10px] text-slate-500 block mb-1">
                      {key}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val)}
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
            {t("recordResponse.recordId", { lng: currentLang })}{" "}
            {record.recordId}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {t("recordResponse.close", { lng: currentLang })}
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
              {t("recordResponse.closePreview", { lng: currentLang })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
