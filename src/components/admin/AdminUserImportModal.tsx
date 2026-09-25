import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { User } from "../../types";
import { getXLSX } from "../../utils/excel";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  KeyRound,
  X,
  Layers,
} from "lucide-react";
import {
  ParsedRepRow,
  ImportedCredential,
  REAL_SAMPLE_DATASET,
  downloadSampleTemplate,
  downloadCredentialsExcel,
  groupAndProcessRows,
  parseExcelRows,
} from "./user-import/userImportParser";
import { UserImportDropzone } from "./user-import/UserImportDropzone";
import { UserImportPreviewTable } from "./user-import/UserImportPreviewTable";
import { UserImportCredentialsTable } from "./user-import/UserImportCredentialsTable";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const AdminUserImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { lang, users, branches, importUsersBatch , t} = useApp();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRepRow[]>([]);
  const [totalRawRows, setTotalRawRows] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [swappedDetected, setSwappedDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importedCredentials, setImportedCredentials] = useState<
    ImportedCredential[] | null
  >(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    await downloadSampleTemplate();
  };

  const handleDownloadCredentialsExcel = async () => {
    if (importedCredentials) {
      await downloadCredentialsExcel(importedCredentials);
    }
  };

  const handleLoadDemoData = () => {
    const rawList = REAL_SAMPLE_DATASET.map((item) => ({
      userNo: item.userNo,
      userName: item.userName,
      branchName: item.branch,
      phone: item.phone,
    }));

    const processed = groupAndProcessRows(rawList, users, lang);
    setFileName("sample_representatives_dataset.xlsx");
    setTotalRawRows(REAL_SAMPLE_DATASET.length);
    setParsedRows(processed);
    setSwappedDetected(false);
    setErrorMsg(null);
  };

  const processUploadedFile = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);
    setSwappedDetected(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await getXLSX();
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          setErrorMsg(
            t("auto.theFileIsEmpty"),
          );
          setParsedRows([]);
          setTotalRawRows(0);
          return;
        }

        setTotalRawRows(jsonRows.length);
        const { rawList, detectedSwap } = parseExcelRows(jsonRows);
        setSwappedDetected(detectedSwap);
        const processed = groupAndProcessRows(rawList, users, lang);
        setParsedRows(processed);
      } catch (err) {
        console.error("Failed to parse excel file:", err);
        setErrorMsg(
          t("auto.errorReadingExcelFile"),
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleCommitImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const newUsers: User[] = validRows.map((r) => {
      const rawBranchName = r.branchName?.trim();
      const exactBranchName =
        rawBranchName || (t("auto.mainBranch"));

      const matchedBranch = branches.find(
        (b) =>
          b.branchNameAr.trim().toLowerCase() ===
            exactBranchName.toLowerCase() ||
          b.branchNameEn?.trim().toLowerCase() ===
            exactBranchName.toLowerCase() ||
          b.branchId.toLowerCase() === exactBranchName.toLowerCase(),
      );

      const branchId = matchedBranch
        ? matchedBranch.branchId
        : `BR-${encodeURIComponent(exactBranchName).replace(/%/g, "").slice(0, 12)}`;

      return {
        userId: `USER-${r.userNo}`,
        username: r.userNo,
        regionNo: r.userNo,
        userNo: r.userNo.startsWith("REP-") ? r.userNo : `REP-${r.userNo}`,
        userNameAr: r.userName,
        userNameEn: r.userName,
        email: `rep${r.userNo}@salescollection.sa`,
        mobile: r.phone || "+966500000000",
        branchId,
        branchNameAr: exactBranchName,
        branchNameEn: exactBranchName,
        role: "REP" as const,
        allowedRegionNos:
          r.assignedRegions && r.assignedRegions.length > 0
            ? r.assignedRegions
            : [r.userNo],
        mustChangePassword: true,
        isActive: true,
        failedLoginCount: 0,
        failedLoginAttempts: 0,
        sessionVersion: 1,
        deviceBindingStatus: "UNBOUND" as const,
        maxAllowedDevices: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    try {
      const result = await importUsersBatch(newUsers);
      if (
        result.success &&
        result.data?.temporaryPasswords &&
        result.data.temporaryPasswords.length > 0
      ) {
        setImportedCredentials(result.data.temporaryPasswords);
        onSuccess(result.data.createdCount || newUsers.length);
      } else {
        onSuccess(newUsers.length);
        onClose();
      }
    } catch (err: any) {
      console.error("Failed to import users batch:", err);
      setErrorMsg(
        err?.message ||
          (t("auto.errorImportingUsersPlease")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-950 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>
                  {t("auto.importUsersViaExcel")}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {t("auto.verified")}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {importedCredentials ? (
          <UserImportCredentialsTable
            lang={lang}
            importedCredentials={importedCredentials}
            onDownloadCredentialsExcel={handleDownloadCredentialsExcel}
          />
        ) : (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Multi-Region Notice */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/80 text-xs flex items-start gap-2.5">
              <Layers className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-indigo-950">
                <span className="font-bold">
                  {t("auto.bestPracticeForMultiregion")}
                </span>
                <span>
                  {t("auto.aSingleUserAccount")}
                </span>
              </div>
            </div>

            {/* Dropzone & Quick Actions */}
            <UserImportDropzone
              lang={lang}
              fileName={fileName}
              swappedDetected={swappedDetected}
              onFileSelected={processUploadedFile}
              onDownloadTemplate={handleDownloadTemplate}
              onLoadDemoData={handleLoadDemoData}
            />

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Preview Table */}
            <UserImportPreviewTable
              lang={lang}
              parsedRows={parsedRows}
              totalRawRows={totalRawRows}
            />

            {/* Policy Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {t("auto.securityPinPolicy")}
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {t("auto.importedRepresentativesReceiveA")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {importedCredentials ? (
            <>
              <button
                type="button"
                onClick={handleDownloadCredentialsExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-purple-900 text-xs font-bold border border-purple-300 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-purple-700" />
                <span>
                  {t("auto.exportExcel")}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                {t("auto.doneClose")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
              >
                {t("auto.cancel")}
              </button>

              <button
                type="button"
                disabled={validCount === 0 || isSubmitting}
                onClick={handleCommitImport}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all ${
                  validCount > 0 && !isSubmitting
                    ? "bg-purple-900 hover:bg-purple-800 text-white cursor-pointer"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {isSubmitting
                    ? t("auto.importing")
                    : lang === "ar"
                      ? `اعتماد استيراد (${validCount}) مندوب الآن`
                      : `Commit Import (${validCount} Reps)`}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
