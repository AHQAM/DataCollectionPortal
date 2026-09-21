import React from "react";
import { Building2, MapPin, Filter, Search } from "lucide-react";
import { Branch, Region } from "../../../types";

interface BranchesTabsAndFiltersProps {
  lang: "ar" | "en";
  activeTab: "branches" | "regions";
  setActiveTab: (tab: "branches" | "regions") => void;
  branches: Branch[];
  regions: Region[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const BranchesTabsAndFilters: React.FC<BranchesTabsAndFiltersProps> = ({
  lang,
  activeTab,
  setActiveTab,
  branches,
  regions,
  selectedBranchId,
  setSelectedBranchId,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "branches"
              ? "bg-white text-purple-950 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>
            {lang === "ar" ? "قائمة الفروع" : "Branches"} ({branches.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("regions")}
          className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "regions"
              ? "bg-white text-purple-950 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>
            {lang === "ar" ? "المناطق الميدانية" : "Field Regions"} (
            {regions.length})
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {activeTab === "regions" && (
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-hidden"
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
        )}

        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث بالاسم أو الرمز..."
                : "Search by name or code..."
            }
            className="w-full h-9 ps-8 pe-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-purple-600 bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
};
