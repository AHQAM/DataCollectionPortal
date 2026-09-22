import React from "react";
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
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {lang === "ar" ? "الطلب / الحملة" : "Request Campaign"}
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
          {lang === "ar" ? "الفرع" : "Branch"}
        </label>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          <option value="ALL">
            {lang === "ar" ? "جميع الفروع" : "All Branches"}
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
          {lang === "ar" ? "حالة السجل" : "Record Status"}
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
        >
          <option value="ALL">
            {lang === "ar" ? "جميع الحالات" : "All Statuses"}
          </option>
          <option value="Submitted">
            {lang === "ar" ? "تم الإرسال" : "Submitted"}
          </option>
          <option value="Completed">
            {lang === "ar" ? "مكتمل" : "Completed"}
          </option>
          <option value="DraftSaved">
            {lang === "ar" ? "مسودة محفوظة" : "Draft Saved"}
          </option>
          <option value="Pending">{lang === "ar" ? "معلق" : "Pending"}</option>
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">
          {lang === "ar" ? "بحث بالسجل أو المستخدم" : "Search Record / User"}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث بالاسم أو الكود..."
                : "Search by name or code..."
            }
            className="w-full h-10 px-3 ps-8 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-xs font-semibold"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-3" />
        </div>
      </div>
    </div>
  );
};
