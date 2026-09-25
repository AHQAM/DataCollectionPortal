import React, { useState } from "react";
import { X, Building, Check } from "lucide-react";
import { Branch, Region, RequestType, RequestPriority } from "../../../types";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  regions: Region[];
  lang: string;
  defaultCode: string;
  onSubmit: (data: {
    requestCode: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    priority: RequestPriority;
    requestType: RequestType;
    targetEntityLabelAr?: string;
    targetEntityLabelEn?: string;
    dueAt: string;
    targetBranches: string[];
    targetRegions: string[];
    allowEditAfterSubmit: boolean;
    requireSupervisorApproval: boolean;
  }) => Promise<void>;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  branches,
  regions,
  lang,
  defaultCode,
  onSubmit,
}) => {
  const [newTitleAr, setNewTitleAr] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newDescAr, setNewDescAr] = useState("");
  const [newDescEn, setNewDescEn] = useState("");
  const [newPriority, setNewPriority] = useState<RequestPriority>("Normal");
  const [newType, setNewType] = useState<RequestType>("per_record");
  const [newTargetEntityLabelAr, setNewTargetEntityLabelAr] = useState("");
  const [newTargetEntityLabelEn, setNewTargetEntityLabelEn] = useState("");
  const [newDueAt, setNewDueAt] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  );
  const [newAllowEdit, setNewAllowEdit] = useState(true);
  const [newRequireSupervisor, setNewRequireSupervisor] = useState(false);
  const [newTargetScope, setNewTargetScope] = useState<"ALL" | "SPECIFIC">(
    "ALL",
  );
  const [newSelectedBranchIds, setNewSelectedBranchIds] = useState<string[]>(
    [],
  );
  const [newSelectedRegionNos, setNewSelectedRegionNos] = useState<string[]>(
    [],
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr.trim()) return;

    await onSubmit({
      requestCode: defaultCode,
      titleAr: newTitleAr.trim(),
      titleEn: newTitleEn.trim() || newTitleAr.trim(),
      descriptionAr: newDescAr,
      descriptionEn: newDescEn || newDescAr,
      priority: newPriority,
      requestType: newType,
      targetEntityLabelAr: newTargetEntityLabelAr.trim() || undefined,
      targetEntityLabelEn: newTargetEntityLabelEn.trim() || undefined,
      dueAt: newDueAt,
      targetBranches: newTargetScope === "ALL" ? [] : newSelectedBranchIds,
      targetRegions: newTargetScope === "ALL" ? [] : newSelectedRegionNos,
      allowEditAfterSubmit: newAllowEdit,
      requireSupervisorApproval: newRequireSupervisor,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="font-extrabold text-sm text-slate-900">
            {lang === "ar"
              ? "إنشاء طلب جديد / نشاط ميداني"
              : "Create New Request / Field Activity"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar" ? "رمز الطلب" : "Request Code"}
              </label>
              <input
                type="text"
                value={defaultCode}
                disabled
                className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar" ? "الأولوية" : "Priority"}
              </label>
              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as RequestPriority)
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              >
                <option value="low">{lang === "ar" ? "منخفضة" : "Low"}</option>
                <option value="medium">
                  {lang === "ar" ? "متوسطة" : "Medium"}
                </option>
                <option value="high">{lang === "ar" ? "عالية" : "High"}</option>
                <option value="urgent">
                  {lang === "ar" ? "حرجة / عاجلة" : "Urgent"}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar"
                ? "عنوان الطلب (بالعربية)"
                : "Request Title (Arabic)"}{" "}
              *
            </label>
            <input
              type="text"
              value={newTitleAr}
              onChange={(e) => setNewTitleAr(e.target.value)}
              placeholder="مثال: استبيان التحقق من توافر الأصناف الرئيسية..."
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar"
                ? "عنوان الطلب (بالإنجليزية - اختياري)"
                : "Request Title (English - Optional)"}
            </label>
            <input
              type="text"
              value={newTitleEn}
              onChange={(e) => setNewTitleEn(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "اختياري - يترك فارغاً إذا لم ترغب به"
                  : "Optional"
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar" ? "نوع الطلب" : "Request Type"}
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as RequestType)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300"
              >
                <option value="per_record">
                  {lang === "ar"
                    ? "استجابة لكل سجل / جهة مستهدفة"
                    : "Per Record / Target Entity"}
                </option>
                <option value="per_rep">
                  {lang === "ar" ? "استجابة واحدة لكل مستخدم" : "Per User"}
                </option>
                <option value="per_region">
                  {lang === "ar" ? "استجابة لكل منطقة" : "Per Region"}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
              </label>
              <input
                type="date"
                value={newDueAt}
                onChange={(e) => setNewDueAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar"
                  ? "تسمية الجهة المستهدفة (بالعربية - اختياري)"
                  : "Target Entity Label (Arabic)"}
              </label>
              <input
                type="text"
                value={newTargetEntityLabelAr}
                onChange={(e) => setNewTargetEntityLabelAr(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "مثال: العميل، المتجر، المدرسة، العيادة..."
                    : "e.g. Customer, Store, School..."
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar"
                  ? "تسمية الجهة المستهدفة (بالإنجليزية - اختياري)"
                  : "Target Entity Label (English)"}
              </label>
              <input
                type="text"
                value={newTargetEntityLabelEn}
                onChange={(e) => setNewTargetEntityLabelEn(e.target.value)}
                placeholder="e.g. Customer, Store, Facility..."
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar"
                ? "التعليمات والإرشادات (بالعربية)"
                : "Instructions (Arabic)"}
            </label>
            <textarea
              rows={2}
              value={newDescAr}
              onChange={(e) => setNewDescAr(e.target.value)}
              placeholder="اكتب تعليمات الزيارة الميدانية وتعبئة النموذج..."
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          {/* Target Scope Selection */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                <Building className="w-4 h-4 text-purple-700" />
                <span>
                  {lang === "ar"
                    ? "نطاق الفروع والمناطق المستهدفة"
                    : "Target Branches & Zones"}
                </span>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="radio"
                    name="newTargetScope"
                    checked={newTargetScope === "ALL"}
                    onChange={() => setNewTargetScope("ALL")}
                    className="text-purple-900"
                  />
                  <span>
                    {lang === "ar"
                      ? "كل الفروع والمناطق"
                      : "All Branches & Zones"}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="radio"
                    name="newTargetScope"
                    checked={newTargetScope === "SPECIFIC"}
                    onChange={() => setNewTargetScope("SPECIFIC")}
                    className="text-purple-900"
                  />
                  <span>
                    {lang === "ar" ? "تحديد فروع ومناطق" : "Specific Branches"}
                  </span>
                </label>
              </div>
            </div>

            {newTargetScope === "SPECIFIC" && (
              <div className="space-y-2 pt-2 border-t border-purple-200/60 animate-in fade-in">
                <div>
                  <div className="font-bold text-slate-600 text-[11px] mb-1">
                    {lang === "ar"
                      ? "اختر الفروع المستهدفة:"
                      : "Select Target Branches:"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {branches.map((b) => {
                      const isSelected = newSelectedBranchIds.includes(
                        b.branchId,
                      );
                      return (
                        <button
                          key={b.branchId}
                          type="button"
                          onClick={() => {
                            setNewSelectedBranchIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== b.branchId)
                                : [...prev, b.branchId],
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border ${
                            isSelected
                              ? "bg-purple-900 text-white border-purple-900 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>
                            {lang === "ar" ? b.branchNameAr : b.branchNameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {newSelectedBranchIds.length > 0 && (
                  <div className="pt-1">
                    <div className="font-bold text-slate-600 text-[11px] mb-1">
                      {lang === "ar"
                        ? "المناطق التابعة للفروع المختارة (اختياري):"
                        : "Regions in Selected Branches:"}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {regions
                        .filter((r) =>
                          newSelectedBranchIds.includes(r.branchId),
                        )
                        .map((r) => {
                          const isRegSelected = newSelectedRegionNos.includes(
                            r.regionNo,
                          );
                          return (
                            <button
                              key={r.regionNo}
                              type="button"
                              onClick={() => {
                                setNewSelectedRegionNos((prev) =>
                                  isRegSelected
                                    ? prev.filter((no) => no !== r.regionNo)
                                    : [...prev, r.regionNo],
                                );
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer border ${
                                isRegSelected
                                  ? "bg-purple-700 text-white border-purple-700"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {r.regionNo} -{" "}
                              {lang === "ar" ? r.regionNameAr : r.regionNameEn}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={newAllowEdit}
                onChange={(e) => setNewAllowEdit(e.target.checked)}
                className="rounded text-purple-900"
              />
              <span>
                {lang === "ar"
                  ? "السماح للمستخدم بتعديل السجل بعد الاعتماد"
                  : "Allow editing after submit"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={newRequireSupervisor}
                onChange={(e) => setNewRequireSupervisor(e.target.checked)}
                className="rounded text-purple-900"
              />
              <span>
                {lang === "ar"
                  ? "يتطلب اعتماد المشرف قبل الإغلاق النهائي"
                  : "Require Supervisor Approval"}
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-2 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold"
            >
              {lang === "ar"
                ? "إنشاء والانتقال لمصمم الحقول"
                : "Create & Open Form Builder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
