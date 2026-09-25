import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Branch, RequestItem } from "../../../types";

interface Props {
  lang: string;
  requests: RequestItem[];
  branches: Branch[];
  selectedReqId: string;
  setSelectedReqId: (val: string) => void;
  selectedBranchId: string;
  setSelectedBranchId: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  setSelectedAnalysisFieldKey: (val: string) => void;
}

export const ReportFilters: React.FC<Props> = ({
  lang,
  requests,
  branches,
  selectedReqId,
  setSelectedReqId,
  selectedBranchId,
  setSelectedBranchId,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  setSelectedAnalysisFieldKey,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {t("reports.filters.campaign", { lng: currentLang })}
        </label>
        <select
          value={selectedReqId}
          onChange={(e) => {
            setSelectedReqId(e.target.value);
            setSelectedAnalysisFieldKey("");
          }}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          {requests.map((r) => (
            <option key={r.requestId} value={r.requestId}>
              {r.requestCode} - {currentLang === "ar" ? r.titleAr : r.titleEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {t("reports.filters.branch", { lng: currentLang })}
        </label>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          <option value="ALL">
            {t("reports.filters.allBranches", { lng: currentLang })}
          </option>
          {branches.map((b) => (
            <option key={b.branchId} value={b.branchId}>
              {currentLang === "ar" ? b.branchNameAr : b.branchNameEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {t("reports.filters.recordStatus", { lng: currentLang })}
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          <option value="ALL">
            {t("reports.filters.allStatuses", { lng: currentLang })}
          </option>
          <option value="Submitted">
            {t("reports.filters.submitted", { lng: currentLang })}
          </option>
          <option value="Completed">
            {t("reports.filters.completed", { lng: currentLang })}
          </option>
          <option value="DraftSaved">
            {t("reports.filters.draftSaved", { lng: currentLang })}
          </option>
          <option value="Pending">
            {t("reports.filters.pending", { lng: currentLang })}
          </option>
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {t("reports.filters.searchLabel", { lng: currentLang })}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("reports.filters.searchPlaceholder", {
              lng: currentLang,
            })}
            className="w-full h-10 px-3 ps-8 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-xs font-semibold"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-3" />
        </div>
      </div>
    </div>
  );
};
