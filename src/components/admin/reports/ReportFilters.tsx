import React from "react";
import { Search } from "lucide-react";
import { Branch, RequestItem } from "../../../types";
import i18n from "../../../i18n";

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
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {i18n.t("auto.requestCampaign")}
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
              {r.requestCode} - {lang === "ar" ? r.titleAr : r.titleEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {i18n.t("auto.branch")}
        </label>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          <option value="ALL">
            {i18n.t("auto.allBranches")}
          </option>
          {branches.map((b) => (
            <option key={b.branchId} value={b.branchId}>
              {lang === "ar" ? b.branchNameAr : b.branchNameEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {i18n.t("auto.recordStatus")}
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          <option value="ALL">
            {i18n.t("auto.allStatuses")}
          </option>
          <option value="Submitted">
            {i18n.t("auto.submitted")}
          </option>
          <option value="Completed">
            {i18n.t("auto.completed1")}
          </option>
          <option value="DraftSaved">
            {i18n.t("auto.draftSaved")}
          </option>
          <option value="Pending">{i18n.t("auto.pending")}</option>
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {i18n.t("auto.searchRecordUser")}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              i18n.t("auto.searchByNameOr")
            }
            className="w-full h-10 px-3 ps-8 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-xs font-semibold"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-3" />
        </div>
      </div>
    </div>
  );
};
