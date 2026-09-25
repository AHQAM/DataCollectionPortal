import React from "react";
import { RequestItem, RequestField } from "../../../types";
import { RequestTableRow } from "./RequestTableRow";
import i18n from "../../../i18n";

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
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.codeTitle")}
              </th>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.typePriority")}
              </th>
              <th className="px-4 py-3 text-start">{i18n.t("auto.dueDate")}</th>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.records1")}
              </th>
              <th className="px-4 py-3 text-start">{i18n.t("auto.status")}</th>
              <th className="px-4 py-3 text-center">
                {i18n.t("auto.actions")}
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
                  {i18n.t("auto.noRequestsFound")}
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
