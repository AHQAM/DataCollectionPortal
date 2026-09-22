import React from "react";
import { FileText, TrendingUp, Layers, ShieldCheck } from "lucide-react";
import { User } from "../../../types";

interface KpiCardsGridProps {
  lang: "ar" | "en";
  activeRequests: number;
  draftRequests: number;
  overallPercentage: number;
  totalAssignedRecords: number;
  completedRecords: number;
  pendingRecords: number;
  users: User[];
  lockedUsersCount: number;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({
  lang,
  activeRequests,
  draftRequests,
  overallPercentage,
  totalAssignedRecords,
  completedRecords,
  pendingRecords,
  users,
  lockedUsersCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Requests */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold">
            {lang === "ar" ? "الطلبات النشطة" : "Active Campaigns"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {activeRequests}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <span className="font-bold text-purple-700">{draftRequests}</span>
          <span>{lang === "ar" ? "مسودة قيد الإعداد" : "in draft"}</span>
        </div>
      </div>

      {/* Overall Completion Percentage */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold">
            {lang === "ar" ? "نسبة الإنجاز الكلية" : "Overall Completion"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {overallPercentage}%
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Total Assigned Records */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold">
            {lang === "ar" ? "إجمالي السجلات" : "Total Records"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {totalAssignedRecords}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <span className="font-bold text-emerald-600">
            {completedRecords} مكتمل
          </span>
          <span>•</span>
          <span className="font-bold text-amber-600">
            {pendingRecords} معلق
          </span>
        </div>
      </div>

      {/* Security & Lockouts */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold">
            {lang === "ar" ? "حالة أمان الحسابات" : "Security & Access"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">
          {users.filter((u) => u.role === "REP").length}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <span>
            {lang === "ar" ? "مستخدم معتمد" : "authorized users"}
          </span>
          {lockedUsersCount > 0 && (
            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
              {lockedUsersCount} مقفل
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
