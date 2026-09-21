import { User } from "../../../types";
import { getXLSX } from "../../../utils/excel";

export interface ParsedRepRow {
  repNo: string;
  repName: string;
  branchName: string;
  phone?: string;
  isExisting: boolean;
  isValid: boolean;
  validationError?: string;
  assignedRegions: string[];
}

export interface ImportedCredential {
  username: string;
  repNameAr: string;
  branchName?: string;
  allowedRegionNos: string[];
  password: string;
}

export const REAL_SAMPLE_DATASET = [
  {
    repNo: "1030102",
    repName: "نادر محمد شاهر غالب",
    branch: "جدة",
    phone: "0501112233",
  },
  {
    repNo: "1030104",
    repName: "نادر محمد شاهر غالب",
    branch: "جدة",
    phone: "0501112233",
  },
  {
    repNo: "1030104",
    repName: "محمد محمود عبدالعزيز نصر",
    branch: "جدة",
    phone: "0502223344",
  },
  {
    repNo: "1030201",
    repName: "محمد محمود عبدالعزيز نصر",
    branch: "جدة",
    phone: "0502223344",
  },
  {
    repNo: "1030202",
    repName: "محمود حسن بركات محمود بركات",
    branch: "جدة",
    phone: "0503334455",
  },
  {
    repNo: "1030203",
    repName: "سالم عبدالحكيم عبدالله عبدالاله",
    branch: "جدة",
    phone: "0504445566",
  },
  {
    repNo: "1030301",
    repName: "سالم عبدالحكيم عبدالله عبدالاله",
    branch: "جدة",
    phone: "0504445566",
  },
  {
    repNo: "1030302",
    repName: "سالم عبدالحكيم عبدالله عبدالاله",
    branch: "جدة",
    phone: "0504445566",
  },
  {
    repNo: "1030303",
    repName: "بشير علي حسين المراني",
    branch: "جدة",
    phone: "0505556677",
  },
  {
    repNo: "1030304",
    repName: "سامي غالب عبده علي",
    branch: "جدة",
    phone: "0506667788",
  },
  {
    repNo: "1040101",
    repName: "محمد العزي علي الجرادي",
    branch: "المدينة",
    phone: "0507778899",
  },
  {
    repNo: "1040102",
    repName: "عارف سمير الحاج احمد",
    branch: "المدينة",
    phone: "0508889900",
  },
  {
    repNo: "1040201",
    repName: "راشد علي ناجي الحربي",
    branch: "المدينة",
    phone: "0509990011",
  },
  {
    repNo: "1040202",
    repName: "محمد شاكر حسانين ابراهيم",
    branch: "المدينة",
    phone: "0501234567",
  },
  {
    repNo: "1040204",
    repName: "عبدالغني علي حسين محمد",
    branch: "المدينة",
    phone: "0502345678",
  },
  {
    repNo: "1040301",
    repName: "زاهر نجيب طاهر حسن",
    branch: "المدينة",
    phone: "0503456789",
  },
  {
    repNo: "1040302",
    repName: "وليد عبده محمد الوجيه",
    branch: "المدينة",
    phone: "0504567890",
  },
  {
    repNo: "1040304",
    repName: "ايمن عبدالحكيم عبود صالح",
    branch: "المدينة",
    phone: "0505678901",
  },
];

export async function downloadSampleTemplate(): Promise<void> {
  const XLSX = await getXLSX();
  const sampleData = REAL_SAMPLE_DATASET.map((item) => ({
    "رقم_المندوب (المعرف)": item.repNo,
    اسم_المندوب: item.repName,
    الفرع: item.branch,
    رقم_الجوال: item.phone,
  }));

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "المناديب");
  XLSX.writeFile(workbook, "نموذج_استيراد_المناديب_المعتمد.xlsx");
}

