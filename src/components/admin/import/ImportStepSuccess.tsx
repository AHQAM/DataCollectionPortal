import React from "react";
import { RequestItem, User } from "../../../types";
import { CheckCircle2, Smartphone } from "lucide-react";

interface Props {
  lang: string;
  currentRequest?: RequestItem;
  importStats: { total: number; created: number } | null;
  validRows: Record<string, any>[];
  systemColMap: Record<string, string>;
  users: User[];
  quickSwitchUser: (userId: string) => void;
  onBack: () => void;
  onReset: () => void;
}

export const ImportStepSuccess: React.FC<Props> = ({
  lang,
  currentRequest,
  importStats,
  validRows,
  systemColMap,
  users,
  quickSwitchUser,
  onBack,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h2 className="text-lg font-extrabold text-slate-900">
        {lang === "ar"
          ? "تم استيراد السجلات وتوزيعها على المناديب بنجاح!"
          : "Import & Assignment Completed!"}
      </h2>

      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
        {lang === "ar"
          ? `تم اعتماد وحفظ ${importStats?.created || validRows.length} سجل وتوزيعها فورياً على مناطق المناديب في حملة "${currentRequest?.titleAr}". البيانات متاحة الآن في تطبيق الهاتف والحقول المعتمدة تظهر للعرض فقط.`
          : `${importStats?.created || validRows.length} records successfully imported and assigned to regional representatives.`}
      </p>

      <div className="pt-3 flex flex-wrap justify-center gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          {lang === "ar" ? "الرجوع لقائمة الطلبات" : "Go to Requests"}
        </button>

        {import.meta.env.DEV && (
          <button
            onClick={() => {
              const firstValidReg = validRows[0]?.[systemColMap.regionNo];
              const rep = users.find(
                (u) =>
                  u.regionNo === firstValidReg ||
                  u.allowedRegionNos?.includes(firstValidReg),
              );
              if (rep) {
                quickSwitchUser(rep.userId);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {lang === "ar"
                ? "فتح واجهة الهاتف لمعاينة السجلات والمطابقة"
                : "Preview in Mobile View"}
            </span>
          </button>
        )}

        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
        >
          {lang === "ar" ? "استيراد ملف إكسل آخر" : "Import Another File"}
        </button>
      </div>
    </div>
  );
};
