import {
  RequestItem,
  RequestField,
  Region,
  Branch,
  User,
} from "../../../types";

interface DemoDataParams {
  currentRequest: RequestItem;
  requestFields: RequestField[];
  regions: Region[];
  branches: Branch[];
  users: User[];
}

export interface DemoDatasetResult {
  demoHeaders: string[];
  demoRows: Record<string, any>[];
  fileName: string;
}

/**
 * Generates realistic demo data matching the fields and structure of a given request.
 */
export function generateDemoDataset({
  currentRequest,
  requestFields,
  regions,
  branches,
  users,
}: DemoDataParams): DemoDatasetResult {
  const demoHeaders: string[] = [
    "RegionNo",
    "RepNo",
    "BranchName",
    "CustomerNo",
    "CustomerName",
    "Area",
  ];

  requestFields.forEach((f) => {
    if (!demoHeaders.includes(f.fieldKey)) {
      demoHeaders.push(f.fieldKey);
    }
  });

  const demoRows: Record<string, any>[] = [];
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
            regionNameAr: "الرياض",
            branchId: branches[0]?.branchId,
          },
        ];

  const sampleCustomers = [
    {
      no: "CUST-5011",
      name: "شركة التوريدات الوطنية الكبرى",
      area: "حي العليا",
    },
    {
      no: "CUST-5012",
      name: "أسواق النور التجارية المحدودة",
      area: "حي الملز",
    },
    {
      no: "CUST-5013",
      name: "مركز الأندلس للمواد الاستهلاكية",
      area: "حي الروضة",
    },
    {
      no: "CUST-5014",
      name: "مؤسسة البركة للمبيعات والتوزيع",
      area: "حي الصحافة",
    },
    { no: "CUST-5015", name: "مجمع التميز التجاري", area: "حي النسيم" },
  ];

  sampleCustomers.forEach((cust, idx) => {
    const reg = availableRegions[idx % availableRegions.length];
    const rep = users.find(
      (u) =>
        u.regionNo === reg.regionNo ||
        u.allowedRegionNos?.includes(reg.regionNo),
    );
    const branch =
      branches.find((b) => b.branchId === reg.branchId) || branches[0];

    const row: Record<string, any> = {
      RegionNo: reg.regionNo,
      RepNo: rep?.userNo || `REP-${reg.regionNo}`,
      BranchName: branch?.branchNameAr || "الفرع الرئيسي",
      CustomerNo: cust.no,
      CustomerName: cust.name,
      Area: cust.area,
    };

    requestFields.forEach((f) => {
      if (f.fieldKey === "customer_no") row[f.fieldKey] = cust.no;
      else if (f.fieldKey === "customer_name") row[f.fieldKey] = cust.name;
      else if (f.fieldKey === "branch_name")
        row[f.fieldKey] = branch?.branchNameAr || "الفرع الرئيسي";
      else if (f.fieldKey === "location") row[f.fieldKey] = cust.area;
      else if (f.fieldKey === "debit_balance" || f.fieldType === "currency")
        row[f.fieldKey] = (idx + 1) * 12500;
      else if (f.fieldKey === "last_deal_date" || f.fieldType === "date")
        row[f.fieldKey] = "2026-04-20";
      else if (f.fieldKey === "inactivity_reason") row[f.fieldKey] = "";
      else if (f.defaultValue !== undefined) row[f.fieldKey] = f.defaultValue;
      else row[f.fieldKey] = "";
    });

    demoRows.push(row);
  });

  return {
    demoHeaders,
    demoRows,
    fileName: `Demo_${currentRequest.requestCode || "Campaign"}_Dataset.xlsx`,
  };
}
