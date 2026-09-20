import React from 'react';
import { User, Branch, Region } from '../../../types';
import {
  Building2,
  CheckSquare,
  Square,
  Users,
  Check,
} from 'lucide-react';

interface SupervisorCardViewProps {
  supervisors: User[];
  branches: Branch[];
  regions: Region[];
  lang: 'ar' | 'en';
  onToggleRegion: (supervisor: User, regionNo: string) => void;
  onSelectAllInBranch: (supervisor: User, branchId: string) => void;
  onDeselectAllInBranch: (supervisor: User, branchId: string) => void;
  onClearAllRegions: (supervisor: User) => void;
  onGrantAllCompanyRegions: (supervisor: User) => void;
}

export const SupervisorCardView: React.FC<SupervisorCardViewProps> = ({
  supervisors,
  branches,
  regions,
  lang,
  onToggleRegion,
  onSelectAllInBranch,
  onDeselectAllInBranch,
  onClearAllRegions,
  onGrantAllCompanyRegions,
}) => {
  if (supervisors.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-black text-slate-700">
          {lang === 'ar' ? 'لا يوجد مشرفين يطابقون خيارات البحث' : 'No supervisors found'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar' ? 'يمكنك إضافة مشرف جديد أو تعديل فلتر البحث أعلاه' : 'Add a supervisor or adjust search filter'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {supervisors.map((supervisor) => {
        const allowedNos = new Set(supervisor.allowedRegionNos || []);
        const totalAssigned = allowedNos.size;

        return (
          <div
            key={supervisor.userId}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-purple-300"
          >
            {/* Supervisor Card Header */}
            <div className="p-5 bg-gradient-to-r from-slate-50 via-purple-50/20 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white font-black flex items-center justify-center text-base shadow-sm">
                  {supervisor.repNameAr.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{supervisor.repNameAr}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-extrabold">
                      {lang === 'ar' ? 'مشرف ميداني' : 'Supervisor'}
                    </span>
                    {!supervisor.isActive && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                        {lang === 'ar' ? 'معطل' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                    <span>
                      {lang === 'ar' ? 'الرقم الوظيفي: ' : 'Emp No: '}
                      <strong className="text-slate-800 font-mono">{supervisor.repNo || supervisor.username}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {lang === 'ar' ? 'الفرع الأساسي: ' : 'Primary Branch: '}
                      <strong className="text-purple-900 font-bold">{supervisor.branchNameAr || supervisor.branchId}</strong>
                    </span>
                    {supervisor.mobile && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{supervisor.mobile}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Coverage Status & Global Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-purple-100 text-purple-950 rounded-xl text-xs font-black">
                  {lang === 'ar'
                    ? `يشرف على ${totalAssigned} من أصل ${regions.length} منطقة`
                    : `Covers ${totalAssigned} of ${regions.length} zones`}
                </div>

                <button
                  type="button"
                  onClick={() => onGrantAllCompanyRegions(supervisor)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title={lang === 'ar' ? 'منح الإشراف على جميع مناطق المملكة' : 'Grant all company regions'}
                >
                  {lang === 'ar' ? 'تغطية كاملة (جميع المناطق)' : 'Select All Regions'}
                </button>

                <button
                  type="button"
                  onClick={() => onClearAllRegions(supervisor)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title={lang === 'ar' ? 'إلغاء كافة المناطق' : 'Clear all regions'}
                >
                  {lang === 'ar' ? 'مسح التحديد' : 'Clear All'}
                </button>
              </div>
            </div>

            {/* Branch by Branch Regions Selection Grid */}
            <div className="p-5 space-y-5">
              {branches.map((branch) => {
                const branchRegions = regions.filter((r) => r.branchId === branch.branchId);
                if (branchRegions.length === 0) return null;

                const branchAssignedCount = branchRegions.filter((r) => allowedNos.has(r.regionNo)).length;
                const isAllInBranch = branchAssignedCount === branchRegions.length;
                const isNoneInBranch = branchAssignedCount === 0;

                return (
                  <div
                    key={branch.branchId}
                    className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/40 hover:bg-slate-50/80 transition-all"
                  >
                    {/* Branch Sub-Header with Bulk Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-800" />
                        <span className="font-extrabold text-xs text-slate-900">
                          {lang === 'ar' ? branch.branchNameAr : branch.branchNameEn}
                        </span>
                        <span className="font-mono text-[10px] text-purple-900 bg-purple-100 px-2 py-0.5 rounded font-bold">
                          {branch.branchId}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          ({branchAssignedCount}/{branchRegions.length} {lang === 'ar' ? 'منطقة' : 'zones'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectAllInBranch(supervisor, branch.branchId)}
                          disabled={isAllInBranch}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'تحديد كافة مناطق هذا الفرع' : 'Select Branch'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeselectAllInBranch(supervisor, branch.branchId)}
                          disabled={isNoneInBranch}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'إلغاء تحديد الفرع' : 'Deselect Branch'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Individual Region Checkboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {branchRegions.map((region) => {
                        const isChecked = allowedNos.has(region.regionNo);

                        return (
                          <label
                            key={region.regionId}
                            onClick={() => onToggleRegion(supervisor, region.regionNo)}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all select-none ${
                              isChecked
                                ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-white text-purple-900 font-bold'
                                  : 'border border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="text-start overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-mono text-[11px] font-black px-1.5 py-0.2 rounded ${
                                    isChecked ? 'bg-purple-800 text-purple-100' : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {region.regionNo}
                                </span>
                              </div>
                              <div
                                className={`text-xs font-bold mt-0.5 truncate ${
                                  isChecked ? 'text-white' : 'text-slate-800'
                                }`}
                                title={region.regionNameAr}
                              >
                                {region.regionNameAr}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
