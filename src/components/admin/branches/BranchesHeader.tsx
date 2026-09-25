import React from "react";
import { Building2, Plus, FileSpreadsheet } from "lucide-react";
import i18n from "../../../i18n";

interface BranchesHeaderProps {
  lang: "ar" | "en";
  activeTab: "branches" | "regions";
  onOpenExcelModal: () => void;
  onOpenAddBranch: () => void;
  onOpenAddRegion: () => void;
}

export const BranchesHeader: React.FC<BranchesHeaderProps> = ({
  lang,
  activeTab,
  onOpenExcelModal,
  onOpenAddBranch,
  onOpenAddRegion,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <span>
            {i18n.t("auto.branchesRegionsManagement")}
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {i18n.t("auto.addOrganizationBranchesDefine")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onOpenExcelModal}
          className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>
            {i18n.t("auto.importFromExcel")}
          </span>
        </button>

        {activeTab === "branches" ? (
          <button
            onClick={onOpenAddBranch}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{i18n.t("auto.newBranch")}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAddRegion}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{i18n.t("auto.newRegion")}</span>
          </button>
        )}
      </div>
    </div>
  );
};
