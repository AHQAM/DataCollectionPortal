import { RequestField } from '../../../types';

export interface ValidationResult {
  valid: Record<string, any>[];
  invalid: { row: number; reasonAr: string; reasonEn: string; data: any }[];
}

export function autoMapColumns(
  headers: string[],
  formFields: RequestField[]
): { sysMap: Record<string, string>; fMap: Record<string, string> } {
  const sysMap: Record<string, string> = {};
  const fMap: Record<string, string> = {};

  headers.forEach((h) => {
    const lower = h.toLowerCase().trim();

    // System field matching
    if (lower.includes('region') || lower.includes('منطقة') || lower.includes('منطقه')) {
      sysMap.regionNo = h;
    } else if (lower.includes('repno') || lower.includes('رقم_مندوب') || lower.includes('رقم المندوب')) {
      sysMap.repNo = h;
    } else if (
      lower.includes('repname') ||
      lower.includes('اسم_مندوب') ||
      lower.includes('اسم المندوب') ||
      lower.includes('المندوب')
    ) {
      sysMap.repName = h;
    } else if (lower.includes('branch') || lower.includes('فرع')) {
      sysMap.branchName = h;
    } else if (
      lower === 'customerno' ||
      lower === 'customer_no' ||
      lower === 'cust_no' ||
      lower.includes('رقم_عميل') ||
      lower.includes('رقم العميل')
    ) {
      sysMap.customerNo = h;
    } else if (
      lower === 'customername' ||
      lower === 'customer_name' ||
      lower === 'cust_name' ||
      lower.includes('اسم_عميل') ||
      lower.includes('اسم العميل')
    ) {
      sysMap.customerName = h;
    } else if (lower.includes('area') || lower.includes('مدينة') || lower.includes('حي') || lower.includes('موقع')) {
      sysMap.area = h;
    }

    // Dynamic Form Fields Matching
    formFields.forEach((f) => {
      const keyLower = f.fieldKey.toLowerCase();
      const labelArLower = f.fieldLabelAr.toLowerCase();
      const labelEnLower = (f.fieldLabelEn || '').toLowerCase();

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
  selectedRequestId: string
): ValidationResult {
  const valid: Record<string, any>[] = [];
  const invalid: { row: number; reasonAr: string; reasonEn: string; data: any }[] = [];
  const seenCustomers = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const regCol = systemColMap.regionNo;
    const custNoCol = systemColMap.customerNo || fieldColMap['customer_no'];
    const custNameCol = systemColMap.customerName || fieldColMap['customer_name'];

    const regVal = String(row[regCol] || '').trim();
    const custNoVal = String(row[custNoCol] || '').trim();
    const custNameVal = String(row[custNameCol] || '').trim();

    if (!regVal) {
      invalid.push({
        row: rowNum,
        reasonAr: 'رقم المنطقة مفقود (إلزامي لتوجيه السجل للمندوب)',
        reasonEn: 'Region Number is required for assignment',
        data: row,
      });
      return;
    }

    if (!custNoVal && !custNameVal) {
      invalid.push({
        row: rowNum,
        reasonAr: 'رقم واسم العميل مفقودان',
        reasonEn: 'Customer Number or Name is required',
        data: row,
      });
      return;
    }

    const dedupeKey = `${selectedRequestId}_${custNoVal || custNameVal}`;
    if (seenCustomers.has(dedupeKey)) {
      invalid.push({
        row: rowNum,
        reasonAr: `العميل (${custNoVal || custNameVal}) مكرر في هذا الملف لنفس الطلب`,
        reasonEn: `Duplicate Customer (${custNoVal || custNameVal}) in file`,
        data: row,
      });
      return;
    }

    seenCustomers.add(dedupeKey);
    valid.push(row);
  });

  return { valid, invalid };
}
