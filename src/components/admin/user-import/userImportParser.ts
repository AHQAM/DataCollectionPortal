import { User } from "../../../types";
import { getXLSX } from "../../../utils/excel";

export interface ParsedRepRow {
  userNo: string;
  userName: string;
  branchName: string;
  phone?: string;
  isExisting: boolean;
  isValid: boolean;
  validationError?: string;
  assignedRegions: string[];
}

export interface ImportedCredential {
  username: string;
  userNameAr: string;
  branchName?: string;
  allowedRegionNos: string[];
  password: string;
}

export const REAL_SAMPLE_DATASET = [
  {
    userNo: "1030102",
    userName: "نادر محمد شاهر غالب",
    branch: "جدة",
    phone: "0501112233",
  },
  {
    userNo: "1030104",
    userName: "نادر محمد شاهر غالب",
    branch: "جدة",
    phone: "0501112233",
  },
  {
    userNo: "1030104",
    userName: "محمد محمود عبدالعزيز نصر",
    branch: "جدة",
    phone: "0502223344",
  },
  {
    userNo: "1030201",
    userName: "محمد محمود عبدالعزيز نصر",
    branch: "جدة",
    phone: "0502223344",
  },
  {
    userNo: "1030202",
    userName: "محمود حسن بركات محمود بركات",
    branch: "جدة",
    phone: "0503334455",
  },
  {
    userNo: "1030203",
    userName: "سالم عبدالحكيم عبدالله عبدالاله",
    branch: "جدة",
    phone: "0504445566",
  },
  {
    userNo: "1030301",
    userName: "سالم عبدالحكيم عبدالله عبدالاله",
    branch: "جدة",
    phone: "0504445566",
  },
  {
    userNo: "1030302",
    userName: "سالم عبدالحكيم عبدالله عبدالاله",
    branch: "جدة",
    phone: "0504445566",
  },
  {
    userNo: "1030303",
    userName: "بشير علي حسين المراني",
    branch: "جدة",
    phone: "0505556677",
  },
  {
    userNo: "1030304",
    userName: "سامي غالب عبده علي",
    branch: "جدة",
    phone: "0506667788",
  },
  {
    userNo: "1040101",
    userName: "محمد العزي علي الجرادي",
    branch: "المدينة",
    phone: "0507778899",
  },
  {
    userNo: "1040102",
    userName: "عارف سمير الحاج احمد",
    branch: "المدينة",
    phone: "0508889900",
  },
  {
    userNo: "1040201",
    userName: "راشد علي ناجي الحربي",
    branch: "المدينة",
    phone: "0509990011",
  },
  {
    userNo: "1040202",
    userName: "محمد شاكر حسانين ابراهيم",
    branch: "المدينة",
    phone: "0501234567",
  },
  {
    userNo: "1040204",
    userName: "عبدالغني علي حسين محمد",
    branch: "المدينة",
    phone: "0502345678",
  },
  {
    userNo: "1040301",
    userName: "زاهر نجيب طاهر حسن",
    branch: "المدينة",
    phone: "0503456789",
  },
  {
    userNo: "1040302",
    userName: "وليد عبده محمد الوجيه",
    branch: "المدينة",
    phone: "0504567890",
  },
  {
    userNo: "1040304",
    userName: "ايمن عبدالحكيم عبود صالح",
    branch: "المدينة",
    phone: "0505678901",
  },
];

export async function downloadSampleTemplate(): Promise<void> {
  const XLSX = await getXLSX();
  const sampleData = REAL_SAMPLE_DATASET.map((item) => ({
    "رقم_المستخدم (المعرف)": item.userNo,
    اسم_المستخدم: item.userName,
    الفرع: item.branch,
    رقم_الجوال: item.phone,
  }));

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "المستخدمين");
  XLSX.writeFile(workbook, "نموذج_استيراد_المستخدمين_المعتمد.xlsx");
}

export async function downloadCredentialsExcel(
  credentials: ImportedCredential[],
): Promise<void> {
  if (!credentials || credentials.length === 0) return;
  const XLSX = await getXLSX();

  const data = credentials.map((c) => ({
    "اسم المستخدم": c.userNameAr,
    "رقم المستخدم (اسم الدخول)": c.username,
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
    userNo: string;
    userName: string;
    branchName: string;
    phone?: string;
  }[],
  existingUsers: User[],
  lang: string,
): ParsedRepRow[] {
  const repMap = new Map<
    string,
    {
      userNo: string;
      userName: string;
      branchName: string;
      phone?: string;
      regions: Set<string>;
    }
  >();

  rawList.forEach((row) => {
    const cleanName = row.userName.trim();
    const cleanNo = row.userNo.trim();
    const key = cleanName.toLowerCase();

    if (!repMap.has(key)) {
      repMap.set(key, {
        userNo: cleanNo,
        userName: cleanName,
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
    const primaryNo = assignedRegions[0] || val.userNo;
    const isExisting = existingUsers.some(
      (u) =>
        u.username === primaryNo ||
        u.regionNo === primaryNo ||
        (u.userNameAr && u.userNameAr.trim() === val.userName.trim()) ||
        assignedRegions.some((r) => u.allowedRegionNos?.includes(r)),
    );

    let isValid = true;
    let validationError: string | undefined;

    if (!primaryNo) {
      isValid = false;
      validationError =
        lang === "ar" ? "رقم المستخدم/المنطقة مفقود" : "User number is missing";
    } else if (!val.userName) {
      isValid = false;
      validationError =
        lang === "ar" ? "اسم المستخدم مفقود" : "User name is missing";
    }

    groupedRows.push({
      userNo: primaryNo,
      userName: val.userName,
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
    userNo: string;
    userName: string;
    branchName: string;
    phone?: string;
  }[];
  detectedSwap: boolean;
} {
  let detectedSwap = false;

  const rawList = jsonRows.map((row) => {
    const keys = Object.keys(row);
    let rawRepNoVal =
      row["رقم_المستخدم (المعرف)"] ??
      row["رقم_المستخدم"] ??
      row["رقم المستخدم"] ??
      row["معرف المستخدم"] ??
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
      row["اسم_المستخدم"] ??
      row["اسم المستخدم"] ??
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
      userNo: strNo,
      userName: strName,
      branchName: String(branchVal || "").trim(),
      phone: phoneVal ? String(phoneVal).trim() : undefined,
    };
  });

  return { rawList, detectedSwap };
}
