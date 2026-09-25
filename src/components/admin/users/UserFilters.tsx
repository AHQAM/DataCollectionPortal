import React from "react";
import { Search, UserPlus, FileSpreadsheet } from "lucide-react";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  lang: "ar" | "en";
  onShowImportModal: () => void;
  onShowCreateModal: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  lang,
  onShowImportModal,
  onShowCreateModal,
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-purple-700">👤</span>
            <span>
              {lang === "ar" ? "إدارة المستخدمين" : "User Management"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "ar"
              ? "إدارة صلاحيات الدخول، تعيين المناطق المتعددة، إعادة تعيين كلمات المرور وفك ارتباط الأجهزة"
              : "User accounts, multi-region assignments, PIN reset, and device unbinding"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onShowImportModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {lang === "ar"
                ? "استيراد المستخدمين من Excel"
                : "Import from Excel"}
            </span>
          </button>

          <button
            onClick={onShowCreateModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === "ar" ? "إضافة مستخدم يدوي" : "Add User"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث باسم المستخدم، رقم المنطقة..."
                : "Search by user name, region..."
            }
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
        </div>

        <div className="flex gap-1.5 text-xs">
          {[
            { key: "ALL", labelAr: "الكل", labelEn: "All" },
            {
              key: "REP",
              labelAr: "المستخدمين الميدانيين",
              labelEn: "Field Users",
            },
            { key: "SUPERVISOR", labelAr: "المشرفين", labelEn: "Supervisors" },
            { key: "ADMIN", labelAr: "المدراء", labelEn: "Admins" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                roleFilter === tab.key
                  ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {lang === "ar" ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
