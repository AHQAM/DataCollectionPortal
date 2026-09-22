import { RequestField } from "../../../types";

export interface ValidationResult {
  valid: Record<string, any>[];
  invalid: { row: number; reasonAr: string; reasonEn: string; data: any }[];
}

export function autoMapColumns(
  headers: string[],
  formFields: RequestField[],
): { sysMap: Record<string, string>; fMap: Record<string, string> } {
  const sysMap: Record<string, string> = {};
  const fMap: Record<string, string> = {};

  headers.forEach((h) => {
    const lower = h.toLowerCase().trim();

    // System field matching
    if (
      lower.includes("region") ||
      lower.includes("منطقة") ||
      lower.includes("منطقه")
    ) {
      sysMap.regionNo = h;
    } else if (
      lower.includes("repno") ||
      lower.includes("رقم_مندوب") ||
      lower.includes("رقم المندوب")
    ) {
      sysMap.userNo = h;
    } else if (
      lower.includes("repname") ||
      lower.includes("اسم_مندوب") ||
      lower.includes("اسم المندوب") ||
      lower.includes("المندوب")
    ) {
      sysMap.userName = h;
    } else if (lower.includes("branch") || lower.includes("فرع")) {
      sysMap.branchName = h;
    } else if (
      lower === "targetid" ||
      lower === "target_id" ||
      lower === "recordid" ||
      lower === "record_id" ||
      lower === "record_no" ||
      lower === "customerno" ||
      lower === "customer_no" ||
      lower === "cust_no" ||
      lower.includes("رقم_السجل") ||
      lower.includes("رقم السجل") ||
      lower.includes("معرف_الجهة") ||
      lower.includes("معرف الجهة") ||
      lower.includes("معرف السجل") ||
      lower.includes("معرف_السجل") ||
      lower.includes("رقم_عميل") ||
      lower.includes("رقم العميل")
    ) {
      sysMap.targetId = h;
    } else if (
      lower === "targetname" ||
      lower === "target_name" ||
      lower === "recordname" ||
      lower === "record_name" ||
      lower === "customername" ||
      lower === "customer_name" ||
      lower === "cust_name" ||
      lower.includes("اسم_الجهة") ||
      lower.includes("اسم الجهة") ||
      lower.includes("الجهة المستهدفة") ||
      lower.includes("اسم_السجل") ||
      lower.includes("اسم السجل") ||
      lower.includes("اسم_عميل") ||
      lower.includes("اسم العميل")
    ) {
      sysMap.targetName = h;
    } else if (
      lower.includes("area") ||
      lower.includes("مدينة") ||
      lower.includes("حي") ||
      lower.includes("موقع")
    ) {
      sysMap.area = h;
    }

    // Dynamic Form Fields Matching
    formFields.forEach((f) => {
      const keyLower = f.fieldKey.toLowerCase();
      const labelArLower = f.fieldLabelAr.toLowerCase();
      const labelEnLower = (f.fieldLabelEn || "").toLowerCase();

      if (
        lower === keyLower ||
        lower === labelArLower ||
        (labelEnLower && lower === labelEnLower) ||
        lower.includes(labelArLower) ||
        (keyLower && lower.includes(keyLower))
      ) {
        fMap[f.fieldKey] = h;
      }
    });
  });

  return { sysMap, fMap };
}

export function validateImportRows(
  rawRows: Record<string, any>[],
  systemColMap: Record<string, string>,
  fieldColMap: Record<string, string>,
  selectedRequestId: string,
): ValidationResult {
  const valid: Record<string, any>[] = [];
  const invalid: {
    row: number;
    reasonAr: string;
    reasonEn: string;
    data: any;
  }[] = [];
  const seenCustomers = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const regCol = systemColMap.regionNo;
    const custNoCol =
      systemColMap.targetId ||
      fieldColMap["target_id"] ||
      fieldColMap["customer_no"];
    const custNameCol =
      systemColMap.targetName ||
      fieldColMap["target_name"] ||
      fieldColMap["customer_name"];

    const regVal = String(row[regCol] || "").trim();
    const custNoVal = String(row[custNoCol] || "").trim();
    const custNameVal = String(row[custNameCol] || "").trim();

    if (!regVal) {
      invalid.push({
        row: rowNum,
        reasonAr: "رقم المنطقة مفقود (إلزامي لتوجيه السجل للمستخدم)",
        reasonEn: "Region Number is required for assignment",
        data: row,
      });
      return;
    }

    if (!custNoVal && !custNameVal) {
      invalid.push({
        row: rowNum,
        reasonAr: "معرف أو اسم السجل/الجهة المستهدفة مفقود",
        reasonEn: "Record ID or Target Entity Name is required",
        data: row,
      });
      return;
    }

    const dedupeKey = `${selectedRequestId}_${custNoVal || custNameVal}`;
    if (seenCustomers.has(dedupeKey)) {
      invalid.push({
        row: rowNum,
        reasonAr: `السجل (${custNoVal || custNameVal}) مكرر في هذا الملف لنفس الطلب`,
        reasonEn: `Duplicate record (${custNoVal || custNameVal}) in file`,
        data: row,
      });
      return;
    }

    seenCustomers.add(dedupeKey);
    valid.push(row);
  });

  return { valid, invalid };
}
