import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getXLSX } from '../../utils/excel';
import { RecordItem, RequestField } from '../../types';
import { RecordResponseModal } from './RecordResponseModal';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  PieChart,
  BarChart3,
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { lang, requests, records, branches, recordResponses, fields } = useApp();

  const [selectedReqId, setSelectedReqId] = useState<string>(
    requests.length > 0 ? requests[0].requestId : ''
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Record for viewing full response modal
  const [inspectingRecord, setInspectingRecord] = useState<RecordItem | null>(null);

  // Selected choice field for dynamic chart / distribution
  const [selectedAnalysisFieldKey, setSelectedAnalysisFieldKey] = useState<string>('');

  const currentRequest = requests.find((r) => r.requestId === selectedReqId);
  const currentFields: RequestField[] = fields
    .filter((f) => f.requestId === selectedReqId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedReqId && r.requestId !== selectedReqId) return false;
    if (selectedBranchId !== 'ALL' && r.branchId !== selectedBranchId) return false;
    if (selectedStatus !== 'ALL' && r.recordStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = r.customerName?.toLowerCase().includes(q) || r.customerNo?.toLowerCase().includes(q);
      const matchRep = r.repName?.toLowerCase().includes(q) || r.assignedRegionNo?.toLowerCase().includes(q);
      if (!matchCustomer && !matchRep) return false;
    }
    return true;
  });

  // Calculate campaign metrics
  const totalCount = filteredRecords.length;
  const completedCount = filteredRecords.filter((r) => r.recordStatus === 'Completed').length;
  const submittedCount = filteredRecords.filter((r) => r.recordStatus === 'Submitted').length;
  const draftCount = filteredRecords.filter((r) => r.recordStatus === 'DraftSaved').length;
  const pendingCount = filteredRecords.filter((r) => r.recordStatus === 'Pending').length;

  const responsesReceivedCount = filteredRecords.filter((r) => {
    const resp = recordResponses[r.recordId] || r.rawData;
    return resp && Object.keys(resp).length > 0;
  }).length;

  const completionRate = totalCount > 0 ? Math.round(((completedCount + submittedCount) / totalCount) * 100) : 0;

  // Find choice/dropdown/radio fields for dynamic analysis
  const choiceFields = currentFields.filter(
    (f) =>
      f.fieldType === 'select' ||
      f.fieldType === 'single_choice' ||
      f.fieldType === 'radio' ||
      f.fieldType === 'searchable_dropdown' ||
      f.fieldType === 'yes_no' ||
      (f.options && f.options.length > 0)
  );

  // Active field for analysis breakdown (default to first choice field if available)
  const activeAnalysisField =
    choiceFields.find((f) => f.fieldKey === selectedAnalysisFieldKey) || choiceFields[0];

  // Calculate breakdown for the active analysis field
  const dynamicFieldCounts: Record<string, number> = {};
  if (activeAnalysisField) {
    filteredRecords.forEach((r) => {
      const resp = recordResponses[r.recordId] || r.rawData || {};
      const val = resp[activeAnalysisField.fieldKey] ?? resp[activeAnalysisField.fieldId] ?? (activeAnalysisField as any).id;
      if (val !== undefined && val !== null && val !== '') {
        const key = String(val);
        dynamicFieldCounts[key] = (dynamicFieldCounts[key] || 0) + 1;
      }
    });
  }

  // Get field response value safely
  const getFieldValue = (record: RecordItem, field: RequestField) => {
    const resp = recordResponses[record.recordId] || record.rawData || {};
    return resp[field.fieldKey] ?? resp[field.fieldId] ?? (field as any).id;
  };

  // Render preview cell value
  const renderCellValue = (record: RecordItem, field: RequestField) => {
    const val = getFieldValue(record, field);
    if (val === undefined || val === null || val === '') {
      return <span className="text-slate-400">-</span>;
    }

    if (typeof val === 'boolean' || val === 'true' || val === 'false') {
      const isTrue = val === true || val === 'true';
      return (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isTrue ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isTrue ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
        </span>
      );
    }

    if (field.fieldType === 'photo' || (typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:image')))) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
          📷 {lang === 'ar' ? 'صورة مرفقة' : 'Photo'}
        </span>
      );
    }

    if (field.fieldType === 'gps') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
          📍 {lang === 'ar' ? 'موقع GPS' : 'GPS'}
        </span>
      );
    }

    if (field.options && field.options.length > 0) {
      const opt = field.options.find((o) => o.value === String(val) || o.id === String(val));
      if (opt) {
        return <span className="font-semibold text-slate-800">{lang === 'ar' ? opt.labelAr : opt.labelEn}</span>;
      }
    }

    return <span className="font-medium text-slate-800 truncate max-w-[150px] inline-block">{String(val)}</span>;
  };

  // Export full Excel sheet
  const handleExportFullExcel = async () => {
    const XLSX = await getXLSX();
    const exportData = filteredRecords.map((r) => {
      const resp = recordResponses[r.recordId] || r.rawData || {};
      const row: Record<string, any> = {
        'رمز الطلب / Code': currentRequest?.requestCode || '',
        'اسم الحملة / Campaign': currentRequest?.titleAr || '',
        'رقم المنطقة / Region': r.assignedRegionNo || r.regionNo || '',
        'المندوب / Rep': r.repName || '',
        'الفرع / Branch': r.branchName || '',
        'رقم العميل / Customer No': r.customerNo || '',
        'اسم العميل / Customer Name': r.customerName || '',
        'الحالة / Status': r.recordStatus || '',
        'تاريخ التحديث / Updated': r.submittedAt || r.updatedAt ? new Date(r.submittedAt || r.updatedAt).toLocaleString() : '',
      };

      // Add all dynamic form fields
      currentFields.forEach((f) => {
        const colTitle = `${f.fieldLabelAr} (${f.fieldKey})`;
        const val = resp[f.fieldKey] ?? resp[f.fieldId] ?? (f as any).id ?? '';
        row[colTitle] = typeof val === 'object' ? JSON.stringify(val) : String(val);
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');
    const filename = `${currentRequest?.requestCode || 'Report'}_Responses_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // Export CSV
  const handleExportCSV = async () => {
    const XLSX = await getXLSX();
    const exportData = filteredRecords.map((r) => {
      const resp = recordResponses[r.recordId] || r.rawData || {};
      const row: Record<string, any> = {
        RequestCode: currentRequest?.requestCode || '',
        RegionNo: r.assignedRegionNo || r.regionNo || '',
        RepName: r.repName || '',
        BranchName: r.branchName || '',
        CustomerNo: r.customerNo || '',
        CustomerName: r.customerName || '',
        Status: r.recordStatus || '',
        UpdatedAt: r.submittedAt || r.updatedAt || '',
      };

      currentFields.forEach((f) => {
        const val = resp[f.fieldKey] ?? resp[f.fieldId] ?? (f as any).id ?? '';
        row[f.fieldKey] = typeof val === 'object' ? JSON.stringify(val) : String(val);
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentRequest?.requestCode || 'Report'}_Summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Up to 4 fields to display directly in the table
  const previewFields = currentFields.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-700" />
            <span>{lang === 'ar' ? 'مركز التقارير وتصدير إكسل' : 'Reports & Excel Export Center'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'استعراض الردود الميدانية، تفاصيل الاستجابات، وتصدير البيانات بصيغتي XLSX و CSV'
              : 'Inspect field responses, view complete answers, and export to Excel (.xlsx) and CSV'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handleExportFullExcel}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تصدير Excel كامل (.xlsx)' : 'Export Full Excel'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === 'ar' ? 'الطلب / الحملة' : 'Request Campaign'}
          </label>
          <select
            value={selectedReqId}
            onChange={(e) => {
              setSelectedReqId(e.target.value);
              setSelectedAnalysisFieldKey('');
            }}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
          >
            {requests.map((r) => (
              <option key={r.requestId} value={r.requestId}>
                {r.requestCode} - {lang === 'ar' ? r.titleAr : r.titleEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === 'ar' ? 'الفرع' : 'Branch'}
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
          >
            <option value="ALL">{lang === 'ar' ? 'جميع الفروع' : 'All Branches'}</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {lang === 'ar' ? b.branchNameAr : b.branchNameEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === 'ar' ? 'حالة السجل' : 'Record Status'}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
          >
            <option value="ALL">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="Submitted">{lang === 'ar' ? 'تم الإرسال' : 'Submitted'}</option>
            <option value="Completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
            <option value="DraftSaved">{lang === 'ar' ? 'مسودة محفوظة' : 'Draft Saved'}</option>
            <option value="Pending">{lang === 'ar' ? 'معلق' : 'Pending'}</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === 'ar' ? 'بحث بالعميل أو المندوب' : 'Search Customer / Rep'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث بالاسم أو الكود...' : 'Search by name or code...'}
              className="w-full h-10 px-3 ps-8 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-xs font-semibold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-3" />
          </div>
        </div>
      </div>

      {/* Campaign Summary & Dynamic Field Insights */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
            <span className="text-[11px] font-bold text-purple-700 block mb-1">
              {lang === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
            </span>
            <div className="text-xl font-black text-purple-950">{totalCount}</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-bold">{submittedCount + completedCount} {lang === 'ar' ? 'مكتمل/مرسل' : 'Done'}</span>
              <span>•</span>
              <span className="text-amber-700">{draftCount} {lang === 'ar' ? 'مسودة' : 'Draft'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-700 block mb-1">
              {lang === 'ar' ? 'الاستجابات المستلمة' : 'Responses Received'}
            </span>
            <div className="text-xl font-black text-emerald-950">{responsesReceivedCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {lang === 'ar' ? `من أصل ${totalCount} سجل` : `Out of ${totalCount} records`}
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
            <span className="text-[11px] font-bold text-blue-700 block mb-1">
              {lang === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate'}
            </span>
            <div className="text-xl font-black text-blue-950">{completionRate}%</div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">
              {lang === 'ar' ? 'حقول النموذج' : 'Form Fields'}
            </span>
            <div className="text-xl font-black text-slate-900">{currentFields.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {lang === 'ar' ? 'حقل مخصص بالحملة' : 'Custom campaign fields'}
            </div>
          </div>
        </div>

        {/* Dynamic Field Breakdown Section */}
        {choiceFields.length > 0 ? (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-700" />
                <h2 className="font-extrabold text-xs text-slate-900">
                  {lang === 'ar' ? 'تحليل توزيع إجابات الحقول' : 'Field Responses Distribution Analysis'}
                </h2>
              </div>

              {choiceFields.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-bold">{lang === 'ar' ? 'الحقل:' : 'Field:'}</span>
                  <select
                    value={activeAnalysisField?.fieldKey || ''}
                    onChange={(e) => setSelectedAnalysisFieldKey(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-slate-300 font-semibold bg-white text-xs text-slate-800"
                  >
                    {choiceFields.map((f) => (
                      <option key={f.fieldKey} value={f.fieldKey}>
                        {lang === 'ar' ? f.fieldLabelAr : f.fieldLabelEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {Object.keys(dynamicFieldCounts).length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                {lang === 'ar'
                  ? `لا توجد استجابات مسجلة بعد للحقل (${lang === 'ar' ? activeAnalysisField?.fieldLabelAr : activeAnalysisField?.fieldLabelEn}).`
                  : `No responses recorded yet for field (${activeAnalysisField?.fieldLabelEn}).`}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                {Object.entries(dynamicFieldCounts).map(([optVal, count]) => {
                  const optMatch = activeAnalysisField?.options?.find(
                    (o) => o.value === optVal || o.id === optVal
                  );
                  const displayLabel = optMatch
                    ? lang === 'ar'
                      ? optMatch.labelAr
                      : optMatch.labelEn
                    : optVal === 'true'
                    ? lang === 'ar'
                      ? 'نعم'
                      : 'Yes'
                    : optVal === 'false'
                    ? lang === 'ar'
                      ? 'لا'
                      : 'No'
                    : optVal;

                  const percent = Math.round((count / (responsesReceivedCount || 1)) * 100);

                  return (
                    <div
                      key={optVal}
                      className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 flex items-center justify-between"
                    >
                      <div className="truncate me-2">
                        <span className="font-bold text-purple-950 block truncate">{displayLabel}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                      </div>
                      <span className="text-base font-black text-purple-900 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-2xs">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* If no choice fields, show Status Distribution */
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-700" />
              <h2 className="font-extrabold text-xs text-slate-900">
                {lang === 'ar' ? 'توزيع حالات السجلات' : 'Record Status Distribution'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                <span className="font-bold text-emerald-900">{lang === 'ar' ? 'تم الإرسال' : 'Submitted'}</span>
                <span className="font-black text-emerald-800">{submittedCount}</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                <span className="font-bold text-blue-900">{lang === 'ar' ? 'مكتمل' : 'Completed'}</span>
                <span className="font-black text-blue-800">{completedCount}</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex justify-between items-center">
                <span className="font-bold text-amber-900">{lang === 'ar' ? 'مسودة' : 'Draft'}</span>
                <span className="font-black text-amber-800">{draftCount}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">{lang === 'ar' ? 'معلق' : 'Pending'}</span>
                <span className="font-black text-slate-800">{pendingCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-xs text-slate-900 block">
              {lang === 'ar'
                ? `معاينة السجلات والاستجابات (${filteredRecords.length} سجل)`
                : `Records & Responses Preview (${filteredRecords.length})`}
            </span>
            <span className="text-[11px] text-slate-400">
              {lang === 'ar'
                ? 'انقر على أي سجل أو على زر "عرض" للاطلاع على كافة الإجابات والصور والإحداثيات'
                : 'Click on any record or the "View" button to inspect all responses, photos, and coordinates'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المنطقة والمندوب' : 'Region & Rep'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>

                {/* Dynamic Form Field Columns */}
                {previewFields.map((field) => (
                  <th key={field.fieldId} className="px-4 py-3 text-start">
                    {lang === 'ar' ? field.fieldLabelAr : field.fieldLabelEn}
                  </th>
                ))}

                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + previewFields.length}
                    className="px-4 py-8 text-center text-slate-400 text-xs"
                  >
                    {lang === 'ar' ? 'لا توجد سجلات مطابقة للفلتر المحدد' : 'No records match the selected filter'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const hasResponse = Boolean(
                    recordResponses[r.recordId] ||
                      (r.rawData && Object.keys(r.rawData).length > 0)
                  );

                  return (
                    <tr
                      key={r.recordId}
                      onClick={() => setInspectingRecord(r)}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                          {r.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.customerNo}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{r.repName || '-'}</div>
                        <span className="text-[10px] font-mono text-purple-700">
                          #{r.assignedRegionNo || r.regionNo || '-'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {r.branchName || r.branchId || '-'}
                      </td>

                      {/* Dynamic Form Field Cells */}
                      {previewFields.map((field) => (
                        <td key={field.fieldId} className="px-4 py-3.5">
                          {renderCellValue(r, field)}
                        </td>
                      ))}

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            r.recordStatus === 'Completed' || r.recordStatus === 'Submitted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : r.recordStatus === 'DraftSaved'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {r.recordStatus === 'Submitted'
                            ? lang === 'ar'
                              ? 'تم الإرسال'
                              : 'Submitted'
                            : r.recordStatus === 'Completed'
                            ? lang === 'ar'
                              ? 'مكتمل'
                              : 'Completed'
                            : r.recordStatus === 'DraftSaved'
                            ? lang === 'ar'
                              ? 'مسودة'
                              : 'Draft'
                            : r.recordStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectingRecord(r)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'عرض الاستجابة' : 'View Response'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Details Modal */}
      {inspectingRecord && (
        <RecordResponseModal
          record={inspectingRecord}
          request={currentRequest}
          fields={currentFields}
          response={recordResponses[inspectingRecord.recordId] || inspectingRecord.rawData}
          onClose={() => setInspectingRecord(null)}
        />
      )}
    </div>
  );
};
