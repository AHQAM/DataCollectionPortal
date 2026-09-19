import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { getXLSX } from '../../utils/excel';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  KeyRound,
  X,
  Sparkles,
  Info,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedRepRow {
  repNo: string;
  repName: string;
  branchName: string;
  phone?: string;
  isExisting: boolean;
  isValid: boolean;
  validationError?: string;
  assignedRegions: string[];
}

export const AdminUserImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { lang, users, branches, importUsersBatch } = useApp();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRepRow[]>([]);
  const [totalRawRows, setTotalRawRows] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [swappedDetected, setSwappedDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importedCredentials, setImportedCredentials] = useState<Array<{
    username: string;
    repNameAr: string;
    branchName?: string;
    allowedRegionNos: string[];
    password: string;
  }> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Real sample dataset matching the user's provided Excel file
  const realSampleDataset = [
    { repNo: '1030102', repName: 'نادر محمد شاهر غالب', branch: 'جدة', phone: '0501112233' },
    { repNo: '1030104', repName: 'نادر محمد شاهر غالب', branch: 'جدة', phone: '0501112233' },
    { repNo: '1030104', repName: 'محمد محمود عبدالعزيز نصر', branch: 'جدة', phone: '0502223344' },
    { repNo: '1030201', repName: 'محمد محمود عبدالعزيز نصر', branch: 'جدة', phone: '0502223344' },
    { repNo: '1030202', repName: 'محمود حسن بركات محمود بركات', branch: 'جدة', phone: '0503334455' },
    { repNo: '1030203', repName: 'سالم عبدالحكيم عبدالله عبدالاله', branch: 'جدة', phone: '0504445566' },
    { repNo: '1030301', repName: 'سالم عبدالحكيم عبدالله عبدالاله', branch: 'جدة', phone: '0504445566' },
    { repNo: '1030302', repName: 'سالم عبدالحكيم عبدالله عبدالاله', branch: 'جدة', phone: '0504445566' },
    { repNo: '1030303', repName: 'بشير علي حسين المراني', branch: 'جدة', phone: '0505556677' },
    { repNo: '1030304', repName: 'سامي غالب عبده علي', branch: 'جدة', phone: '0506667788' },
    { repNo: '1040101', repName: 'محمد العزي علي الجرادي', branch: 'المدينة', phone: '0507778899' },
    { repNo: '1040102', repName: 'عارف سمير الحاج احمد', branch: 'المدينة', phone: '0508889900' },
    { repNo: '1040201', repName: 'راشد علي ناجي الحربي', branch: 'المدينة', phone: '0509990011' },
    { repNo: '1040202', repName: 'محمد شاكر حسانين ابراهيم', branch: 'المدينة', phone: '0501234567' },
    { repNo: '1040204', repName: 'عبدالغني علي حسين محمد', branch: 'المدينة', phone: '0502345678' },
    { repNo: '1040301', repName: 'زاهر نجيب طاهر حسن', branch: 'المدينة', phone: '0503456789' },
    { repNo: '1040302', repName: 'وليد عبده محمد الوجيه', branch: 'المدينة', phone: '0504567890' },
    { repNo: '1040304', repName: 'ايمن عبدالحكيم عبود صالح', branch: 'المدينة', phone: '0505678901' },
  ];

  // 1. Download Sample Excel Template
  const handleDownloadTemplate = async () => {
    const XLSX = await getXLSX();
    const sampleData = realSampleDataset.map((item) => ({
      'رقم_المندوب (المعرف)': item.repNo,
      'اسم_المندوب': item.repName,
      'الفرع': item.branch,
      'رقم_الجوال': item.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المناديب');
    XLSX.writeFile(workbook, 'نموذج_استيراد_المناديب_المعتمد.xlsx');
  };

  // Download Generated Credentials Sheet
  const handleDownloadCredentialsExcel = async () => {
    if (!importedCredentials || importedCredentials.length === 0) return;
    const XLSX = await getXLSX();

    const data = importedCredentials.map((c) => ({
      'اسم المندوب': c.repNameAr,
      'رقم المندوب (المعرف)': c.username,
      'الفرع': c.branchName || '',
      'المناطق المصرحة': c.allowedRegionNos.join(', '),
      'كلمة المرور المؤقتة': c.password,
      'ملاحظات الأمان': 'كلمة مرور لمرة واحدة - يلزم التغيير فور أول تسجيل دخول',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'بيانات_دخول_المناديب');
    XLSX.writeFile(workbook, `بيانات_دخول_المناديب_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Group raw records by representative name to handle multi-region assignments
  const groupAndProcessRows = (rawList: { repNo: string; repName: string; branchName: string; phone?: string }[]) => {
    const repMap = new Map<string, {
      repNo: string;
      repName: string;
      branchName: string;
      phone?: string;
      regions: Set<string>;
    }>();

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
      const isExisting = users.some(
        (u) =>
          u.username === primaryNo ||
          u.regionNo === primaryNo ||
          (u.repNameAr && u.repNameAr.trim() === val.repName.trim()) ||
          assignedRegions.some((r) => u.allowedRegionNos?.includes(r))
      );

      let isValid = true;
      let validationError: string | undefined;

      if (!primaryNo) {
        isValid = false;
        validationError = lang === 'ar' ? 'رقم المندوب/المنطقة مفقود' : 'Rep number is missing';
      } else if (!val.repName) {
        isValid = false;
        validationError = lang === 'ar' ? 'اسم المندوب مفقود' : 'Rep name is missing';
      }

      groupedRows.push({
        repNo: primaryNo,
        repName: val.repName,
        branchName: val.branchName?.trim() || (lang === 'ar' ? 'الفرع الرئيسي' : 'Main Branch'),
        phone: val.phone,
        isExisting,
        isValid,
        validationError,
        assignedRegions: assignedRegions.length > 0 ? assignedRegions : [primaryNo],
      });
    });

    return groupedRows;
  };

  // 2. Load Demo Sample Data
  const handleLoadDemoData = () => {
    const rawList = realSampleDataset.map((item) => ({
      repNo: item.repNo,
      repName: item.repName,
      branchName: item.branch,
      phone: item.phone,
    }));

    const processed = groupAndProcessRows(rawList);
    setFileName('sample_representatives_dataset.xlsx');
    setTotalRawRows(realSampleDataset.length);
    setParsedRows(processed);
    setSwappedDetected(false);
    setErrorMsg(null);
  };

  // 3. Process Uploaded File
  const processUploadedFile = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);
    setSwappedDetected(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await getXLSX();
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          setErrorMsg(lang === 'ar' ? 'الملف فارغ أو لا يحتوي على صفوف صالحة' : 'The file is empty or contains no rows');
          setParsedRows([]);
          setTotalRawRows(0);
          return;
        }

        setTotalRawRows(jsonRows.length);

        // Auto-detect swapped columns:
        // Check if the column identified as Rep No has names (Arabic text and no digits)
        // while the column identified as Rep Name has numbers
        let detectedSwap = false;

        const rawList = jsonRows.map((row) => {
          // Check standard keys or position keys
          const keys = Object.keys(row);
          let rawRepNoVal =
            row['رقم_المندوب (المعرف)'] ??
            row['رقم_المندوب'] ??
            row['رقم المندوب'] ??
            row['معرف المندوب'] ??
            row['المعرف'] ??
            row['رقم المنطقة'] ??
            row['RepNo'] ??
            row['Rep_No'] ??
            row['Rep Number'] ??
            row['Username'] ??
            row['RegionNo'] ??
            (keys[0] ? row[keys[0]] : '');

          let rawRepNameVal =
            row['اسم_المندوب'] ??
            row['اسم المندوب'] ??
            row['الاسم'] ??
            row['اسم الموظف'] ??
            row['RepName'] ??
            row['Rep_Name'] ??
            row['Name'] ??
            row['Full Name'] ??
            (keys[1] ? row[keys[1]] : '');

          const branchVal =
            row['الفرع'] ??
            row['فرع'] ??
            row['اسم الفرع'] ??
            row['اسم_الفرع'] ??
            row['الفرع / المنطقة'] ??
            row['الفرع/المنطقة'] ??
            row['المدينة'] ??
            row['الفرع / المدينة'] ??
            row['Branch'] ??
            row['BranchName'] ??
            row['Branch Name'] ??
            (keys[2] ? row[keys[2]] : '');

          const phoneVal =
            row['رقم_الجوال'] ??
            row['الجوال'] ??
            row['الهاتف'] ??
            row['Phone'] ??
            row['Mobile'] ??
            (keys[3] ? row[keys[3]] : '');

          let strNo = String(rawRepNoVal || '').trim();
          let strName = String(rawRepNameVal || '').trim();

          // Auto-swap check:
          // If strNo has Arabic letters and NO digits, while strName is purely digits or starts with digits
          const noHasArabic = /[\u0600-\u06FF]/.test(strNo);
          const noHasNoDigits = !/\d/.test(strNo);
          const nameIsDigits = /^\d+$/.test(strName);

          if ((noHasArabic && noHasNoDigits && nameIsDigits) || (!/\d/.test(strNo) && /^\d+$/.test(strName))) {
            detectedSwap = true;
            const temp = strNo;
            strNo = strName;
            strName = temp;
          }

          return {
            repNo: strNo,
            repName: strName,
            branchName: String(branchVal || '').trim(),
            phone: phoneVal ? String(phoneVal).trim() : undefined,
          };
        });

        setSwappedDetected(detectedSwap);
        const processed = groupAndProcessRows(rawList);
        setParsedRows(processed);
      } catch (err) {
        console.error('Failed to parse excel file:', err);
        setErrorMsg(
          lang === 'ar'
            ? 'حدث خطأ أثناء قراءة ملف الإكسل. يرجى التأكد من صيغة الملف (.xlsx, .xls, .csv)'
            : 'Error reading Excel file. Please ensure it is a valid .xlsx, .xls, or .csv'
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // 4. Commit Import
  const handleCommitImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const newUsers: User[] = validRows.map((r) => {
      // Strictly adhere to what is written in the import file
      const rawBranchName = r.branchName?.trim();
      const exactBranchName = rawBranchName || (lang === 'ar' ? 'الفرع الرئيسي' : 'Main Branch');

      // Find or assign matching branch ID
      const matchedBranch = branches.find(
        (b) =>
          b.branchNameAr.trim().toLowerCase() === exactBranchName.toLowerCase() ||
          b.branchNameEn?.trim().toLowerCase() === exactBranchName.toLowerCase() ||
          b.branchId.toLowerCase() === exactBranchName.toLowerCase()
      );

      const branchId = matchedBranch
        ? matchedBranch.branchId
        : `BR-${encodeURIComponent(exactBranchName).replace(/%/g, '').slice(0, 12)}`;

      return {
        userId: `USER-${r.repNo}`,
        username: r.repNo, // Primary rep number
        regionNo: r.repNo,
        repNo: r.repNo.startsWith('REP-') ? r.repNo : `REP-${r.repNo}`,
        repNameAr: r.repName,
        repNameEn: r.repName,
        email: `rep${r.repNo}@salescollection.sa`,
        mobile: r.phone || '+966500000000',
        branchId,
        branchNameAr: exactBranchName, // Strictly adheres to what is written in the import file!
        branchNameEn: exactBranchName,
        role: 'REP' as const,
        allowedRegionNos: r.assignedRegions && r.assignedRegions.length > 0 ? r.assignedRegions : [r.repNo],
        mustChangePassword: true, // Mandatory change on first login
        isActive: true,
        failedLoginCount: 0,
        failedLoginAttempts: 0,
        sessionVersion: 1,
        deviceBindingStatus: 'UNBOUND' as const,
        maxAllowedDevices: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    try {
      const result = await importUsersBatch(newUsers);
      if (result?.temporaryPasswords && result.temporaryPasswords.length > 0) {
        setImportedCredentials(result.temporaryPasswords);
        onSuccess(result.created || newUsers.length);
      } else {
        onSuccess(newUsers.length);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to import users batch:', err);
      setErrorMsg(
        err?.message ||
          (lang === 'ar'
            ? 'حدث خطأ أثناء استيراد المستخدمين. يرجى المحاولة مرة أخرى.'
            : 'Error importing users. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const existingCount = parsedRows.filter((r) => r.isExisting && r.isValid).length;
  const newCount = validCount - existingCount;
  const multiRegionCount = parsedRows.filter((r) => r.assignedRegions.length > 1).length;

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
                <span>{lang === 'ar' ? 'استيراد المستخدمين والمناديب عبر Excel' : 'Import Users via Excel'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {lang === 'ar' ? 'معتمد' : 'Verified'}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Either Credentials Sheet View or Import Wizard */}
        {importedCredentials ? (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 animate-in fade-in">
            {/* Success Header */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-emerald-950">
                  {lang === 'ar' ? 'تم استيراد حسابات المناديب بنجاح!' : 'Representatives imported successfully!'}
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? `تم إنشاء (${importedCredentials.length}) حساب مندوب بكلمات مرور مؤقتة لمرة واحدة. يمكنك تنزيل كشف البيانات الآن لتسليمه للمناديب يدوياً.`
                    : `Created (${importedCredentials.length}) representative accounts with temporary passwords. You can download the credentials sheet now.`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadCredentialsExcel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تنزيل كشف كلمات المرور (Excel)' : 'Download Credentials (Excel)'}</span>
              </button>
            </div>

            {/* Credentials Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'ar' ? 'كشف بيانات الدخول المؤقتة:' : 'Temporary Credentials Sheet:'}
                </span>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {lang === 'ar' ? 'يلزم تغيير كلمة المرور عند أول تسجيل دخول' : 'Must change password on first login'}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-start w-10">#</th>
                      <th className="px-3 py-2 text-start">{lang === 'ar' ? 'اسم المندوب' : 'Rep Name'}</th>
                      <th className="px-3 py-2 text-start">{lang === 'ar' ? 'رقم المندوب (المعرف)' : 'Username / Rep No'}</th>
                      <th className="px-3 py-2 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>
                      <th className="px-3 py-2 text-start">{lang === 'ar' ? 'المناطق المصرحة' : 'Regions'}</th>
                      <th className="px-3 py-2 text-start">{lang === 'ar' ? 'كلمة المرور المؤقتة' : 'Temporary Password'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedCredentials.map((cred, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{cred.repNameAr}</td>
                        <td className="px-3 py-2 font-mono font-bold text-purple-900">#{cred.username}</td>
                        <td className="px-3 py-2 text-slate-600">{cred.branchName || '---'}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {cred.allowedRegionNos.map((reg) => (
                              <span key={reg} className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                #{reg}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-mono font-extrabold text-xs bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300 select-all">
                            {cred.password}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Multi-Region Smart Architecture Banner */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/80 text-xs flex items-start gap-2.5">
              <Layers className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-indigo-950">
                <span className="font-bold">
                  {lang === 'ar'
                    ? 'الحل الأفضل والمعتمد للمناديب متعددي المناطق: '
                    : 'Best Practice for Multi-Region Reps: '}
                </span>
                <span>
                  {lang === 'ar'
                    ? 'يتم إنشاء حساب مستخدم واحد فقط للمندوب يربط جهازه بأمان، وتُدرج جميع أرقام مناطقه في قائمة صلاحياته. يحصل المندوب على رمز دخول مؤقت لمرة واحدة ويُطلب منه تغييره عند أول تسجيل دخول.'
                    : 'A single user account is created with all assigned regions linked. The rep can sign in using any of their region numbers and toggle between regions easily!'}
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80">
              <div className="flex items-center gap-2 text-xs text-purple-950 font-bold">
                <Info className="w-4 h-4 text-purple-700 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'الأعمدة: [رقم_المندوب (المعرف)] و [اسم_المندوب] و [الفرع] و [رقم_الجوال]'
                    : 'Columns: [Rep_Number (ID)], [Rep_Name], [Branch], [Phone]'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-700" />
                  <span>{lang === 'ar' ? 'تحميل نموذج Excel المعتمد' : 'Download Sample Template'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemoData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'ar' ? 'تجربة عينة مناديب جدة والمدينة (18 منطقة)' : 'Load Demo Sample'}</span>
                </button>
              </div>
            </div>

            {/* Auto-Swap Detection Banner if detected */}
            {swappedDetected && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <ArrowUpDown className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="font-bold">
                  {lang === 'ar'
                    ? 'ذكاء النظام: تم الكشف تلقائياً عن تبديل في محتوى العمودين A و B (تم تصحيح رقم المندوب واسم المندوب تلقائياً دون أي أخطاء)!'
                    : 'Auto-detected swapped columns A & B: Successfully corrected Rep No and Rep Name!'}
                </div>
              </div>
            )}

            {/* Upload Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-2.5">
                <UploadCloud className="w-6 h-6" />
              </div>

              <p className="text-xs font-bold text-slate-800">
                {fileName ? (
                  <span className="text-purple-950 font-extrabold flex items-center justify-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{fileName}</span>
                  </span>
                ) : lang === 'ar' ? (
                  'اسحب وأفلت ملف إكسل (.xlsx, .xls, .csv) هنا، أو اضغط للاختيار من جهازك'
                ) : (
                  'Drag and drop Excel (.xlsx, .xls, .csv) file here, or click to browse'
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'ar'
                  ? 'يتعرف المعالج تلقائياً على الأعمدة المتبادلة ويدمج صفوف نفس المندوب تلقائياً'
                  : 'Auto detects swapped columns and merges multi-region representative rows'}
              </p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Data Table Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-700" />
                    <span>
                      {lang === 'ar'
                        ? `تمت معالجة ${totalRawRows} صفاً في الملف ➔ ${parsedRows.length} حساب مندوب معتمد`
                        : `${totalRawRows} rows in file ➔ ${parsedRows.length} distinct reps`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    {multiRegionCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                        {multiRegionCount} {lang === 'ar' ? 'مندوب متعدد المناطق' : 'Multi-Region Reps'}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {newCount} {lang === 'ar' ? 'مندوب جديد' : 'New Reps'}
                    </span>
                    {existingCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {existingCount} {lang === 'ar' ? 'تحديث قائم' : 'Updates'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5 text-start w-10">#</th>
                        <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'رقم المندوب (المعرف)' : 'Rep ID'}</th>
                        <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'اسم المندوب' : 'Rep Name'}</th>
                        <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'المناطق المصرحة' : 'Assigned Regions'}</th>
                        <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>
                        <th className="px-3 py-2.5 text-start">{lang === 'ar' ? 'كلمة المرور المؤقتة' : 'Temporary password'}</th>
                        <th className="px-3 py-2.5 text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            !row.isValid ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="px-3 py-2 text-slate-400 font-mono text-[10px]">
                            {idx + 1}
                          </td>

                          <td className="px-3 py-2">
                            <span className="font-mono font-extrabold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded-lg border border-purple-200">
                              #{row.repNo || '---'}
                            </span>
                          </td>

                          <td className="px-3 py-2 font-bold text-slate-900">
                            {row.repName || <span className="text-rose-600 font-normal">اسم مفقود</span>}
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {row.assignedRegions.map((reg) => (
                                <span
                                  key={reg}
                                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                    row.assignedRegions.length > 1
                                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  #{reg}
                                </span>
                              ))}
                              {row.assignedRegions.length > 1 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  {lang === 'ar' ? `(${row.assignedRegions.length} مناطق)` : `(${row.assignedRegions.length} regions)`}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-2 text-slate-600">
                            {row.branchName}
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                رمز مؤقت لمرة واحدة
                              </span>
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {lang === 'ar' ? 'تغيير إلزامي' : 'Must Change'}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-2 text-center">
                            {row.isValid ? (
                              row.isExisting ? (
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                  {lang === 'ar' ? 'تحديث وتوسيع مناطق' : 'Update & Expand'}
                                </span>
                              ) : (
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  {lang === 'ar' ? 'حساب جديد' : 'New Account'}
                                </span>
                              )
                            ) : (
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                {row.validationError}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Policy Compliance Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {lang === 'ar' ? 'إجراءات الأمان وكلمات المرور:' : 'Security & PIN Policy:'}
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {lang === 'ar'
                    ? 'سيتم إنشاء رمز دخول مؤقت وفريد لكل مندوب مستورد، وسيلزم النظام المندوب بتعيين كلمة مرور جديدة فور تسجيل دخوله الأول.'
                    : 'Imported representatives receive a unique temporary password and must set a new password on first sign-in.'}
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
                <span>{lang === 'ar' ? 'تصدير ملف Excel' : 'Export Excel'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'تم الانتهاء والإغلاق' : 'Done & Close'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={validCount === 0 || isSubmitting}
                onClick={handleCommitImport}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all ${
                  validCount > 0 && !isSubmitting
                    ? 'bg-purple-900 hover:bg-purple-800 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {isSubmitting
                    ? (lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...')
                    : (lang === 'ar'
                        ? `اعتماد استيراد (${validCount}) مندوب الآن`
                        : `Commit Import (${validCount} Reps)`)}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

