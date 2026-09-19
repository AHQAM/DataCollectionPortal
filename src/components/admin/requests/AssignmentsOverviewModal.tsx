import React from 'react';
import { X, Users, FileSpreadsheet } from 'lucide-react';
import { RequestItem, Assignment, User, Branch } from '../../../types';

interface AssignmentsOverviewModalProps {
  request: RequestItem | null;
  onClose: () => void;
  assignments: Assignment[];
  users: User[];
  branches: Branch[];
  lang: string;
  onOpenImportWizard: (requestId: string) => void;
}

export const AssignmentsOverviewModal: React.FC<AssignmentsOverviewModalProps> = ({
  request,
  onClose,
  assignments,
  users,
  branches,
  lang,
  onOpenImportWizard,
}) => {
  if (!request) return null;

  const reqAssignments = assignments.filter((a) => a.requestId === request.requestId);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              <span>{lang === 'ar' ? 'تكليفات المناديب ونسب الإنجاز' : 'Assigned Reps & Field Progress'}</span>
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              {lang === 'ar' ? request.titleAr : request.titleEn} (
              <span className="font-mono font-bold text-purple-700">{request.requestCode}</span>)
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {reqAssignments.length === 0 ? (
          <div className="p-6 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-xs">
              {lang === 'ar' ? 'لم يتم تعيين مناديب أو عملاء لهذا الطلب بعد' : 'No representatives assigned to this request yet'}
            </div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              {lang === 'ar'
                ? 'يمكنك إدراج العملاء والتوزيع التلقائي على المناديب فوراً عبر معالج استيراد Excel.'
                : 'You can import customers and auto-assign them to reps using the Excel Import Wizard.'}
            </p>
            <button
              type="button"
              onClick={() => {
                const reqId = request.requestId;
                onClose();
                onOpenImportWizard(reqId);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'فتح معالج استيراد Excel' : 'Open Excel Import Wizard'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between px-1 text-slate-500 font-bold text-[11px]">
              <span>{lang === 'ar' ? `إجمالي التكليفات: ${reqAssignments.length} مندوب` : `Total: ${reqAssignments.length} reps`}</span>
              <span>{lang === 'ar' ? `إجمالي السجلات: ${request.totalRecords || 0}` : `Total Records: ${request.totalRecords || 0}`}</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {reqAssignments.map((asg) => {
                const rep = users.find((u) => u.userId === asg.userId);
                const branch = branches.find((b) => b.branchId === asg.branchId);
                const progress = asg.totalRecords > 0 ? Math.round((asg.completedRecords / asg.totalRecords) * 100) : 0;

                return (
                  <div key={asg.assignmentId} className="p-3 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span>{rep ? (lang === 'ar' ? rep.repNameAr : rep.repNameEn || rep.repNameAr) : asg.userId}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold">
                          {asg.regionNo}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {branch ? (lang === 'ar' ? branch.branchNameAr : branch.branchNameEn) : asg.branchId} • {asg.assignmentStatus}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-end">
                        <div className="font-bold text-slate-800">
                          {asg.completedRecords} / {asg.totalRecords} {lang === 'ar' ? 'سجل' : 'records'}
                        </div>
                        <div className="text-[10px] text-slate-400">{progress}% {lang === 'ar' ? 'إنجاز' : 'done'}</div>
                      </div>
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-purple-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
