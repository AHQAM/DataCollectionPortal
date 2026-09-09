import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Branch, Region } from '../../types';
import {
  ShieldCheck,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  CheckSquare,
  Square,
  Users,
  Sliders,
  Check,
  X,
  AlertTriangle,
  UserPlus,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AdminSupervisorMatrix: React.FC = () => {
  const {
    lang,
    users,
    branches,
    regions,
    updateUser,
    createUser,
  } = useApp();

  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [activeSupervisorId, setActiveSupervisorId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Supervisor Modal
  const [showAddSupervisorModal, setShowAddSupervisorModal] = useState(false);
  const [newSupNameAr, setNewSupNameAr] = useState('');
  const [newSupNameEn, setNewSupNameEn] = useState('');
  const [newSupNo, setNewSupNo] = useState('');
  const [newSupBranchId, setNewSupBranchId] = useState(branches[0]?.branchId || '');
  const [newSupMobile, setNewSupMobile] = useState('');

  const supervisors = users.filter((u) => u.role === 'SUPERVISOR');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter supervisors
  const filteredSupervisors = supervisors.filter((sup) => {
    if (selectedBranchFilter !== 'ALL' && sup.branchId !== selectedBranchFilter) {
      // Also show if supervisor has any allowed region in that branch
      const hasRegionInBranch = regions.some(
        (r) => r.branchId === selectedBranchFilter && (sup.allowedRegionNos || []).includes(r.regionNo)
      );
      if (!hasRegionInBranch) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = sup.repNameAr.toLowerCase().includes(q) || (sup.repNameEn || '').toLowerCase().includes(q);
      const matchNo = (sup.repNo || '').toLowerCase().includes(q);
      const matchUsername = sup.username.toLowerCase().includes(q);
      if (!matchName && !matchNo && !matchUsername) return false;
    }
    return true;
  });

  // Toggle single region for a supervisor
  const handleToggleRegion = (supervisor: User, regionNo: string) => {
    const current = supervisor.allowedRegionNos || [];
    let updated: string[];
    if (current.includes(regionNo)) {
      updated = current.filter((r) => r !== regionNo);
    } else {
      updated = [...current, regionNo];
    }

    updateUser({ ...supervisor, allowedRegionNos: updated });
    showToast(
      lang === 'ar'
        ? `تم تحديث صلاحيات المشرف ${supervisor.repNameAr}`
        : `Updated permissions for ${supervisor.repNameAr}`
    );
  };

  // Bulk select all regions of a branch for a supervisor
  const handleSelectAllInBranch = (supervisor: User, branchId: string) => {
    const branchRegionNos = regions.filter((r) => r.branchId === branchId).map((r) => r.regionNo);
    const current = supervisor.allowedRegionNos || [];
    const combined = Array.from(new Set([...current, ...branchRegionNos]));

    updateUser({ ...supervisor, allowedRegionNos: combined });
    showToast(
      lang === 'ar'
        ? `تم منح الإشراف على كافة مناطق الفرع للمشرف ${supervisor.repNameAr}`
        : `Assigned all branch regions to ${supervisor.repNameAr}`
    );
  };

  // Bulk deselect all regions of a branch for a supervisor
  const handleDeselectAllInBranch = (supervisor: User, branchId: string) => {
    const branchRegionNos = new Set(regions.filter((r) => r.branchId === branchId).map((r) => r.regionNo));
    const current = supervisor.allowedRegionNos || [];
    const filtered = current.filter((rNo) => !branchRegionNos.has(rNo));

    updateUser({ ...supervisor, allowedRegionNos: filtered });
    showToast(
      lang === 'ar'
        ? `تم إلغاء مناطق هذا الفرع للمشرف ${supervisor.repNameAr}`
        : `Removed branch regions from ${supervisor.repNameAr}`
    );
  };

  // Clear all regions for a supervisor
  const handleClearAllRegions = (supervisor: User) => {
    updateUser({ ...supervisor, allowedRegionNos: [] });
    showToast(
      lang === 'ar'
        ? `تم مسح كافة المناطق للمشرف ${supervisor.repNameAr}`
        : `Cleared all assigned regions for ${supervisor.repNameAr}`
    );
  };

  // Grant all regions in the entire company
  const handleGrantAllCompanyRegions = (supervisor: User) => {
    const allNos = regions.map((r) => r.regionNo);
    updateUser({ ...supervisor, allowedRegionNos: allNos });
    showToast(
      lang === 'ar'
        ? `تم منح الإشراف على جميع مناطق المملكة للمشرف ${supervisor.repNameAr}`
        : `Granted full coverage to ${supervisor.repNameAr}`
    );
  };

  // Create new supervisor
  const handleCreateSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find((b) => b.branchId === newSupBranchId);
    const generatedUsername = `sup_${newSupNo || Date.now().toString().slice(-4)}`;

    const newSupervisor: User = {
      userId: `usr_${Date.now()}`,
      username: generatedUsername,
      regionNo: '',
      allowedRegionNos: [],
      repNo: newSupNo,
      repNameAr: newSupNameAr,
      repNameEn: newSupNameEn,
      branchId: newSupBranchId,
      branchNameAr: branch?.branchNameAr,
      branchNameEn: branch?.branchNameEn,
      role: 'SUPERVISOR',
      mobile: newSupMobile,
      mustChangePassword: false,
      isActive: true,
      failedLoginCount: 0,
      sessionVersion: 1,
      deviceBindingStatus: 'UNBOUND',
      maxAllowedDevices: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createUser(newSupervisor);
    setShowAddSupervisorModal(false);
    setNewSupNameAr('');
    setNewSupNameEn('');
    setNewSupNo('');
    setNewSupMobile('');
    showToast(
      lang === 'ar'
        ? `تمت إضافة المشرف ${newSupNameAr} بنجاح إلى ماستر داتا المستخدمين`
        : `Supervisor ${newSupNameAr} created successfully`
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>{lang === 'ar' ? 'مصفوفة صلاحيات المشرفين (بيانات أساسية)' : 'Supervisor Permissions Matrix (Master Data)'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {lang === 'ar'
              ? 'تحديد المناطق الميدانية التي يشرف عليها كل مشرف بدقة. يمكن للمشرف الإشراف على مناطق متعددة عبر عدة فروع، أو الاقتصار على بعض مناطق الفرع فقط، بمعزل تام عن السجلات أو الطلبات.'
              : 'Directly manage the regional supervisory scope for each supervisor. Assign individual zones across multiple branches or subset regions independent of transaction records.'}
          </p>
        </div>

        {/* View toggles & Add Supervisor */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-purple-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'بطاقات المشرفين التفصيلية' : 'Supervisor Cards'}
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-purple-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'مصفوفة المقارنة الشاملة (Grid)' : '2D Matrix Grid'}
            </button>
          </div>

          <button
            onClick={() => setShowAddSupervisorModal(true)}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة مشرف جديد' : 'New Supervisor'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">{lang === 'ar' ? 'إجمالي المشرفين' : 'Supervisors'}</div>
          <div className="text-2xl font-black text-purple-950 mt-1">{supervisors.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">{lang === 'ar' ? 'إجمالي الفروع' : 'Branches'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{branches.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">{lang === 'ar' ? 'إجمالي المناطق الميدانية' : 'Total Regions'}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{regions.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">{lang === 'ar' ? 'مناطق تحت إشراف نشط' : 'Supervised Zones'}</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {
              new Set(
                supervisors.flatMap((s) => s.allowedRegionNos || [])
              ).size
            } / {regions.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث باسم المشرف، الرقم الوظيفي...' : 'Search supervisor name or number...'}
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">{lang === 'ar' ? 'تصفية حسب الفرع:' : 'Filter by Branch:'}</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">{lang === 'ar' ? 'جميع الفروع' : 'All Branches'}</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {lang === 'ar' ? b.branchNameAr : b.branchNameEn} ({b.branchId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SUPERVISOR CARDS VIEW (Detailed branch-by-branch permission controls) */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredSupervisors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-black text-slate-700">
                {lang === 'ar' ? 'لا يوجد مشرفين يطابقون خيارات البحث' : 'No supervisors found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'ar' ? 'يمكنك إضافة مشرف جديد أو تعديل فلتر البحث أعلاه' : 'Add a supervisor or adjust search filter'}
              </p>
            </div>
          ) : (
            filteredSupervisors.map((supervisor) => {
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
                        onClick={() => handleGrantAllCompanyRegions(supervisor)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title={lang === 'ar' ? 'منح الإشراف على جميع مناطق المملكة' : 'Grant all company regions'}
                      >
                        {lang === 'ar' ? 'تغطية كاملة (جميع المناطق)' : 'Select All Regions'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleClearAllRegions(supervisor)}
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
                                onClick={() => handleSelectAllInBranch(supervisor, branch.branchId)}
                                disabled={isAllInBranch}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'تحديد كافة مناطق هذا الفرع' : 'Select Branch'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeselectAllInBranch(supervisor, branch.branchId)}
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
                                  onClick={() => handleToggleRegion(supervisor, region.regionNo)}
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
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: 2D MATRIX GRID VIEW (High-level cross-comparison table) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900">
              {lang === 'ar' ? 'جدول التقاطع (المشرفين × المناطق الميدانية)' : 'Cross Matrix (Supervisors × Field Zones)'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {lang === 'ar' ? 'انقر على أي مربع لتفعيل أو إلغاء الإشراف مباشرة' : 'Click any cell to toggle supervision'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <th className="p-3 text-start sticky start-0 bg-slate-100 z-10 min-w-[200px]">
                    {lang === 'ar' ? 'المشرف' : 'Supervisor'}
                  </th>
                  <th className="p-3 text-center min-w-[90px]">
                    {lang === 'ar' ? 'إجمالي المناطق' : 'Total Zones'}
                  </th>
                  {regions.map((reg) => (
                    <th key={reg.regionId} className="p-2 text-center min-w-[80px] border-s border-slate-200">
                      <div className="font-mono text-purple-900 font-bold">{reg.regionNo}</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate max-w-[90px] mx-auto" title={reg.regionNameAr}>
                        {reg.regionNameAr}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupervisors.map((sup) => {
                  const allowed = new Set(sup.allowedRegionNos || []);

                  return (
                    <tr key={sup.userId} className="hover:bg-purple-50/20 transition-colors">
                      <td className="p-3 font-bold text-slate-900 sticky start-0 bg-white shadow-xs z-10">
                        <div>{sup.repNameAr}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">{sup.repNo || sup.username}</div>
                      </td>
                      <td className="p-3 text-center font-black text-purple-900 font-mono">
                        {allowed.size}
                      </td>
                      {regions.map((reg) => {
                        const isSupervised = allowed.has(reg.regionNo);

                        return (
                          <td
                            key={reg.regionId}
                            onClick={() => handleToggleRegion(sup, reg.regionNo)}
                            className={`p-2 text-center border-s border-slate-100 cursor-pointer transition-colors ${
                              isSupervised ? 'bg-purple-100/60 hover:bg-purple-200/80' : 'hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {isSupervised ? (
                                <div className="w-5 h-5 rounded bg-purple-900 text-white flex items-center justify-center font-bold">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded border border-slate-300" />
                              )}
                            </div>
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW SUPERVISOR */}
      {/* ========================================================================= */}
      {showAddSupervisorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-900" />
                <span>{lang === 'ar' ? 'إضافة مشرف ميداني جديد' : 'New Field Supervisor'}</span>
              </h3>
              <button
                onClick={() => setShowAddSupervisorModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupervisor} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المشرف (بالعربية)' : 'Supervisor Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={newSupNameAr}
                  onChange={(e) => setNewSupNameAr(e.target.value)}
                  placeholder="مثال: م. عبدالله القحطاني"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الرقم الوظيفي / كود المشرف' : 'Employee ID / Code'} *
                </label>
                <input
                  type="text"
                  value={newSupNo}
                  onChange={(e) => setNewSupNo(e.target.value)}
                  placeholder="مثال: SUP-101"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'الفرع الأساسي' : 'Primary Branch'} *
                </label>
                <select
                  value={newSupBranchId}
                  onChange={(e) => setNewSupBranchId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.branchId} value={b.branchId}>
                      {lang === 'ar' ? b.branchNameAr : b.branchNameEn} ({b.branchId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'رقم الجوال' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={newSupMobile}
                  onChange={(e) => setNewSupMobile(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupervisorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black shadow-sm transition-all cursor-pointer"
                >
                  {lang === 'ar' ? 'إضافة المشرف' : 'Create Supervisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
