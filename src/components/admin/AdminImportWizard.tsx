import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { getXLSX } from "../../utils/excel";
import {
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { autoMapColumns, validateImportRows } from "./import/importValidation";
import { downloadCustomTemplate } from "./import/templateGenerator";
import { generateDemoDataset } from "./import/demoDataGenerator";
import { ImportStepSelectFile } from "./import/ImportStepSelectFile";
import { ImportStepMapping } from "./import/ImportStepMapping";
import { ImportStepPreview } from "./import/ImportStepPreview";
import { ImportStepSuccess } from "./import/ImportStepSuccess";

interface Props {
  initialRequestId?: string;
  onBack: () => void;
}

export const AdminImportWizard: React.FC<Props> = ({
  initialRequestId,
  onBack,
}) => {
  const {
    lang,
    dir,
    requests,
    fields,
    regions,
    users,
    branches,
    commitImport,
    quickSwitchUser,
  } = useApp();

  const selectableRequests = requests.filter(
    (r) => r.status === "Draft" || r.status === "Published",
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    initialRequestId ||
      (selectableRequests.length > 0 ? selectableRequests[0].requestId : ""),
  );

  // Selected request object & its dynamic fields
  const currentRequest = requests.find(
    (r) => r.requestId === selectedRequestId,
  );
  const requestFields = fields.filter((f) => f.requestId === selectedRequestId);

  // Parsed File State
  const [fileName, setFileName] = useState<string>("");
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // System and Dynamic Column Mappings
  const [systemColMap, setSystemColMap] = useState<Record<string, string>>({
    regionNo: "RegionNo",
    customerNo: "CustomerNo",
    customerName: "CustomerName",
    branchName: "BranchName",
    repNo: "RepNo",
    repName: "RepName",
    area: "Area",
  });

  const [fieldColMap, setFieldColMap] = useState<Record<string, string>>({});

  // Validation Results
  const [validRows, setValidRows] = useState<Record<string, any>[]>([]);
  const [invalidRows, setInvalidRows] = useState<
    { row: number; reasonAr: string; reasonEn: string; data: any }[]
  >([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{
    total: number;
    created: number;
  } | null>(null);

  // Auto-init field column mappings when selected request changes
  useEffect(() => {
    if (initialRequestId && initialRequestId !== selectedRequestId) {
      setSelectedRequestId(initialRequestId);
    }
  }, [initialRequestId]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const XLSX = await getXLSX();
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
          header: 1,
        });

        if (data.length > 1) {
          const headers = (data[0] as string[])
            .map((h) => String(h || "").trim())
            .filter(Boolean);
          setFileHeaders(headers);

          const rows: Record<string, any>[] = [];
          for (let i = 1; i < data.length; i++) {
            const rowData = data[i] as unknown[];
            if (!rowData || rowData.length === 0) continue;
            const rowObj: Record<string, any> = {};
            headers.forEach((h, colIdx) => {
              rowObj[h] = rowData[colIdx];
            });
            rows.push(rowObj);
          }

          setRawRows(rows);
          const { sysMap, fMap } = autoMapColumns(headers, requestFields);
          setSystemColMap((prev) => ({ ...prev, ...sysMap }));
          setFieldColMap((prev) => ({ ...prev, ...fMap }));
          setStep(2);
        }
      } catch (err) {
        console.error("File parse error:", err);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Generate and Download Request-Specific Excel Template
  const handleDownloadCustomTemplate = async () => {
    if (!currentRequest) return;
    await downloadCustomTemplate({
      currentRequest,
      requestFields,
      regions,
      branches,
      users,
    });
  };

  // Generate Realistic Demo Dataset matching the selected request's fields
  const handleLoadDemoData = () => {
    if (!currentRequest) return;
    const {
      demoHeaders,
      demoRows,
      fileName: generatedFileName,
    } = generateDemoDataset({
      currentRequest,
      requestFields,
      regions,
      branches,
      users,
    });

    setFileName(generatedFileName);
    setFileHeaders(demoHeaders);
    setRawRows(demoRows);
    const { sysMap, fMap } = autoMapColumns(demoHeaders, requestFields);
    setSystemColMap((prev) => ({ ...prev, ...sysMap }));
    setFieldColMap((prev) => ({ ...prev, ...fMap }));
    setStep(2);
  };

  // Step 2 to Step 3: Run Validation & QC
  const handleValidate = () => {
    const { valid, invalid } = validateImportRows(
      rawRows,
      systemColMap,
      fieldColMap,
      selectedRequestId,
    );
    setValidRows(valid);
    setInvalidRows(invalid);
    setStep(3);
  };

  // Step 4: Commit Valid Rows to App Context & Local Database
  const handleCommitImport = async () => {
    setIsImporting(true);

    const mergedMapping: Record<string, string> = {
      ...systemColMap,
      ...fieldColMap,
    };

    const res = await commitImport(
      selectedRequestId,
      validRows,
      mergedMapping,
      fileName || "imported_file.xlsx",
    );
    if (res.success && res.data) {
      setImportStats(res.data);
    }
    setIsImporting(false);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setRawRows([]);
    setFileHeaders([]);
    setValidRows([]);
    setInvalidRows([]);
    setFileName("");
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          >
            {dir === "rtl" ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            <span>{lang === "ar" ? "الرجوع" : "Back"}</span>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <span>
                {lang === "ar"
                  ? "إدراج واستيراد بيانات الحملات عبر Excel"
                  : "Campaign Excel Data Import"}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {lang === "ar"
                ? "رفع ملفات الإكسل وتعيينها تلقائياً للمناطق وتعبئة الحقول المعتمدة للمناديب"
                : "Import spreadsheets, auto-assign to region reps, and pre-populate field forms"}
            </p>
          </div>
        </div>

        {currentRequest && (
          <button
            onClick={handleDownloadCustomTemplate}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            title={
              lang === "ar"
                ? "تنزيل ملف إكسل يحتوي على جميع حقول هذا النموذج جاهز للتعبئة"
                : "Download template"
            }
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>
              {lang === "ar"
                ? "تحميل نموذج Excel مخصص لهذا النموذج"
                : "Download Custom Excel Template"}
            </span>
          </button>
        )}
      </div>

      {/* Wizard Steps Indicator */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-bold overflow-x-auto">
        {[
          {
            num: 1,
            labelAr: "1. اختيار الطلب والملف",
            labelEn: "1. Select & Upload",
          },
          {
            num: 2,
            labelAr: "2. مطابقة الأعمدة والحقول",
            labelEn: "2. Field Mapping",
          },
          {
            num: 3,
            labelAr: "3. فحص الجودة وتأكيد البيانات",
            labelEn: "3. Validation & QC",
          },
          { num: 4, labelAr: "4. اكتمال الاستيراد", labelEn: "4. Completed" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              step === s.num
                ? "bg-purple-900 text-white shadow-xs"
                : step > s.num
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : "text-slate-400"
            }`}
          >
            {step > s.num ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{lang === "ar" ? s.labelAr : s.labelEn}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Request Selection & Upload */}
      {step === 1 && (
        <ImportStepSelectFile
          lang={lang}
          selectableRequests={selectableRequests}
          selectedRequestId={selectedRequestId}
          setSelectedRequestId={setSelectedRequestId}
          currentRequest={currentRequest}
          requestFields={requestFields}
          onFileUpload={handleFileUpload}
          onLoadDemoData={handleLoadDemoData}
        />
      )}

      {/* STEP 2: Source Column Mapping */}
      {step === 2 && (
        <ImportStepMapping
          lang={lang}
          dir={dir}
          fileName={fileName}
          rawRowsCount={rawRows.length}
          fileHeaders={fileHeaders}
          systemColMap={systemColMap}
          setSystemColMap={setSystemColMap}
          fieldColMap={fieldColMap}
          setFieldColMap={setFieldColMap}
          requestFields={requestFields}
          onBackToStep1={() => setStep(1)}
          onValidate={handleValidate}
        />
      )}

      {/* STEP 3: Validation & Quality Control */}
      {step === 3 && (
        <ImportStepPreview
          lang={lang}
          rawRowsCount={rawRows.length}
          validRows={validRows}
          invalidRows={invalidRows}
          isImporting={isImporting}
          systemColMap={systemColMap}
          fieldColMap={fieldColMap}
          requestFields={requestFields}
          onBackToStep2={() => setStep(2)}
          onCommitImport={handleCommitImport}
        />
      )}

      {/* STEP 4: Completed */}
      {step === 4 && (
        <ImportStepSuccess
          lang={lang}
          currentRequest={currentRequest}
          importStats={importStats}
          validRows={validRows}
          systemColMap={systemColMap}
          users={users}
          quickSwitchUser={quickSwitchUser}
          onBack={onBack}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
