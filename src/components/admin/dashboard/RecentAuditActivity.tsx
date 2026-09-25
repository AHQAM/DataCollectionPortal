import React from "react";
import { AuditLog } from "../../../types";
import i18n from "../../../i18n";

interface RecentAuditActivityProps {
  lang: "ar" | "en";
  onNavigate: (module: string) => void;
  auditLogs: AuditLog[];
}

export const RecentAuditActivity: React.FC<RecentAuditActivityProps> = ({
  lang,
  onNavigate,
  auditLogs,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-700 animate-pulse" />
          <h2 className="font-extrabold text-sm text-slate-900">
            {i18n.t("auto.recentFieldAuditActivity")}
          </h2>
        </div>
        <button
          onClick={() => onNavigate("audit")}
          className="text-xs text-purple-700 hover:text-purple-900 font-bold"
        >
          {i18n.t("auto.fullAuditTrail")}
        </button>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {auditLogs.slice(0, 4).map((log) => (
          <div
            key={log.logId}
            className="py-2.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                {log.action}
              </span>
              <span className="font-bold text-slate-800">{log.userName}</span>
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                {log.entityType} #{log.entityId}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
