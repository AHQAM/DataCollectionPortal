import React from "react";
import { Eye } from "lucide-react";
import { RecordItem, RequestField } from "../../../types";

interface Props {
  lang: string;
  filteredRecords: RecordItem[];
  previewFields: RequestField[];
  recordResponses: Record<string, any>;
  setInspectingRecord: (record: RecordItem) => void;
}

export const ReportDataTable: React.FC<Props> = ({
  lang,
  filteredRecords,
  previewFields,
  recordResponses,
  setInspectingRecord,
}) => {
  // Get field response value safely
  const getFieldValue = (record: RecordItem, field: RequestField) => {
    const resp = recordResponses[record.recordId] || record.rawData || {};
    return resp[field.fieldKey] ?? resp[field.fieldId] ?? "";
  };

  // Render preview cell value
  const renderCellValue = (record: RecordItem, field: RequestField) => {
    const val = getFieldValue(record, field);
    if (val === undefined || val === null || val === "") {
      return <span className="text-slate-400">-</span>;
    }

    if (typeof val === "boolean" || val === "true" || val === "false") {
      const isTrue = val === true || val === "true";
      return (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isTrue
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isTrue
            ? lang === "ar"
              ? "نعم"
              : "Yes"
            : lang === "ar"
              ? "لا"
              : "No"}
        </span>
      );
    }

    if (
      field.fieldType === "photo" ||
      (typeof val === "string" &&
        (val.startsWith("http") || val.startsWith("data:image")))
    ) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
          📷 {lang === "ar" ? "صورة مرفقة" : "Photo"}
        </span>
      );
    }

    if (field.fieldType === "gps") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
          📍 {lang === "ar" ? "موقع GPS" : "GPS"}
        </span>
      );
    }

    if (field.options && field.options.length > 0) {
      const opt = field.options.find(
        (o) => o.value === String(val) || o.id === String(val),
      );
      if (opt) {
        return (
          <span className="font-semibold text-slate-800">
            {lang === "ar" ? opt.labelAr : opt.labelEn}
          </span>
        );
      }
    }

    return (
      <span className="font-medium text-slate-800 truncate max-w-[150px] inline-block">
        {String(val)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="font-extrabold text-xs text-slate-900 block">
            {lang === "ar"
              ? `معاينة السجلات والاستجابات (${filteredRecords.length} سجل)`
              : `Records & Responses Preview (${filteredRecords.length})`}
          </span>
          <span className="text-[11px] text-slate-400">
            {lang === "ar"
              ? 'انقر على أي سجل أو على زر "عرض" للاطلاع على كافة الإجابات والصور والإحداثيات'
              : 'Click on any record or the "View" button to inspect all responses, photos, and coordinates'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-start">
                {lang === "ar"
                  ? "الجهة المستهدفة / السجل"
                  : "Target Entity / Record"}
              </th>
              <th className="px-4 py-3 text-start">
                {lang === "ar" ? "المنطقة والمستخدم" : "Region & User"}
              </th>
              <th className="px-4 py-3 text-start">
                {lang === "ar" ? "الفرع" : "Branch"}
              </th>
              {/* Dynamic Form Field Columns */}
              {previewFields.map((field) => (
                <th key={field.fieldId} className="px-4 py-3 text-start">
                  {lang === "ar" ? field.fieldLabelAr : field.fieldLabelEn}
                </th>
              ))}
              <th className="px-4 py-3 text-start">
                {lang === "ar" ? "الحالة" : "Status"}
              </th>
              <th className="px-4 py-3 text-center">
                {lang === "ar" ? "الإجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={5 + previewFields.length}
                  className="px-4 py-8 text-center text-slate-400 text-xs"
                >
                  {lang === "ar"
                    ? "لا توجد سجلات مطابقة للفلتر المحدد"
                    : "No records match the selected filter"}
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                return (
                  <tr
                    key={r.recordId}
                    onClick={() => setInspectingRecord(r)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                        {r.targetName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.targetId}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">
                        {r.userName || "-"}
                      </div>
                      <span className="text-[10px] font-mono text-purple-700">
                        #{r.assignedRegionNo || r.regionNo || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {r.branchName || r.branchId || "-"}
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
                          r.recordStatus === "Completed" ||
                          r.recordStatus === "Submitted"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : r.recordStatus === "DraftSaved"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {r.recordStatus === "Submitted"
                          ? lang === "ar"
                            ? "تم الإرسال"
                            : "Submitted"
                          : r.recordStatus === "Completed"
                            ? lang === "ar"
                              ? "مكتمل"
                              : "Completed"
                            : r.recordStatus === "DraftSaved"
                              ? lang === "ar"
                                ? "مسودة"
                                : "Draft"
                              : r.recordStatus}
                      </span>
                    </td>

                    <td
                      className="px-4 py-3.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setInspectingRecord(r)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          {lang === "ar" ? "عرض الاستجابة" : "View Response"}
                        </span>
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
  );
};
