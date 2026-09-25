import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { Layers, Search, ArrowRightLeft, X } from "lucide-react";

export const AdminAssignments: React.FC = () => {
  const { requests, records, users, branches, reassignRecord } = useApp();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as "ar" | "en") || "ar";

  const [selectedReqId, setSelectedReqId] = useState<string>(
    requests.length > 0 ? requests[0].requestId : "",
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reassignModalRecord, setReassignModalRecord] = useState<any | null>(
    null,
  );
  const [targetRepId, setTargetRepId] = useState<string>("");
  const [reassignReason, setReassignReason] = useState<string>("");

  const repUsers = users.filter((u) => u.role === "REP");

  const activeReq = requests.find((r) => r.requestId === selectedReqId);
  const targetEntityLabel =
    (currentLang === "ar"
      ? activeReq?.targetEntityLabelAr
      : activeReq?.targetEntityLabelEn) || t("assignments.defaultTargetEntity");

  // Filter records by request, branch, search
  const filteredRecords = records.filter((r) => {
    if (selectedReqId && r.requestId !== selectedReqId) return false;
    if (selectedBranchId !== "ALL" && r.branchId !== selectedBranchId)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCust =
        r.targetName.toLowerCase().includes(q) ||
        r.targetId.toLowerCase().includes(q);
      const matchRep =
        r.userName.toLowerCase().includes(q) || r.assignedRegionNo.includes(q);
      if (!matchCust && !matchRep) return false;
    }
    return true;
  });

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalRecord || !targetRepId) return;

    const targetUser = users.find((u) => u.userId === targetRepId);
    if (!targetUser) return;

    reassignRecord(
      reassignModalRecord.recordId,
      targetUser.userId,
      reassignReason,
    );

    setReassignModalRecord(null);
    setReassignReason("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-700" />
            <span>{t("assignments.title")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("assignments.subtitle")}
          </p>
        </div>

        {/* Request selector */}
        <div className="w-full sm:w-72">
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600"
          >
            {requests.map((r) => (
              <option key={r.requestId} value={r.requestId}>
                {r.requestCode} - {currentLang === "ar" ? r.titleAr : r.titleEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("assignments.searchPlaceholder", {
              entity: targetEntityLabel,
            })}
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700"
          >
            <option value="ALL">{t("assignments.allBranches")}</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {currentLang === "ar" ? b.branchNameAr : b.branchNameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">{targetEntityLabel}</th>
                <th className="px-4 py-3 text-start">
                  {t("assignments.thRegion")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("assignments.thAssignedUser")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("assignments.thBranch")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("assignments.thArea")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("assignments.thStatus")}
                </th>
                <th className="px-4 py-3 text-center">
                  {t("assignments.thReassign")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const isCompleted = r.recordStatus === "Completed";

                return (
                  <tr
                    key={r.recordId}
                    className="hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">
                        {r.targetName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.targetId} • {r.area || "الرياض"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-purple-900 bg-purple-50 border border-purple-200">
                        #{r.assignedRegionNo}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {r.userName}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {r.branchName}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {r.area || "-"}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : r.recordStatus === "DraftSaved"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isCompleted
                          ? t("assignments.statusCompleted")
                          : r.recordStatus === "DraftSaved"
                            ? t("assignments.statusDraft")
                            : t("assignments.statusPending")}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {!isCompleted ? (
                        <button
                          onClick={() => {
                            setReassignModalRecord(r);
                            setTargetRepId(repUsers[0]?.userId || "");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-200 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{t("assignments.reassignBtn")}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {t("assignments.locked")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModalRecord && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                {t("assignments.modalTitle")}
              </h3>
              <button
                onClick={() => setReassignModalRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mb-3 space-y-1">
              <div className="font-bold text-slate-900">
                {reassignModalRecord.targetName}
              </div>
              <div className="text-[11px] text-slate-500">
                {t("assignments.currentUser", {
                  name: reassignModalRecord.userName,
                  region: reassignModalRecord.assignedRegionNo,
                })}
              </div>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("assignments.targetUserLabel")}
                </label>
                <select
                  value={targetRepId}
                  onChange={(e) => setTargetRepId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white"
                  required
                >
                  {repUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {currentLang === "ar"
                        ? u.userNameAr
                        : u.userNameEn || u.userNameAr}{" "}
                      - #{u.regionNo} (
                      {currentLang === "ar"
                        ? u.branchNameAr
                        : u.branchNameEn || u.branchNameAr}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t("assignments.reasonLabel")}
                </label>
                <textarea
                  rows={2}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder={t("assignments.reasonPlaceholder")}
                  className="w-full p-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModalRecord(null)}
                  className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t("assignments.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold"
                >
                  {t("assignments.confirmReassign")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
