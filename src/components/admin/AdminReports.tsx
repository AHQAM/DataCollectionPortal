import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
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
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { lang, t, requests, records, branches, regions, recordResponses, fields } = useApp();

  const [selectedReqId, setSelectedReqId] = useState<string>(
    requests.length > 0 ? requests[0].requestId : ''
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const currentRequest = requests.find((r) => r.requestId === selectedReqId);
  const currentFields = fields.filter((f) => f.requestId === selectedReqId);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedReqId && r.requestId !== selectedReqId) return false;
    if (selectedBranchId !== 'ALL' && r.branchId !== selectedBranchId) return false;
    if (selectedStatus !== 'ALL' && r.recordStatus !== selectedStatus) return false;
    return true;
  });

  // Calculate Zero Stock Reason Breakdown
  const zeroStockCounts: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    const resp = recordResponses[r.recordId];
    if (resp?.zero_stock_reason) {
      const reason = resp.zero_stock_reason;
      zeroStockCounts[reason] = (zeroStockCounts[reason] || 0) + 1;
    }
  });

  const reasonLabels: Record<string, { ar: string; en: string }> = {
    late_delivery: { ar: 'تأخر التوريد من المستودع', en: 'Warehouse Delivery Delay' },
    high_demand: { ar: 'طلب استثنائي غير متوقع', en: 'Unexpected High Demand' },
    supply_shortage: { ar: 'نقص خام لدى المورّد', en: 'Raw Material Shortage' },
    expired_pulled: { ar: 'سحب المنتج لانتهاء الصلاحية', en: 'Pulled Due to Expiry' },
    shelf_full_other: { ar: 'الرف ممتلئ بمنتج منافس', en: 'Competitor Occupying Shelf' },
    other_reason: { ar: 'أسباب أخرى (مفصلة في النموذج)', en: 'Other Specific Reasons' },
  };

  // Export full Excel sheet with both customer info and field responses!
  const handleExportFullExcel = () => {
    const exportData = filteredRecords.map((r) => {
      const resp = recordResponses[r.recordId] || {};
      const row: Record<string, any> = {
        'رمز الطلب / Code': currentRequest?.requestCode || '',
        'اسم الحملة / Campaign': currentRequest?.titleAr || '',
        'رقم المنطقة / Region': r.assignedRegionNo,
        'المندوب / Rep': r.repName,
        'الفرع / Branch': r.branchName,
        'رقم العميل / Customer No': r.customerNo,
        'اسم العميل / Customer Name': r.customerName,
        'قيمة المخزون / Inv Value': r.inventoryValue || 0,
        'الحالة / Status': r.recordStatus,
        'تاريخ التحديث / Updated': r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '',
      };

      // Add dynamic form field responses as columns!
      currentFields.forEach((f) => {
        const colTitle = `${f.fieldLabelAr} (${f.fieldKey})`;
        row[colTitle] = resp[f.fieldKey] !== undefined ? String(resp[f.fieldKey]) : '';
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FieldResponses');
    const filename = `${currentRequest?.requestCode || 'Export'}_Full_Responses_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleExportCSV = () => {
    const exportData = filteredRecords.map((r) => {
      const resp = recordResponses[r.recordId] || {};
      return {
        RequestCode: currentRequest?.requestCode || '',
        RegionNo: r.assignedRegionNo,
        RepName: r.repName,
        BranchName: r.branchName,
        CustomerNo: r.customerNo,
        CustomerName: r.customerName,
        Status: r.recordStatus,
        ZeroStockReason: resp.zero_stock_reason || '',
        CustomerVisited: resp.customer_visited ? 'Yes' : 'No',
        OrderTaken: resp.order_taken ? 'Yes' : 'No',
        ExpectedOrderValue: resp.expected_order_value || 0,
        UpdatedAt: r.updatedAt,
      };
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
              ? 'استخراج كافة البيانات الميدانية والاستجابات المصنفة وتصديرها بصيغتي XLSX و CSV'
              : 'Export completed records and field responses to Excel (.xlsx) and CSV'}
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {lang === 'ar' ? 'الطلب / الحملة' : 'Request Campaign'}
          </label>
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white"
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
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white"
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
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white"
          >
            <option value="ALL">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="Completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
            <option value="DraftSaved">{lang === 'ar' ? 'مسودة' : 'Draft Saved'}</option>
            <option value="Pending">{lang === 'ar' ? 'معلق' : 'Pending'}</option>
          </select>
        </div>
      </div>

      {/* Analytics Card: Zero Stock Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-700" />
            <h2 className="font-extrabold text-sm text-slate-900">
              {lang === 'ar' ? 'تحليل أسباب نفاد المخزون (Zero Stock Root Causes)' : 'Zero Stock Reasons Analysis'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {Object.values(zeroStockCounts).reduce((a, b) => a + b, 0)} {lang === 'ar' ? 'استجابة مصنفة' : 'responses'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {Object.entries(zeroStockCounts).map(([reasonKey, count]) => {
            const label = reasonLabels[reasonKey] || { ar: reasonKey, en: reasonKey };
            return (
              <div key={reasonKey} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 block">
                    {lang === 'ar' ? label.ar : label.en}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{reasonKey}</span>
                </div>
                <span className="text-lg font-black text-purple-900 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-slate-800">
            {lang === 'ar' ? `معاينة السجلات (${filteredRecords.length} سجل)` : `Records Preview (${filteredRecords.length})`}
          </span>
          <span className="text-[11px] text-slate-400">
            {lang === 'ar' ? 'يتضمن الردود الميدانية والصور والإحداثيات' : 'Includes field responses, GPS, photos'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المنطقة والمندوب' : 'Region & Rep'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'سبب النفاد' : 'Zero Stock Reason'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'طلب جديد؟' : 'Order Taken?'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const resp = recordResponses[r.recordId] || {};
                const reasonKey = resp.zero_stock_reason;
                const reason = reasonKey ? reasonLabels[reasonKey] : null;

                return (
                  <tr key={r.recordId} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{r.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.customerNo}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{r.repName}</div>
                      <span className="text-[10px] font-mono text-purple-700">#{r.assignedRegionNo}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {r.branchName}
                    </td>

                    <td className="px-4 py-3.5">
                      {reason ? (
                        <span className="font-semibold text-slate-800">
                          {lang === 'ar' ? reason.ar : reason.en}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {resp.order_taken !== undefined ? (
                        <span
                          className={`font-bold ${
                            resp.order_taken ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {resp.order_taken ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.recordStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.recordStatus === 'DraftSaved'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.recordStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
