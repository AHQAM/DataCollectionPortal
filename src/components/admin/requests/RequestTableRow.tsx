import React from "react";
import { useTranslation } from "react-i18next";
import { RequestItem } from "../../../types";
import {
  Edit,
  Users,
  Sliders,
  FileSpreadsheet,
  Loader2,
  Copy,
  Sparkles,
  Trash2,
} from "lucide-react";

interface RequestTableRowProps {
  req: RequestItem;
  lang: "ar" | "en";
  fieldsCount: number;
  actionLoadingId: string | null;
  onEdit: (req: RequestItem) => void;
  onViewAssignments: (req: RequestItem) => void;
  onOpenFormBuilder: (requestId: string) => void;
  onOpenImportWizard: (requestId: string) => void;
  onPublish: (requestId: string) => void;
  onClose: (requestId: string) => void;
  onArchive: (requestId: string) => void;
  onReopen: (requestId: string) => void;
  onClone: (requestId: string) => void;
  onSaveTemplate: (req: RequestItem) => void;
  onDelete: (req: RequestItem) => void;
  onViewResponses: (req: RequestItem) => void;
}

export const RequestTableRow: React.FC<RequestTableRowProps> = ({
  req,
  lang,
  fieldsCount,
  actionLoadingId,
  onEdit,
  onViewAssignments,
  onOpenFormBuilder,
  onOpenImportWizard,
  onPublish,
  onClose,
  onArchive,
  onReopen,
  onClone,
  onSaveTemplate,
  onDelete,
  onViewResponses,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const entityName =
    currentLang === "ar"
      ? req.targetEntityLabelAr || req.targetEntityLabelEn
      : req.targetEntityLabelEn || req.targetEntityLabelAr;

  return (
    <tr className="hover:bg-slate-50/80 transition-all">
      <td className="px-4 py-3.5">
        <div className="font-extrabold text-slate-900">
          {currentLang === "ar" ? req.titleAr : req.titleEn || req.titleAr}
        </div>
        <div className="text-[11px] text-purple-700 font-mono font-bold mt-0.5">
          {req.requestCode} • {fieldsCount}{" "}
          {t("requests.dynamicFieldsCount", { lng: currentLang })}
        </div>
      </td>

      <td className="px-4 py-3.5">
        <div className="font-semibold text-slate-700">
          {req.requestType === "per_record"
            ? entityName
              ? t("requests.perEntity", {
                  entity: entityName,
                  lng: currentLang,
                })
              : t("requests.perRecord", { lng: currentLang })
            : t("requests.perUser", { lng: currentLang })}
        </div>
        <span
          className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
            req.priority === "Urgent"
              ? "bg-rose-100 text-rose-800"
              : req.priority === "High"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {req.priority}
        </span>
      </td>

      <td className="px-4 py-3.5 text-slate-600 font-mono">
        {new Date(req.dueAt).toLocaleDateString(
          currentLang === "ar" ? "ar-SA" : "en-US",
        )}
      </td>

      <td className="px-4 py-3.5">
        <span className="font-bold text-slate-800">{req.totalRecords}</span>
        <span className="text-[10px] text-slate-400 block">
          {t("requests.assignmentsCount", {
            count: req.totalAssignments,
            lng: currentLang,
          })}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <span
          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
            req.status === "Published"
              ? "bg-emerald-100 text-emerald-800"
              : req.status === "Draft"
                ? "bg-amber-100 text-amber-800"
                : req.status === "Archived"
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-100 text-slate-600"
          }`}
        >
          {req.status}
        </span>
      </td>

      <td className="px-4 py-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            disabled={actionLoadingId !== null}
            onClick={() => onEdit(req)}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("requests.editScopeTitle", { lng: currentLang })}
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onViewAssignments(req)}
            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("requests.viewAssignmentsTitle", { lng: currentLang })}
          >
            <Users className="w-3.5 h-3.5" />
          </button>

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onOpenFormBuilder(req.requestId)}
            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("requests.formBuilderTitle", { lng: currentLang })}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onOpenImportWizard(req.requestId)}
            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 flex items-center gap-1 text-[11px] shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("requests.importExcelActionTitle", { lng: currentLang })}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t("requests.excelBtn", { lng: currentLang })}</span>
          </button>

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onViewResponses(req)}
            className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold border border-sky-300 flex items-center gap-1 text-[11px] shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("requests.viewRecordsTitle", { lng: currentLang })}
          >
            <span>{t("requests.recordsBtn", { lng: currentLang })}</span>
          </button>

          {req.status === "Draft" && (
            <button
              disabled={actionLoadingId !== null}
              onClick={() => onPublish(req.requestId)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoadingId === `${req.requestId}_publish` && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              <span>{t("requests.publishBtn", { lng: currentLang })}</span>
            </button>
          )}

          {req.status === "Published" && (
            <button
              disabled={actionLoadingId !== null}
              onClick={() => onClose(req.requestId)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoadingId === `${req.requestId}_close` && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              <span>{t("requests.closeBtn", { lng: currentLang })}</span>
            </button>
          )}

          {req.status === "Closed" && (
            <button
              disabled={actionLoadingId !== null}
              onClick={() => onArchive(req.requestId)}
              className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[10px] flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoadingId === `${req.requestId}_archive` && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              <span>{t("requests.archiveBtn", { lng: currentLang })}</span>
            </button>
          )}

          {req.status === "Archived" && (
            <button
              disabled={actionLoadingId !== null}
              onClick={() => onReopen(req.requestId)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoadingId === `${req.requestId}_reopen` && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              <span>{t("requests.reopenBtn", { lng: currentLang })}</span>
            </button>
          )}

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onClone(req.requestId)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title={t("requests.cloneTitle", { lng: currentLang })}
          >
            {actionLoadingId === `${req.requestId}_clone` ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onSaveTemplate(req)}
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("requests.saveAsTemplateTitle", { lng: currentLang })}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            disabled={actionLoadingId !== null}
            onClick={() => onDelete(req)}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title={t("requests.deleteTitle", { lng: currentLang })}
          >
            {actionLoadingId === `${req.requestId}_delete` ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};
