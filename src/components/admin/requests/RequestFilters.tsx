import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

interface RequestFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  lang: "ar" | "en";
  onAddRequest: () => void;
}

export const RequestFilters: React.FC<RequestFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
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

  return (
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
  );
};