export async function downloadCredentialsExcel(
  credentials: ImportedCredential[],
): Promise<void> {
  if (!credentials || credentials.length === 0) return;
  const XLSX = await getXLSX();

  const data = credentials.map((c) => ({
    "اسم المندوب": c.repNameAr,
    "رقم المندوب (المعرف)": c.username,
    الفرع: c.branchName || "",
    "المناطق المصرحة": c.allowedRegionNos.join(", "),
    "كلمة المرور المؤقتة": c.password,
    "ملاحظات الأمان": "كلمة مرور لمرة واحدة - يلزم التغيير فور أول تسجيل دخول",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات_دخول_المناديب");
  XLSX.writeFile(
    workbook,
    `بيانات_دخول_المناديب_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

export function groupAndProcessRows(
  rawList: {
    repNo: string;
    repName: string;
    branchName: string;
    phone?: string;
  }[],
  existingUsers: User[],
  lang: string,
): ParsedRepRow[] {
  const repMap = new Map<
    string,
    {
      repNo: string;
      repName: string;
      branchName: string;
      phone?: string;
      regions: Set<string>;
    }
  >();

  rawList.forEach((row) => {
    const cleanName = row.repName.trim();
    const cleanNo = row.repNo.trim();
    const key = cleanName.toLowerCase();

    if (!repMap.has(key)) {
      repMap.set(key, {
        repNo: cleanNo,
        repName: cleanName,
        branchName: row.branchName,
        phone: row.phone,
        regions: new Set<string>(),
      });
    }

    const existing = repMap.get(key)!;
    if (cleanNo) {
      existing.regions.add(cleanNo);
    }
    if (!existing.branchName && row.branchName) {
      existing.branchName = row.branchName;
    }
    if (!existing.phone && row.phone) {
      existing.phone = row.phone;
    }
  });

  const groupedRows: ParsedRepRow[] = [];
  repMap.forEach((val) => {
    const assignedRegions = Array.from(val.regions);
    const primaryNo = assignedRegions[0] || val.repNo;
    const isExisting = existingUsers.some(
      (u) =>
        u.username === primaryNo ||
        u.regionNo === primaryNo ||
        (u.repNameAr && u.repNameAr.trim() === val.repName.trim()) ||
        assignedRegions.some((r) => u.allowedRegionNos?.includes(r)),
    );

    let isValid = true;
    let validationError: string | undefined;

    if (!primaryNo) {
      isValid = false;
      validationError =
        lang === "ar" ? "رقم المندوب/المنطقة مفقود" : "Rep number is missing";
    } else if (!val.repName) {
      isValid = false;
      validationError =
        lang === "ar" ? "اسم المندوب مفقود" : "Rep name is missing";
    }

    groupedRows.push({
      repNo: primaryNo,
      repName: val.repName,
      branchName:
        val.branchName?.trim() ||
        (lang === "ar" ? "الفرع الرئيسي" : "Main Branch"),
      phone: val.phone,
      isExisting,
      isValid,
      validationError,
      assignedRegions:
        assignedRegions.length > 0 ? assignedRegions : [primaryNo],
    });
  });

  return groupedRows;
}

export function parseExcelRows(jsonRows: any[]): {
  rawList: {
    repNo: string;
    repName: string;
    branchName: string;
    phone?: string;
  }[];
  detectedSwap: boolean;
} {
  let detectedSwap = false;

  const rawList = jsonRows.map((row) => {
    const keys = Object.keys(row);
    let rawRepNoVal =
      row["رقم_المندوب (المعرف)"] ??
      row["رقم_المندوب"] ??
      row["رقم المندوب"] ??
      row["معرف المندوب"] ??
      row["المعرف"] ??
      row["رقم المنطقة"] ??
      row["RepNo"] ??
      row["Rep_No"] ??
      row["Rep Number"] ??
      row["Username"] ??
      row["RegionNo"] ??
      (keys[0] ? row[keys[0]] : "");

    let rawRepNameVal =
      row["اسم_المندوب"] ??
      row["اسم المندوب"] ??
      row["الاسم"] ??
      row["اسم الموظف"] ??
      row["RepName"] ??
      row["Rep_Name"] ??
      row["Name"] ??
      row["Full Name"] ??
      (keys[1] ? row[keys[1]] : "");

    const branchVal =
      row["الفرع"] ??
      row["فرع"] ??
      row["اسم الفرع"] ??
      row["اسم_الفرع"] ??
      row["الفرع / المنطقة"] ??
      row["الفرع/المنطقة"] ??
      row["المدينة"] ??
      row["الفرع / المدينة"] ??
      row["Branch"] ??
      row["BranchName"] ??
      row["Branch Name"] ??
      (keys[2] ? row[keys[2]] : "");

    const phoneVal =
      row["رقم_الجوال"] ??
      row["الجوال"] ??
      row["الهاتف"] ??
      row["Phone"] ??
      row["Mobile"] ??
      (keys[3] ? row[keys[3]] : "");

    let strNo = String(rawRepNoVal || "").trim();
    let strName = String(rawRepNameVal || "").trim();

    const noHasArabic = /[\u0600-\u06FF]/.test(strNo);
    const noHasNoDigits = !/\d/.test(strNo);
    const nameIsDigits = /^\d+$/.test(strName);

    if (
      (noHasArabic && noHasNoDigits && nameIsDigits) ||
      (!/\d/.test(strNo) && /^\d+$/.test(strName))
    ) {
      detectedSwap = true;
      const temp = strNo;
      strNo = strName;
      strName = temp;
    }

    return {
      repNo: strNo,
      repName: strName,
      branchName: String(branchVal || "").trim(),
      phone: phoneVal ? String(phoneVal).trim() : undefined,
    };
  });

  return { rawList, detectedSwap };
}
