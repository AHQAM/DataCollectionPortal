import { useState } from "react";
import { getXLSX } from "../utils/excel";
import i18n from "../i18n";

export const useBranchesExcelImport = (
  lang: "ar" | "en",
  importBranchesAndRegions: (
    parsedBranches: any[],
    parsedRegions: any[],
    mode: "append" | "replace",
  ) => Promise<{ success: boolean; data?: any; message?: string }>,
) => {
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [parsedBranches, setParsedBranches] = useState<
    { branchId: string; branchNameAr: string; branchNameEn?: string }[]
  >([]);
  const [parsedRegions, setParsedRegions] = useState<
    {
      regionNo: string;
      regionNameAr: string;
      regionNameEn?: string;
      branchId: string;
    }[]
  >([]);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [excelFileName, setExcelFileName] = useState("");
  const [excelParseError, setExcelParseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    const templateData = [
      {
        "رمز الفرع (Branch ID)": "BR-RYD",
        "اسم الفرع بالعربي (Branch Name AR)": "فرع المنطقة الوسطى (الرياض)",
        "اسم الفرع بالإنجليزي (Branch Name EN)": "Riyadh Central Branch",
        "رقم المنطقة (Region No)": "101",
        "اسم المنطقة بالعربي (Region Name AR)":
          "شمال الرياض - العليا والسليمانية",
        "اسم المنطقة بالإنجليزي (Region Name EN)":
          "North Riyadh - Olaya & Sulaimaniyah",
      },
      {
        "رمز الفرع (Branch ID)": "BR-RYD",
        "اسم الفرع بالعربي (Branch Name AR)": "فرع المنطقة الوسطى (الرياض)",
        "اسم الفرع بالإنجليزي (Branch Name EN)": "Riyadh Central Branch",
        "رقم المنطقة (Region No)": "102",
        "اسم المنطقة بالعربي (Region Name AR)": "شرق الرياض - الملز والربوة",
        "اسم المنطقة بالإنجليزي (Region Name EN)":
          "East Riyadh - Malaz & Rabwah",
      },
      {
        "رمز الفرع (Branch ID)": "BR-JED",
        "اسم الفرع بالعربي (Branch Name AR)": "فرع المنطقة الغربية (جدة)",
        "اسم الفرع بالإنجليزي (Branch Name EN)": "Western Jeddah Branch",
        "رقم المنطقة (Region No)": "201",
        "اسم المنطقة بالعربي (Region Name AR)": "وسط جدة - الروضة والسلامة",
        "اسم المنطقة بالإنجليزي (Region Name EN)":
          "Central Jeddah - Rawdah & Salamah",
      },
      {
        "رمز الفرع (Branch ID)": "BR-DMM",
        "اسم الفرع بالعربي (Branch Name AR)": "فرع المنطقة الشرقية (الدمام)",
        "اسم الفرع بالإنجليزي (Branch Name EN)": "Eastern Dammam Branch",
        "رقم المنطقة (Region No)": "301",
        "اسم المنطقة بالعربي (Region Name AR)": "الدمام - الشاطئ والمزروعية",
        "اسم المنطقة بالإنجليزي (Region Name EN)":
          "Dammam - Shatea & Mazrouiya",
      },
    ];

    const XLSX = await getXLSX();
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الفروع والمناطق");
    XLSX.writeFile(wb, "قالب_استيراد_الفروع_والمناطق_الميدانية.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setExcelParseError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await getXLSX();
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (!jsonData || jsonData.length === 0) {
          setExcelParseError(i18n.t("branches.excelEmptyError", { lng: lang }));
          return;
        }

        const branchesMap = new Map<
          string,
          { branchId: string; branchNameAr: string; branchNameEn?: string }
        >();
        const regionsList: {
          regionNo: string;
          regionNameAr: string;
          regionNameEn?: string;
          branchId: string;
        }[] = [];

        jsonData.forEach((row, idx) => {
          const branchId = String(
            row["رمز الفرع (Branch ID)"] ||
              row["رمز الفرع"] ||
              row["كود الفرع"] ||
              row["BranchId"] ||
              row["Branch ID"] ||
              row["BranchCode"] ||
              `BR-${idx + 1}`,
          ).trim();

          const branchNameAr = String(
            row["اسم الفرع بالعربي (Branch Name AR)"] ||
              row["اسم الفرع بالعربي"] ||
              row["اسم الفرع"] ||
              row["الفرع"] ||
              row["BranchNameAr"] ||
              row["Branch Name AR"] ||
              row["Branch"] ||
              "",
          ).trim();

          const branchNameEn = String(
            row["اسم الفرع بالإنجليزي (Branch Name EN)"] ||
              row["اسم الفرع بالانجليزي"] ||
              row["BranchNameEn"] ||
              row["Branch Name EN"] ||
              branchNameAr,
          ).trim();

          const regionNo = String(
            row["رقم المنطقة (Region No)"] ||
              row["رقم المنطقة"] ||
              row["كود المنطقة"] ||
              row["المنطقة"] ||
              row["RegionNo"] ||
              row["Region No"] ||
              row["Zone"] ||
              "",
          ).trim();

          const regionNameAr = String(
            row["اسم المنطقة بالعربي (Region Name AR)"] ||
              row["اسم المنطقة بالعربي"] ||
              row["اسم المنطقة"] ||
              row["RegionNameAr"] ||
              row["Region Name AR"] ||
              row["ZoneName"] ||
              "",
          ).trim();

          const regionNameEn = String(
            row["اسم المنطقة بالإنجليزي (Region Name EN)"] ||
              row["اسم المنطقة بالانجليزي"] ||
              row["RegionNameEn"] ||
              row["Region Name EN"] ||
              regionNameAr,
          ).trim();

          if (branchNameAr) {
            const normalizedBranchId = branchId.toUpperCase();
            if (!branchesMap.has(normalizedBranchId)) {
              branchesMap.set(normalizedBranchId, {
                branchId: normalizedBranchId,
                branchNameAr,
                branchNameEn,
              });
            }
          }

          if (regionNo && regionNameAr) {
            regionsList.push({
              regionNo,
              regionNameAr,
              regionNameEn,
              branchId: branchId.toUpperCase(),
            });
          }
        });

        const parsedB = Array.from(branchesMap.values());
        if (parsedB.length === 0 && regionsList.length === 0) {
          setExcelParseError(
            i18n.t("branches.excelNoMatchingCols", { lng: lang }),
          );
          return;
        }

        setParsedBranches(parsedB);
        setParsedRegions(regionsList);
      } catch (err: any) {
        setExcelParseError(err.message || "Error parsing Excel file");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (parsedBranches.length === 0 && parsedRegions.length === 0) return;
    const res = await importBranchesAndRegions(
      parsedBranches,
      parsedRegions,
      importMode,
    );
    if (res.success && res.data) {
      setSuccessMessage(
        i18n.t("branches.excelImportSuccess", {
          lng: lang,
          branchesCount: res.data.branchesCount,
          regionsCount: res.data.regionsCount,
        }),
      );
    }
    setShowExcelModal(false);
    setParsedBranches([]);
    setParsedRegions([]);
    setExcelFileName("");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return {
    showExcelModal,
    setShowExcelModal,
    parsedBranches,
    setParsedBranches,
    parsedRegions,
    setParsedRegions,
    importMode,
    setImportMode,
    excelFileName,
    setExcelFileName,
    excelParseError,
    setExcelParseError,
    successMessage,
    setSuccessMessage,
    handleDownloadTemplate,
    handleFileUpload,
    handleConfirmImport,
  };
};
