import { getXLSX } from "../../../utils/excel";
import {
  RequestItem,
  RequestField,
  Region,
  Branch,
  User,
} from "../../../types";

interface TemplateParams {
  currentRequest: RequestItem;
  requestFields: RequestField[];
  regions: Region[];
  branches: Branch[];
  users: User[];
}

/**
 * Generates and downloads a custom Excel template matching the fields of a given request.
 */
export async function downloadCustomTemplate({
  currentRequest,
  requestFields,
  regions,
  branches,
  users,
}: TemplateParams): Promise<void> {
  const XLSX = await getXLSX();

  const headers: string[] = [
    "رقم المنطقة (RegionNo)",
    "رقم المندوب (RepNo - اختياري)",
    "اسم الفرع (BranchName - اختياري)",
  ];

  requestFields.forEach((f) => {
    headers.push(`${f.fieldLabelAr} (${f.fieldKey})`);
  });

  const sampleRows: any[][] = [];
  const availableRegions: {
    regionNo: string;
    regionNameAr: string;
    branchId?: string;
  }[] =
    regions.length > 0
      ? regions
      : [
          {
            regionNo: "101",
            regionNameAr: "المنطقة",
            branchId: branches[0]?.branchId,
          },
        ];

  availableRegions.slice(0, 3).forEach((reg, idx) => {
    const rep = users.find(
      (u) =>
        u.regionNo === reg.regionNo ||
        u.allowedRegionNos?.includes(reg.regionNo),
    );
    const branch =
      branches.find((b) => b.branchId === reg.branchId) || branches[0];

    const row: any[] = [
      reg.regionNo,
      rep?.userNo || `REP-${reg.regionNo}`,
      branch?.branchNameAr || "الفرع الرئيسي",
    ];

    requestFields.forEach((f) => {
      if (f.fieldKey === "customer_no" || f.fieldKey === "cust_no") {
        row.push(`CUST-${1000 + idx + 1}`);
      } else if (f.fieldKey === "customer_name" || f.fieldKey === "cust_name") {
        row.push(
          idx === 0
            ? "شركة الوفاق للتجارة"
            : idx === 1
              ? "مؤسسة النماء المركزية"
              : "متجر الأمل للتوريدات",
        );
      } else if (f.fieldKey === "branch_name") {
        row.push(branch?.branchNameAr || "الفرع الرئيسي");
      } else if (f.fieldKey === "location" || f.fieldKey === "area") {
        row.push(reg.regionNameAr || "الرياض");
      } else if (f.fieldType === "currency") {
        row.push((idx + 1) * 15400);
      } else if (f.fieldType === "date") {
        row.push("2026-05-15");
      } else if (
        f.fieldType === "integer" ||
        f.fieldType === "decimal" ||
        f.fieldType === "percentage"
      ) {
        row.push(10 * (idx + 1));
      } else if (
        f.fieldType === "select" &&
        f.options &&
        f.options.length > 0
      ) {
        row.push(f.options[0].value);
      } else {
        row.push(f.isReadOnly ? "بيانات من النظام" : "");
      }
    });

    sampleRows.push(row);
  });

  const aoa = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  const safeTitle = (currentRequest.requestCode || "Campaign").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  XLSX.writeFile(wb, `${safeTitle}_Import_Template.xlsx`);
}
