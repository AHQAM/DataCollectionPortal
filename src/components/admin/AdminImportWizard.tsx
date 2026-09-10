import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RecordItem, RequestField } from '../../types';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Database,
  Trash2,
  RefreshCw,
  FileText,
  Sparkles,
  Lock,
  Smartphone,
  Check,
  Building,
  Users,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  initialRequestId?: string;
  onBack: () => void;
}

export const AdminImportWizard: React.FC<Props> = ({ initialRequestId, onBack }) => {
  const {
    lang,
    dir,
    t,
    requests,
    fields,
    regions,
    users,
    branches,
    commitImport,
    setActiveView,
    quickSwitchUser,
  } = useApp();

  const selectableRequests = requests.filter((r) => r.status === 'Draft' || r.status === 'Published');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    initialRequestId || (selectableRequests.length > 0 ? selectableRequests[0].requestId : '')
  );

  // Selected request object & its dynamic fields
  const currentRequest = requests.find((r) => r.requestId === selectedRequestId);
  const requestFields = fields.filter((f) => f.requestId === selectedRequestId);

  // Parsed File State
  const [fileName, setFileName] = useState<string>('');
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);

  // System and Dynamic Column Mappings
  const [systemColMap, setSystemColMap] = useState<Record<string, string>>({
    regionNo: 'RegionNo',
    customerNo: 'CustomerNo',
    customerName: 'CustomerName',
    branchName: 'BranchName',
    repNo: 'RepNo',
    repName: 'RepName',
    area: 'Area',
  });

  const [fieldColMap, setFieldColMap] = useState<Record<string, string>>({});

  // Validation Results
  const [validRows, setValidRows] = useState<Record<string, any>[]>([]);
  const [invalidRows, setInvalidRows] = useState<{ row: number; reasonAr: string; reasonEn: string; data: any }[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{ total: number; created: number } | null>(null);

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

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { header: 1 });

        if (data.length > 1) {
          const headers = (data[0] as string[]).map((h) => String(h || '').trim()).filter(Boolean);
          setFileHeaders(headers);

          const rows: Record<string, any>[] = [];
          for (let i = 1; i < data.length; i++) {
            const rowData = data[i] as any[];
            if (!rowData || rowData.length === 0) continue;
            const rowObj: Record<string, any> = {};
            headers.forEach((h, colIdx) => {
              rowObj[h] = rowData[colIdx];
            });
            rows.push(rowObj);
          }

          setRawRows(rows);
          autoMapColumns(headers, requestFields);
          setStep(2);
        }
      } catch (err) {
        console.error('File parse error:', err);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Dynamic Column Auto-Mapping
  const autoMapColumns = (headers: string[], formFields: RequestField[]) => {
    const sysMap: Record<string, string> = {};
    const fMap: Record<string, string> = {};

    headers.forEach((h) => {
      const lower = h.toLowerCase().trim();

      // System field matching
      if (lower.includes('region') || lower.includes('منطقة') || lower.includes('منطقه')) {
        sysMap.regionNo = h;
      } else if (lower.includes('repno') || lower.includes('رقم_مندوب') || lower.includes('رقم المندوب')) {
        sysMap.repNo = h;
      } else if (lower.includes('repname') || lower.includes('اسم_مندوب') || lower.includes('اسم المندوب') || lower.includes('المندوب')) {
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

    setSystemColMap((prev) => ({ ...prev, ...sysMap }));
    setFieldColMap((prev) => ({ ...prev, ...fMap }));
  };

  // Generate and Download Request-Specific Excel Template
  const handleDownloadCustomTemplate = () => {
    if (!currentRequest) return;

    // Headers array: Core assignment columns + ALL request fields
    const headers: string[] = [
      'رقم المنطقة (RegionNo)',
      'رقم المندوب (RepNo - اختياري)',
      'اسم الفرع (BranchName - اختياري)',
    ];

    requestFields.forEach((f) => {
      headers.push(`${f.fieldLabelAr} (${f.fieldKey})`);
    });

    // Sample data rows based on actual regions and fields
    const sampleRows: any[][] = [];
    const availableRegions: { regionNo: string; regionNameAr: string; branchId?: string }[] =
      regions.length > 0 ? regions : [{ regionNo: '101', regionNameAr: 'المنطقة', branchId: branches[0]?.branchId }];

    availableRegions.slice(0, 3).forEach((reg, idx) => {
      const rep = users.find((u) => u.regionNo === reg.regionNo || u.allowedRegionNos?.includes(reg.regionNo));
      const branch = branches.find((b) => b.branchId === reg.branchId) || branches[0];

      const row: any[] = [
        reg.regionNo,
        rep?.repNo || `REP-${reg.regionNo}`,
        branch?.branchNameAr || 'الفرع الرئيسي',
      ];

      requestFields.forEach((f) => {
        if (f.fieldKey === 'customer_no' || f.fieldKey === 'cust_no') {
          row.push(`CUST-${1000 + idx + 1}`);
        } else if (f.fieldKey === 'customer_name' || f.fieldKey === 'cust_name') {
          row.push(idx === 0 ? 'شركة الوفاق للتجارة' : idx === 1 ? 'مؤسسة النماء المركزية' : 'متجر الأمل للتوريدات');
        } else if (f.fieldKey === 'branch_name') {
          row.push(branch?.branchNameAr || 'الفرع الرئيسي');
        } else if (f.fieldKey === 'location' || f.fieldKey === 'area') {
          row.push(reg.regionNameAr || 'الرياض');
        } else if (f.fieldType === 'currency') {
          row.push((idx + 1) * 15400);
        } else if (f.fieldType === 'date') {
          row.push('2026-05-15');
        } else if (f.fieldType === 'integer' || f.fieldType === 'decimal' || f.fieldType === 'percentage') {
          row.push(10 * (idx + 1));
        } else if (f.fieldType === 'select' && f.options && f.options.length > 0) {
          row.push(f.options[0].value);
        } else {
          row.push(f.isReadOnly ? 'بيانات من النظام' : '');
        }
      });

      sampleRows.push(row);
    });

    const aoa = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const safeTitle = (currentRequest.requestCode || 'Campaign').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `${safeTitle}_Import_Template.xlsx`);
  };

  // Generate Realistic Demo Dataset matching the selected request's fields
  const handleLoadDemoData = () => {
    if (!currentRequest) return;

    const demoHeaders: string[] = ['RegionNo', 'RepNo', 'BranchName', 'CustomerNo', 'CustomerName', 'Area'];
    requestFields.forEach((f) => {
      if (!demoHeaders.includes(f.fieldKey)) {
        demoHeaders.push(f.fieldKey);
      }
    });

    const demoRows: Record<string, any>[] = [];
    const availableRegions: { regionNo: string; regionNameAr: string; branchId?: string }[] =
      regions.length > 0 ? regions : [{ regionNo: '101', regionNameAr: 'الرياض', branchId: branches[0]?.branchId }];

    const sampleCustomers = [
      { no: 'CUST-5011', name: 'شركة التوريدات الوطنية الكبرى', area: 'حي العليا' },
      { no: 'CUST-5012', name: 'أسواق النور التجارية المحدودة', area: 'حي الملز' },
      { no: 'CUST-5013', name: 'مركز الأندلس للمواد الاستهلاكية', area: 'حي الروضة' },
      { no: 'CUST-5014', name: 'مؤسسة البركة للمبيعات والتوزيع', area: 'حي الصحافة' },
      { no: 'CUST-5015', name: 'مجمع التميز التجاري', area: 'حي النسيم' },
    ];

    sampleCustomers.forEach((cust, idx) => {
      const reg = availableRegions[idx % availableRegions.length];
      const rep = users.find((u) => u.regionNo === reg.regionNo || u.allowedRegionNos?.includes(reg.regionNo));
      const branch = branches.find((b) => b.branchId === reg.branchId) || branches[0];

      const row: Record<string, any> = {
        RegionNo: reg.regionNo,
        RepNo: rep?.repNo || `REP-${reg.regionNo}`,
        BranchName: branch?.branchNameAr || 'الفرع الرئيسي',
        CustomerNo: cust.no,
        CustomerName: cust.name,
        Area: cust.area,
      };

      requestFields.forEach((f) => {
        if (f.fieldKey === 'customer_no') row[f.fieldKey] = cust.no;
        else if (f.fieldKey === 'customer_name') row[f.fieldKey] = cust.name;
        else if (f.fieldKey === 'branch_name') row[f.fieldKey] = branch?.branchNameAr || 'الفرع الرئيسي';
        else if (f.fieldKey === 'location') row[f.fieldKey] = cust.area;
        else if (f.fieldKey === 'debit_balance' || f.fieldType === 'currency') row[f.fieldKey] = (idx + 1) * 12500;
        else if (f.fieldKey === 'last_deal_date' || f.fieldType === 'date') row[f.fieldKey] = '2026-04-20';
        else if (f.fieldKey === 'inactivity_reason') row[f.fieldKey] = ''; // Editable field left blank for rep!
        else if (f.defaultValue !== undefined) row[f.fieldKey] = f.defaultValue;
        else row[f.fieldKey] = '';
      });

      demoRows.push(row);
    });

    setFileName(`Demo_${currentRequest.requestCode}_Dataset.xlsx`);
    setFileHeaders(demoHeaders);
    setRawRows(demoRows);
    autoMapColumns(demoHeaders, requestFields);
    setStep(2);
  };

  // Step 2 to Step 3: Run Validation & QC
  const handleValidate = () => {
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

    const res = await commitImport(selectedRequestId, validRows, mergedMapping, fileName || 'imported_file.xlsx');
    setImportStats(res);
    setIsImporting(false);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setStep(4);
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
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'الرجوع' : 'Back'}</span>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              <span>{lang === 'ar' ? 'إدراج واستيراد بيانات الحملات عبر Excel' : 'Campaign Excel Data Import'}</span>
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'رفع ملفات الإكسل وتعيينها تلقائياً للمناطق وتعبئة الحقول المعتمدة للمناديب'
                : 'Import spreadsheets, auto-assign to region reps, and pre-populate field forms'}
            </p>
          </div>
        </div>

        {currentRequest && (
          <button
            onClick={handleDownloadCustomTemplate}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            title={lang === 'ar' ? 'تنزيل ملف إكسل يحتوي على جميع حقول هذا النموذج جاهز للتعبئة' : 'Download template'}
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>{lang === 'ar' ? 'تحميل نموذج Excel مخصص لهذا النموذج' : 'Download Custom Excel Template'}</span>
          </button>
        )}
      </div>

      {/* Wizard Steps Indicator */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-bold overflow-x-auto">
        {[
          { num: 1, labelAr: '1. اختيار الطلب والملف', labelEn: '1. Select & Upload' },
          { num: 2, labelAr: '2. مطابقة الأعمدة والحقول', labelEn: '2. Field Mapping' },
          { num: 3, labelAr: '3. فحص الجودة وتأكيد البيانات', labelEn: '3. Validation & QC' },
          { num: 4, labelAr: '4. اكتمال الاستيراد', labelEn: '4. Completed' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              step === s.num
                ? 'bg-purple-900 text-white shadow-xs'
                : step > s.num
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-slate-400'
            }`}
          >
            {step > s.num ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{lang === 'ar' ? s.labelAr : s.labelEn}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Request Selection & Upload */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Target Request Picker */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-extrabold text-slate-900">
              {lang === 'ar' ? '1. اختر الطلب أو الحملة المستهدفة للإدراج:' : '1. Target Collection Request:'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full sm:max-w-md h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                {selectableRequests.map((r) => (
                  <option key={r.requestId} value={r.requestId}>
                    {r.requestCode} - {lang === 'ar' ? r.titleAr : r.titleEn} ({r.status})
                  </option>
                ))}
              </select>

              {currentRequest && (
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold">
                    {requestFields.length} {lang === 'ar' ? 'حقول محددة بالنموذج' : 'form fields'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>
                      {requestFields.filter((f) => f.isReadOnly).length}{' '}
                      {lang === 'ar' ? 'حقول للعرض فقط (من الإكسل)' : 'read-only'}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="border-2 border-dashed border-purple-200 hover:border-purple-600 bg-purple-50/20 rounded-2xl p-8 text-center transition-all">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-emerald-700 mb-3" />
            <h3 className="font-extrabold text-sm text-slate-800">
              {lang === 'ar' ? 'اسحب ملف Excel أو CSV هنا أو اضغط لاختياره' : 'Drop your Excel file here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {lang === 'ar'
                ? 'يدعم ملفات .xlsx و .xls و .csv مع قراءة وتعيين تلقائي لجميع الأعمدة'
                : 'Supports .xlsx, .xls, .csv with auto column mapping'}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <label className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer shadow-md transition-all flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                <span>{lang === 'ar' ? 'اختيار ملف من الجهاز' : 'Browse File'}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadDemoData}
                className="px-4 py-2.5 rounded-xl bg-white border border-purple-300 hover:bg-purple-50 text-purple-900 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title={lang === 'ar' ? 'توليد ملف بيانات توضيحية مطابق لحقول هذا الطلب فوراً للتجربة' : 'Load Demo Dataset'}
              >
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>{lang === 'ar' ? 'تجربة سريعة (بيانات توضيحية مطابقة للطلب)' : 'Load Matching Demo Dataset'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Source Column Mapping */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'ar' ? 'مطابقة أعمدة الإكسل مع حقول النظام والنموذج' : 'Column & Field Mapping'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar'
                  ? `الملف: ${fileName} • تم قراءة ${rawRows.length} صف و ${fileHeaders.length} عمود`
                  : `File: ${fileName} • ${rawRows.length} rows read`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                {lang === 'ar' ? 'تغيير الملف' : 'Change File'}
              </button>
              <button
                onClick={handleValidate}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{lang === 'ar' ? 'التالي: فحص البيانات ومطابقتها' : 'Next: Validate Data'}</span>
                {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section A: Core System Routing Fields */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-purple-700" />
              <span>{lang === 'ar' ? 'أ. حقول التوجيه والتعيين الجغرافي (إلزامية للتوزيع للمناديب)' : 'A. System & Routing Fields'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Region No */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-purple-950">
                    {lang === 'ar' ? 'رقم المنطقة' : 'Region Number'}
                  </label>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                    {lang === 'ar' ? 'إلزامي للتعيين' : 'Required'}
                  </span>
                </div>
                <select
                  value={systemColMap.regionNo || ''}
                  onChange={(e) => setSystemColMap({ ...systemColMap, regionNo: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border border-purple-300 bg-white font-mono text-xs font-bold text-slate-900"
                >
                  <option value="">-- اختر عمود المنطقة --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      عمود: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer No */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-slate-800">
                    {lang === 'ar' ? 'رقم العميل (المعرف الفريد)' : 'Customer Number'}
                  </label>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                    {lang === 'ar' ? 'معرف السجل' : 'Key ID'}
                  </span>
                </div>
                <select
                  value={systemColMap.customerNo || ''}
                  onChange={(e) => setSystemColMap({ ...systemColMap, customerNo: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
                >
                  <option value="">-- اختر عمود رقم العميل --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      عمود: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-slate-800">
                    {lang === 'ar' ? 'اسم العميل / المتجر' : 'Customer Name'}
                  </label>
                </div>
                <select
                  value={systemColMap.customerName || ''}
                  onChange={(e) => setSystemColMap({ ...systemColMap, customerName: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
                >
                  <option value="">-- اختر عمود اسم العميل --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      عمود: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar' ? 'اسم الفرع (اختياري)' : 'Branch Name (Optional)'}
                </label>
                <select
                  value={systemColMap.branchName || ''}
                  onChange={(e) => setSystemColMap({ ...systemColMap, branchName: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
                >
                  <option value="">-- تلقائي من بيانات المندوب والمنطقة --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      عمود: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rep No */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar' ? 'رقم المندوب (اختياري)' : 'Rep Number (Optional)'}
                </label>
                <select
                  value={systemColMap.repNo || ''}
                  onChange={(e) => setSystemColMap({ ...systemColMap, repNo: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
                >
                  <option value="">-- تلقائي من المنطقة --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      عمود: {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  {lang === 'ar' ? 'الحي / المدينة (اختياري)' : 'Area / City (Optional)'}
                </label>
                <select
                  value={systemColMap.area || ''}
                  onChange={(e) => setSystemColMap({ ...systemColMap, area: e.target.value })}
                  className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
                >
                  <option value="">-- تجاهل --</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      عمود: {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section B: Dynamic Request Form Fields */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>
                  {lang === 'ar'
                    ? `ب. حقول نموذج جمع البيانات (${requestFields.length} حقل تم تكوينه)`
                    : `B. Dynamic Form Fields (${requestFields.length})`}
                </span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {lang === 'ar'
                  ? 'الحقول المعلمة بـ (للعرض فقط) ستظهر للمندوب كمرجع من الإكسل ولا يمكنه تعديلها'
                  : 'Read-only fields will be displayed to the rep without edit permission'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {requestFields.map((field) => (
                <div
                  key={field.fieldId}
                  className={`p-3 rounded-xl border transition-all ${
                    field.isReadOnly
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-extrabold text-slate-900 truncate">
                      {lang === 'ar' ? field.fieldLabelAr : field.fieldLabelEn}
                    </div>
                    <div className="flex gap-1">
                      {field.isReadOnly && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'للعرض فقط' : 'Read-only'}</span>
                        </span>
                      )}
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1 rounded">
                        {field.fieldType}
                      </span>
                    </div>
                  </div>

                  <select
                    value={fieldColMap[field.fieldKey] || ''}
                    onChange={(e) =>
                      setFieldColMap({
                        ...fieldColMap,
                        [field.fieldKey]: e.target.value,
                      })
                    }
                    className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="">-- {lang === 'ar' ? 'تجاهل أو بدون تعبئة مسبقة' : 'Ignore / Leave Blank'} --</option>
                    {fileHeaders.map((h) => (
                      <option key={h} value={h}>
                        عمود: {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Validation & Quality Control */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'ar' ? 'تقرير فحص سلامة البيانات والمطابقة الجغرافية' : 'Validation & Quality Summary'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'تم فحص وجود أرقام المناطق، وعدم تكرار العملاء، والتحقق من صحة الحقول'
                  : 'Checks completed for valid regions, unique IDs, and field formats'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'تعديل المطابقة' : 'Back'}
              </button>
              <button
                onClick={handleCommitImport}
                disabled={validRows.length === 0 || isImporting}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>
                  {isImporting
                    ? lang === 'ar' ? 'جارٍ الحفظ وتوزيع السجلات...' : 'Importing...'
                    : lang === 'ar' ? `اعتماد استيراد ${validRows.length} سجل وتوزيعها` : `Confirm Import (${validRows.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* Stats KPI Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-xs font-bold">{lang === 'ar' ? 'إجمالي صفوف الملف' : 'Total Rows'}</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{rawRows.length}</span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block text-xs font-bold">{lang === 'ar' ? 'صفوف سليمة ومطابقة' : 'Valid Rows'}</span>
              <span className="text-xl font-extrabold text-emerald-800 mt-0.5 block">{validRows.length}</span>
            </div>
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-700 block text-xs font-bold">{lang === 'ar' ? 'أخطاء مستبعدة' : 'Invalid Rows'}</span>
              <span className="text-xl font-extrabold text-rose-800 mt-0.5 block">{invalidRows.length}</span>
            </div>
          </div>

          {/* Invalid Rows Box */}
          {invalidRows.length > 0 && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? `تم استبعاد ${invalidRows.length} صف لا يستوفي شروط النظام:`
                    : `Excluded Rows (${invalidRows.length}):`}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-rose-200/70 text-xs">
                {invalidRows.map((inv, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center text-[11px]">
                    <span className="font-mono text-slate-600">صف #{inv.row}</span>
                    <span className="font-bold text-rose-700">{lang === 'ar' ? inv.reasonAr : inv.reasonEn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Rows Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 p-2.5 font-bold text-slate-800 flex items-center justify-between">
              <span>{lang === 'ar' ? 'معاينة عينة من السجلات السليمة ومطابقة الحقول:' : 'Preview Valid Rows:'}</span>
              <span className="text-xs text-slate-500 font-normal">
                {lang === 'ar' ? `عرض أول ${Math.min(validRows.length, 5)} سجلات` : 'First rows'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                  <tr>
                    <th className="p-2 text-start">{lang === 'ar' ? 'المنطقة' : 'Region'}</th>
                    <th className="p-2 text-start">{lang === 'ar' ? 'رقم العميل' : 'Customer No'}</th>
                    <th className="p-2 text-start">{lang === 'ar' ? 'اسم العميل' : 'Customer Name'}</th>
                    {requestFields.slice(0, 4).map((f) => (
                      <th key={f.fieldId} className="p-2 text-start">
                        {lang === 'ar' ? f.fieldLabelAr : f.fieldLabelEn}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validRows.slice(0, 5).map((row, idx) => {
                    const regVal = row[systemColMap.regionNo];
                    const custNoVal = row[systemColMap.customerNo || fieldColMap['customer_no']];
                    const custNameVal = row[systemColMap.customerName || fieldColMap['customer_name']];

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2">
                          <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {regVal}
                          </span>
                        </td>
                        <td className="p-2 font-mono font-bold text-slate-800">{custNoVal}</td>
                        <td className="p-2 font-semibold text-slate-900">{custNameVal}</td>
                        {requestFields.slice(0, 4).map((f) => {
                          const col = fieldColMap[f.fieldKey];
                          const val = col ? row[col] : row[f.fieldKey];
                          return (
                            <td key={f.fieldId} className="p-2 text-slate-600">
                              {val !== undefined && val !== null && String(val) !== '' ? (
                                <span className={f.isReadOnly ? 'font-bold text-amber-900' : ''}>
                                  {String(val)}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Completed */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-extrabold text-slate-900">
            {lang === 'ar' ? 'تم استيراد السجلات وتوزيعها على المناديب بنجاح!' : 'Import & Assignment Completed!'}
          </h2>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {lang === 'ar'
              ? `تم اعتماد وحفظ ${importStats?.created || validRows.length} سجل وتوزيعها فورياً على مناطق المناديب في حملة "${currentRequest?.titleAr}". البيانات متاحة الآن في تطبيق الهاتف والحقول المعتمدة تظهر للعرض فقط.`
              : `${importStats?.created || validRows.length} records successfully imported and assigned to regional representatives.`}
          </p>

          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              {lang === 'ar' ? 'الرجوع لقائمة الطلبات' : 'Go to Requests'}
            </button>

            <button
              onClick={() => {
                // Find a rep from the imported regions to switch into mobile view easily
                const firstValidReg = validRows[0]?.[systemColMap.regionNo];
                const rep = users.find((u) => u.regionNo === firstValidReg || u.allowedRegionNos?.includes(firstValidReg));
                if (rep) {
                  quickSwitchUser(rep.userId);
                }
                setActiveView('mobile');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'ar' ? 'فتح واجهة الهاتف لمعاينة السجلات والمطابقة' : 'Preview in Mobile View'}</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setRawRows([]);
                setFileHeaders([]);
                setValidRows([]);
                setInvalidRows([]);
                setFileName('');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {lang === 'ar' ? 'استيراد ملف إكسل آخر' : 'Import Another File'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
