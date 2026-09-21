import React from "react";
import { Search, Filter, Plus } from "lucide-react";

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
  onAddRequest,
}) => {
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
          placeholder={
            lang === "ar" ? "بحث بالاسم، الرمز..." : "Search by title, code..."
          }
        />
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200 overflow-x-auto hide-scrollbar">
        {[
          { key: "ALL", labelAr: "الكل", labelEn: "All" },
          { key: "Draft", labelAr: "مسودات", labelEn: "Drafts" },
          { key: "Published", labelAr: "منشورة", labelEn: "Published" },
          { key: "Closed", labelAr: "مغلقة", labelEn: "Closed" },
          { key: "Archived", labelAr: "المؤرشفة", labelEn: "Archived" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
              statusFilter === tab.key
                ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                : "bg-transparent text-slate-600 border-transparent hover:bg-slate-200/50"
            }`}
          >
            {lang === "ar" ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
};
