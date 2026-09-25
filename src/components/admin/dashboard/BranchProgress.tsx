import React from "react";
import { Building, ArrowUpRight } from "lucide-react";
import { Branch } from "../../../types";

interface BranchStat {
  branch: Branch;
  total: number;
  completed: number;
  pct: number;
}

interface BranchProgressProps {
  lang: "ar" | "en";
  onNavigate: (module: string) => void;
  branchStats: BranchStat[];
}

export const BranchProgress: React.FC<BranchProgressProps> = ({
  lang,
  onNavigate,
  branchStats,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-extrabold text-sm text-slate-900">
            {lang === "ar"
              ? "نسبة الإنجاز وتوزيع السجلات حسب الفرع"
              : "Completion by Branch"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "ar"
              ? "مقارنة تقدم العمل في الفروع الرئيسية الثلاثة"
              : "Comparative performance across 3 operating branches"}
          </p>
        </div>
        <button
          onClick={() => onNavigate("reports")}
          className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
        >
          <span>{lang === "ar" ? "التقارير التفصيلية" : "View Reports"}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {branchStats.map(({ branch, total, completed, pct }) => (
          <div
            key={branch.branchId}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-xs text-slate-900">
                  {lang === "ar" ? branch.branchNameAr : branch.branchNameEn}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                {completed} / {total} {lang === "ar" ? "سجل" : "records"} ({pct}
                %)
              </div>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct >= 75
                    ? "bg-emerald-500"
                    : pct >= 40
                      ? "bg-purple-800"
                      : "bg-amber-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
