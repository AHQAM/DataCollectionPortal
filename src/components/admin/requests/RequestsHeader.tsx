import React from "react";
import { FileSpreadsheet, FilePlus } from "lucide-react";
import i18n from "../../../i18n";

interface RequestsHeaderProps {
  lang: "ar" | "en";
  onOpenImportWizard: (requestId: string) => void;
  onOpenCreateModal: () => void;
}

export const RequestsHeader: React.FC<RequestsHeaderProps> = ({
  lang,
  onOpenImportWizard,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div>
        <h1 className="text-lg font-extrabold text-slate-900">
          {i18n.t("auto.dataCollectionRequests")}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {i18n.t("auto.createBuildDynamicForms")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenImportWizard("")}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          title={i18n.t("auto.importDataFromExcel")}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{i18n.t("auto.importFromExcel")}</span>
        </button>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>{i18n.t("auto.createNewRequest")}</span>
        </button>
      </div>
    </div>
  );
};
