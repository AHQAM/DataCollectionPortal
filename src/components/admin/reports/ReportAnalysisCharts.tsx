import React from "react";
import { useTranslation } from "react-i18next";
import { PieChart, BarChart3 } from "lucide-react";
import { RequestField } from "../../../types";

interface Props {
  lang: string;
  totalCount: number;
  submittedCount: number;
  completedCount: number;
  draftCount: number;
  pendingCount: number;
  responsesReceivedCount: number;
  completionRate: number;
  choiceFields: RequestField[];
  activeAnalysisField: RequestField | undefined;
  selectedAnalysisFieldKey: string;
  setSelectedAnalysisFieldKey: (val: string) => void;
  dynamicFieldCounts: Record<string, number>;
}

export const ReportAnalysisCharts: React.FC<Props> = ({
  lang,
  totalCount,
  submittedCount,
  completedCount,
  draftCount,
  pendingCount,
  responsesReceivedCount,
  completionRate,
  choiceFields,
  activeAnalysisField,
  selectedAnalysisFieldKey,
  setSelectedAnalysisFieldKey,
  dynamicFieldCounts,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
          <span className="text-[11px] font-bold text-purple-700 block mb-1">
            {t("reports.charts.totalRecords", { lng: currentLang })}
          </span>
          <div className="text-xl font-black text-purple-950">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold">
              {submittedCount + completedCount}{" "}
              {t("reports.charts.done", { lng: currentLang })}
            </span>
            <span>•</span>
            <span className="text-amber-700">
              {draftCount} {t("reports.charts.draft", { lng: currentLang })}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-700 block mb-1">
            {t("reports.charts.responsesReceived", { lng: currentLang })}
          </span>
          <div className="text-xl font-black text-emerald-950">
            {responsesReceivedCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {t("reports.charts.outOfRecords", {
              total: totalCount,
              lng: currentLang,
            })}
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
          <span className="text-[11px] font-bold text-blue-700 block mb-1">
            {t("reports.charts.completionRate", { lng: currentLang })}
          </span>
          <div className="text-xl font-black text-blue-950">
            {completionRate}%
          </div>
          <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block mb-1">
            {t("reports.charts.formFields", { lng: currentLang })}
          </span>
          <div className="text-xl font-black text-slate-900">
            {choiceFields.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {t("reports.charts.customFields", { lng: currentLang })}
          </div>
        </div>
      </div>

      {/* Dynamic Field Breakdown Section */}
      {choiceFields.length > 0 ? (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-700" />
              <h2 className="font-extrabold text-xs text-slate-900">
                {t("reports.charts.fieldDistribution", { lng: currentLang })}
              </h2>
            </div>

            {choiceFields.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold">
                  {t("reports.charts.field", { lng: currentLang })}
                </span>
                <select
                  value={selectedAnalysisFieldKey}
                  onChange={(e) => setSelectedAnalysisFieldKey(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-slate-300 font-semibold bg-white text-xs text-slate-800"
                >
                  {choiceFields.map((f) => (
                    <option key={f.fieldKey} value={f.fieldKey}>
                      {currentLang === "ar" ? f.fieldLabelAr : f.fieldLabelEn}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {Object.keys(dynamicFieldCounts).length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              {t("reports.charts.noResponsesYet", {
                field:
                  currentLang === "ar"
                    ? activeAnalysisField?.fieldLabelAr
                    : activeAnalysisField?.fieldLabelEn,
                lng: currentLang,
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              {Object.entries(dynamicFieldCounts).map(([optVal, count]) => {
                const optMatch = activeAnalysisField?.options?.find(
                  (o) => o.value === optVal || o.id === optVal,
                );
                const displayLabel = optMatch
                  ? currentLang === "ar"
                    ? optMatch.labelAr
                    : optMatch.labelEn
                  : optVal === "true"
                    ? t("reports.charts.yes", { lng: currentLang })
                    : optVal === "false"
                      ? t("reports.charts.no", { lng: currentLang })
                      : optVal;

                const percent = Math.round(
                  (count / (responsesReceivedCount || 1)) * 100,
                );

                return (
                  <div
                    key={optVal}
                    className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 flex items-center justify-between"
                  >
                    <div className="truncate me-2">
                      <span className="font-bold text-purple-950 block truncate">
                        {displayLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {percent}%
                      </span>
                    </div>
                    <span className="text-base font-black text-purple-900 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-2xs">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* If no choice fields, show Status Distribution */
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-700" />
            <h2 className="font-extrabold text-xs text-slate-900">
              {t("reports.charts.statusDistribution", { lng: currentLang })}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
              <span className="font-bold text-emerald-900">
                {t("reports.charts.submitted", { lng: currentLang })}
              </span>
              <span className="font-black text-emerald-800">
                {submittedCount}
              </span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
              <span className="font-bold text-blue-900">
                {t("reports.charts.completed", { lng: currentLang })}
              </span>
              <span className="font-black text-blue-800">{completedCount}</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex justify-between items-center">
              <span className="font-bold text-amber-900">
                {t("reports.charts.draftStatus", { lng: currentLang })}
              </span>
              <span className="font-black text-amber-800">{draftCount}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700">
                {t("reports.charts.pending", { lng: currentLang })}
              </span>
              <span className="font-black text-slate-800">{pendingCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
