import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getXLSX } from '../../utils/excel';
import { RecordItem, RequestField } from '../../types';
import { RecordResponseModal } from './RecordResponseModal';
import { FileSpreadsheet, Download } from 'lucide-react';
import { ReportFilters } from './reports/ReportFilters';
import { ReportAnalysisCharts } from './reports/ReportAnalysisCharts';
import { ReportDataTable } from './reports/ReportDataTable';

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
      const val = resp[activeAnalysisField.fieldKey] ?? resp[activeAnalysisField.fieldId] ?? '';
      if (val !== undefined && val !== null && val !== '') {
        const key = String(val);
        dynamicFieldCounts[key] = (dynamicFieldCounts[key] || 0) + 1;
      }
    });
  }

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
        const val = resp[f.fieldKey] ?? resp[f.fieldId] ?? '';
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
        const val = resp[f.fieldKey] ?? resp[f.fieldId] ?? '';
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

      <ReportFilters 
        lang={lang}
        requests={requests}
        branches={branches}
        selectedReqId={selectedReqId}
        setSelectedReqId={setSelectedReqId}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedAnalysisFieldKey={setSelectedAnalysisFieldKey}
      />

      <ReportAnalysisCharts 
        lang={lang}
        totalCount={totalCount}
        submittedCount={submittedCount}
        completedCount={completedCount}
        draftCount={draftCount}
        pendingCount={pendingCount}
        responsesReceivedCount={responsesReceivedCount}
        completionRate={completionRate}
        choiceFields={choiceFields}
        activeAnalysisField={activeAnalysisField}
        selectedAnalysisFieldKey={selectedAnalysisFieldKey}
        setSelectedAnalysisFieldKey={setSelectedAnalysisFieldKey}
        dynamicFieldCounts={dynamicFieldCounts}
      />

      <ReportDataTable 
        lang={lang}
        filteredRecords={filteredRecords}
        previewFields={previewFields}
        recordResponses={recordResponses}
        setInspectingRecord={setInspectingRecord}
      />

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
