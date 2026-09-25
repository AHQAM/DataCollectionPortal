import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Smartphone,
  User as UserIcon,
  FileText,
} from "lucide-react";

export const AdminAuditLogs: React.FC = () => {
  const { lang, t, auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  const filteredLogs = auditLogs.filter((l) => {
    if (actionFilter !== "ALL" && l.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = l.userName.toLowerCase().includes(q);
      const matchEntity =
        l.entityType.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q);
      const matchAction = l.action.toLowerCase().includes(q);
      if (!matchUser && !matchEntity && !matchAction) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <span>
              {t("auto.securityAuditTrail")}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("auto.tamperevidentLogsOfSystem")}
          </p>
        </div>

        <span className="text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl">
          {auditLogs.length}{" "}
          {t("auto.loggedOperations")}
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              t("auto.searchLogs")
            }
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700"
        >
          <option value="ALL">
            {t("auto.allActions")}
          </option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="DEVICE_BOUND">DEVICE_BOUND</option>
          <option value="DEVICE_RELEASED">DEVICE_RELEASED</option>
          <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
          <option value="PASSWORD_RESET_ADMIN">PASSWORD_RESET_ADMIN</option>
          <option value="REQUEST_CREATED">REQUEST_CREATED</option>
          <option value="REQUEST_PUBLISHED">REQUEST_PUBLISHED</option>
          <option value="RECORDS_IMPORTED">RECORDS_IMPORTED</option>
          <option value="RECORD_SUBMITTED">RECORD_SUBMITTED</option>
          <option value="RECORD_REASSIGNED">RECORD_REASSIGNED</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">
                  {t("auto.timestamp")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("auto.user")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("auto.action")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("auto.targetEntity")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("auto.deviceUuid")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("auto.details")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                return (
                  <tr
                    key={log.logId}
                    className="hover:bg-slate-50/80 transition-all font-mono text-[11px]"
                  >
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(
                        t("auto.enus"),
                      )}
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900 font-sans">
                      {log.userName}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-50 text-purple-900 border border-purple-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {log.entityType} #{log.entityId}
                    </td>

                    <td className="px-4 py-3 text-slate-500 truncate max-w-[120px]">
                      {log.deviceBindingId || log.deviceId
                        ? (log.deviceBindingId || log.deviceId)!.substring(
                            0,
                            16,
                          ) + "..."
                        : "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-600 font-sans max-w-xs truncate">
                      {log.detailsJson || JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
