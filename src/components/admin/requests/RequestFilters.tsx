import React from "react";
import { useTranslation } from "react-i18next";
import { Search, Building, UserCheck } from "lucide-react";
import { Branch } from "../../../types";

interface RequestFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  creatorFilter?: "ALL" | "ADMIN" | "SUPERVISOR";
  setCreatorFilter?: (val: "ALL" | "ADMIN" | "SUPERVISOR") => void;
  branchFilter?: string;
  setBranchFilter?: (val: string) => void;
  branches?: Branch[];
  isAdmin?: boolean;
  lang: "ar" | "en";
  onAddRequest: () => void;
}

export const RequestFilters: React.FC<RequestFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  creatorFilter = "ALL",
  setCreatorFilter,
  branchFilter = "ALL",
  setBranchFilter,
  branches = [],
  isAdmin = false,
  lang,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const tabs = [
    { key: "ALL", label: t("requests.tabAll", { lng: currentLang }) },
    { key: "Draft", label: t("requests.tabDraft", { lng: currentLang }) },
    {
      key: "Published",
      label: t("requests.tabPublished", { lng: currentLang }),
    },
    { key: "Closed", label: t("requests.tabClosed", { lng: currentLang }) },
    {
      key: "Archived",
      label: t("requests.tabArchived", { lng: currentLang }),
    },
  ];

  const creatorTabs = [
    {
      key: "ALL" as const,
      label: currentLang === "ar" ? "جميع الطلبات" : "All Requests",
    },
    {
      key: "ADMIN" as const,
      label: currentLang === "ar" ? "طلباتي (الإدارة)" : "My Requests (Admin)",
    },
    {
      key: "SUPERVISOR" as const,
      label: currentLang === "ar" ? "طلبات المشرفين" : "Supervisor Requests",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Admin Creator Scope & Branch Selectors */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 me-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>{currentLang === "ar" ? "مصدر الطلب:" : "Source:"}</span>
            </span>
            {creatorTabs.map((ct) => (
              <button
                key={ct.key}
                type="button"
                onClick={() => setCreatorFilter && setCreatorFilter(ct.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  creatorFilter === ct.key
                    ? "bg-purple-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {branches.length > 0 && setBranchFilter && (
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                <option value="ALL">
                  {currentLang === "ar" ? "جميع الفروع" : "All Branches"}
                </option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {currentLang === "ar"
                      ? b.branchNameAr
                      : b.branchNameEn || b.branchNameAr}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Main Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200/80 text-slate-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full ps-10 p-2 shadow-xs transition-all"
            placeholder={t("requests.searchPlaceholder", { lng: currentLang })}
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                statusFilter === tab.key
                  ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                  : "bg-transparent text-slate-600 border-transparent hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
