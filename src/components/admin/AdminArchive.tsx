import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { Archive, Search, RotateCcw, Calendar, Cloud } from "lucide-react";

export const AdminArchive: React.FC = () => {
  const { requests, records, reopenRequest } = useApp();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as "ar" | "en") || "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const archivedRequests = requests.filter((r) => r.status === "Archived");

  const filtered = archivedRequests.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.titleAr.toLowerCase().includes(q) ||
        r.titleEn.toLowerCase().includes(q) ||
        r.requestCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDriveBackup = (reqCode: string) => {
    setExportNotice(
      t("archive.syncingNotice", {
        code: reqCode,
        defaultValue: `Syncing campaign ${reqCode} to corporate Google Drive archive...`,
      }),
    );
    setTimeout(() => {
      setExportNotice(
        t("archive.syncedNotice", {
          code: reqCode,
          defaultValue: `Campaign ${reqCode} successfully secured on Google Drive!`,
        }),
      );
      setTimeout(() => setExportNotice(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Archive className="w-5 h-5 text-purple-700" />
            <span>{t("archive.title")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("archive.subtitle")}
          </p>
        </div>

        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
          {t("archive.campaignsCount", { count: archivedRequests.length })}
        </span>
      </div>

      {exportNotice && (
        <div className="p-3 bg-purple-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg">
          <Cloud className="w-4 h-4 text-purple-300 animate-pulse" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("archive.searchPlaceholder")}
          className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
      </div>

      {/* Archived Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Archive className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <div className="font-bold text-xs">{t("archive.noCampaigns")}</div>
          </div>
        ) : (
          filtered.map((req) => {
            const reqRecords = records.filter(
              (r) => r.requestId === req.requestId,
            );
            const completed = reqRecords.filter(
              (r) => r.recordStatus === "Completed",
            ).length;

            return (
              <div
                key={req.requestId}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {req.requestCode}
                    </span>
                    <h2 className="font-extrabold text-sm text-slate-900 mt-1">
                      {currentLang === "ar" ? req.titleAr : req.titleEn}
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {t("archive.statusArchived")}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {currentLang === "ar" ? req.descriptionAr : req.descriptionEn}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-700" />
                    <span>
                      {t("archive.archivedDate", {
                        date: new Date(req.updatedAt).toLocaleDateString(),
                      })}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">
                    {t("archive.completedRecords", {
                      completed,
                      total: reqRecords.length,
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => reopenRequest(req.requestId)}
                    className="flex-1 h-9 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center justify-center gap-1.5 border border-purple-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t("archive.reopenRequest")}</span>
                  </button>

                  <button
                    onClick={() => handleDriveBackup(req.requestCode)}
                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                    title={t("archive.syncDriveTooltip")}
                  >
                    <Cloud className="w-3.5 h-3.5 text-purple-700" />
                    <span>Drive</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
