import React from "react";
import { useTranslation } from "react-i18next";
import { RequestItem, RequestField } from "../../../types";
import { RequestTableRow } from "./RequestTableRow";

interface RequestsTableProps {
  lang: "ar" | "en";
  requests: RequestItem[];
  fields: RequestField[];
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

export const RequestsTable: React.FC<RequestsTableProps> = ({
  lang,
  requests,
  fields,
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-start">
                {t("requests.colCodeAndTitle", { lng: currentLang })}
              </th>
              <th className="px-4 py-3 text-start">
                {t("requests.colTypeAndPriority", { lng: currentLang })}
              </th>
              <th className="px-4 py-3 text-start">
                {t("requests.colDueDate", { lng: currentLang })}
              </th>
              <th className="px-4 py-3 text-start">
                {t("requests.colRecords", { lng: currentLang })}
              </th>
              <th className="px-4 py-3 text-start">
                {t("requests.colStatus", { lng: currentLang })}
              </th>
              <th className="px-4 py-3 text-center">
                {t("requests.colActions", { lng: currentLang })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  {t("requests.noRequests", { lng: currentLang })}
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const reqFieldsCount = fields.filter(
                  (f) => f.requestId === req.requestId,
                ).length;

                return (
                  <RequestTableRow
                    key={req.requestId}
                    req={req}
                    lang={lang}
                    fieldsCount={reqFieldsCount}
                    actionLoadingId={actionLoadingId}
                    onEdit={onEdit}
                    onViewAssignments={onViewAssignments}
                    onOpenFormBuilder={onOpenFormBuilder}
                    onOpenImportWizard={onOpenImportWizard}
                    onPublish={onPublish}
                    onClose={onClose}
                    onArchive={onArchive}
                    onReopen={onReopen}
                    onClone={onClone}
                    onSaveTemplate={onSaveTemplate}
                    onDelete={onDelete}
                    onViewResponses={onViewResponses}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
