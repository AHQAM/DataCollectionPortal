import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Lock,
  Unlock,
  Smartphone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  X,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminUserImportModal } from './AdminUserImportModal';

export const AdminUsers: React.FC = () => {
  const {
    lang,
    dir,
    t,
    users,
    branches,
    regions,
    deviceBindings,
    resetUserPassword,
    unlockUser,
    releaseUserDevice,
    createUser,
    updateUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New User Form State
  const [newRole, setNewRole] = useState<UserRole>('REP');
  const [newRegionNo, setNewRegionNo] = useState('');
  const [newRepNo, setNewRepNo] = useState('');
  const [newRepNameAr, setNewRepNameAr] = useState('');
  const [newRepNameEn, setNewRepNameEn] = useState('');
  const [newBranchId, setNewBranchId] = useState(branches[0]?.branchId || '');
  const [newAllowedRegions, setNewAllowedRegions] = useState<string[]>([]);
  const [newPermissions, setNewPermissions] = useState({
    canManageUsers: false,
    canManageRequests: false,
    canManageRegions: false,
    canViewAllBranches: false
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameAr = u.repNameAr.toLowerCase().includes(q);
      const matchNameEn = (u.repNameEn || '').toLowerCase().includes(q);
      const matchReg = u.regionNo.includes(q);
      const matchRepNo = (u.repNo || '').toLowerCase().includes(q);
      if (!matchNameAr && !matchNameEn && !matchReg && !matchRepNo) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find((b) => b.branchId === newBranchId);

    const newUser: User = {
      userId: `usr_${Date.now()}`,
      username: newRegionNo,
      regionNo: newRegionNo, // Used as Email for admins/supervisors
      repNo: newRepNo,
      repNameAr: newRepNameAr,
      repNameEn: newRepNameEn,
      role: newRole,
      branchId: newBranchId,
      branchNameAr: branch?.branchNameAr || 'فرع الرياض',
      branchNameEn: branch?.branchNameEn || 'Riyadh Branch',
      allowedRegionNos: newAllowedRegions.length > 0 ? newAllowedRegions : [newRegionNo],
      permissions: newRole === 'SUPERVISOR' ? newPermissions : undefined,
      passwordHash: '1234',
      mustChangePassword: true,
      isActive: true,
      failedLoginCount: 0,
      failedLoginAttempts: 0,
      sessionVersion: 1,
      deviceBindingStatus: 'UNBOUND',
      maxAllowedDevices: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createUser(newUser);
      setShowCreateModal(false);
      showToast(lang === 'ar' ? 'تم إنشاء الحساب بنجاح (الرمز الافتراضي 1234)' : 'User created with default PIN/Password 123456');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'حدث خطأ أثناء إنشاء المستخدم');
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 end-6 z-50 bg-purple-950 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-purple-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <span>{lang === 'ar' ? 'إدارة المستخدمين والمندوبين' : 'Users & Representatives'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'إدارة صلاحيات الدخول، تعيين المناطق المتعددة، إعادة تعيين كلمات المرور وفك ارتباط الأجهزة'
              : 'User accounts, multi-region assignments, PIN reset, and device unbinding'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'ar' ? 'استيراد المستخدمين من Excel' : 'Import from Excel'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة مستخدم يدوي' : 'Add User'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث باسم المندوب، رقم المنطقة...' : 'Search by name, region...'}
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
        </div>

        <div className="flex gap-1.5 text-xs">
          {[
            { key: 'ALL', labelAr: 'الكل', labelEn: 'All' },
            { key: 'REP', labelAr: 'المناديب فقط', labelEn: 'Reps' },
            { key: 'SUPERVISOR', labelAr: 'المشرفين', labelEn: 'Supervisors' },
            { key: 'ADMIN', labelAr: 'المدراء', labelEn: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                roleFilter === tab.key
                  ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lang === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المستخدم / المندوب' : 'User'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم المنطقة (اسم الدخول)' : 'Region No'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المناطق المصرحة' : 'Allowed Regions'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الفرع' : 'Branch'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الجهاز المعتمد' : 'Bound Device'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'حالة الحساب' : 'Account Status'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الإجراءات الإدارية' : 'Admin Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                const isDeviceBound = !!u.boundDeviceId;

                return (
                  <tr key={u.userId} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">{u.repNameAr}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {u.repNo || u.role} • {u.repNameEn || ''}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-purple-950">
                      #{u.regionNo}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(u.allowedRegionNos || [u.regionNo]).map((reg) => (
                          <span
                            key={reg}
                            className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-mono text-[10px] font-bold border border-purple-200"
                          >
                            #{reg}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      {lang === 'ar' ? u.branchNameAr : u.branchNameEn}
                    </td>

                    <td className="px-4 py-3.5">
                      {isDeviceBound ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Smartphone className="w-3 h-3" />
                            <span>{u.boundDeviceLabel || 'Google Pixel'}</span>
                          </span>
                          <span className="block text-[9px] text-slate-400 font-mono truncate max-w-[120px] mt-0.5">
                            {u.boundDeviceId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {lang === 'ar' ? 'غير مرتبط بجهاز' : 'Unbound'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            <Lock className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'حساب مقفل' : 'Locked Out'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'نشط' : 'Active'}</span>
                          </span>
                        )}

                        {u.mustChangePassword && (
                          <span className="block text-[9px] font-bold text-amber-700">
                            {lang === 'ar' ? 'بانتظار تغيير كلمة المرور' : 'Pending Password Change'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Reset Password to 1234 */}
                        <button
                          onClick={() => {
                            resetUserPassword(u.userId);
                            showToast(
                              lang === 'ar'
                                ? `تمت إعادة تعيين رمز ${u.repNameAr} إلى 1234`
                                : `Reset PIN for ${u.repNameAr} to 1234`
                            );
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                          title={lang === 'ar' ? 'إعادة تعيين كلمة المرور إلى 1234' : 'Reset PIN to 1234'}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Unlock Account if Locked */}
                        {isLocked && (
                          <button
                            onClick={() => {
                              unlockUser(u.userId);
                              showToast(lang === 'ar' ? `تم إلغاء قفل الحساب` : `Account unlocked`);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                            title={lang === 'ar' ? 'إلغاء قفل الحساب' : 'Unlock Account'}
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Release Bound Device */}
                        {isDeviceBound && (
                          <button
                            onClick={() => {
                              releaseUserDevice(u.userId);
                              showToast(
                                lang === 'ar'
                                  ? `تم فك ارتباط الجهاز لحساب ${u.repNameAr}`
                                  : `Device unlinked for ${u.repNameAr}`
                              );
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200"
                            title={lang === 'ar' ? 'فك ارتباط الجهاز (السماح بهاتف جديد)' : 'Unlink Device'}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-extrabold text-sm text-slate-900">
                {lang === 'ar' ? 'إضافة مستخدم / مندوب جديد' : 'Create New User Account'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نوع الدور / الصلاحية' : 'Role'}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="REP">{lang === 'ar' ? 'مندوب مبيعات ميداني (REP)' : 'Field Representative'}</option>
                    <option value="SUPERVISOR">{lang === 'ar' ? 'مشرف فرع (SUPERVISOR)' : 'Branch Supervisor'}</option>
                    <option value="ADMIN">{lang === 'ar' ? 'مدير نظام (ADMIN)' : 'System Admin'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'الفرع' : 'Branch'}
                  </label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  >
                    {branches.map((b) => (
                      <option key={b.branchId} value={b.branchId}>
                        {lang === 'ar' ? b.branchNameAr : b.branchNameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' 
                      ? (newRole === 'REP' ? 'رقم المنطقة (اسم الدخول)' : 'البريد الإلكتروني (اسم الدخول)') 
                      : (newRole === 'REP' ? 'Primary Region No' : 'Email Address')}
                  </label>
                  <input
                    type={newRole === 'REP' ? 'text' : 'email'}
                    value={newRegionNo}
                    onChange={(e) => {
                      setNewRegionNo(e.target.value);
                      if (newRole === 'REP') {
                        setNewRepNo(`REP-${e.target.value}`);
                        setNewAllowedRegions([e.target.value]);
                      }
                    }}
                    placeholder={newRole === 'REP' ? 'مثال: 109' : 'email@example.com'}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                {newRole === 'REP' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'رقم المندوب الوظيفي' : 'Rep No'}
                    </label>
                    <input
                      type="text"
                      value={newRepNo}
                      onChange={(e) => setNewRepNo(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المندوب (بالعربية)' : 'Representative Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={newRepNameAr}
                  onChange={(e) => setNewRepNameAr(e.target.value)}
                  placeholder="مثال: عبد الرحمن المجيدي"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم المندوب (بالإنجليزية)' : 'Representative Name (English)'}
                </label>
                <input
                  type="text"
                  value={newRepNameEn}
                  onChange={(e) => setNewRepNameEn(e.target.value)}
                  placeholder="e.g. Abdulrahman Al-Majeedi"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300"
                />
              </div>

              {/* Multi-Region Assignment Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'المناطق المصرح للمندوب العمل بها (تعدد المناطق):' : 'Authorized Regions:'}
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {regions.map((reg) => {
                    const isChecked = newAllowedRegions.includes(reg.regionNo);
                    return (
                      <label
                        key={reg.regionNo}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-900 text-white border-purple-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAllowedRegions([...newAllowedRegions, reg.regionNo]);
                            } else {
                              setNewAllowedRegions(newAllowedRegions.filter((r) => r !== reg.regionNo));
                            }
                          }}
                          className="hidden"
                        />
                        #{reg.regionNo}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions for Supervisor */}
              {newRole === 'SUPERVISOR' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-2">
                    {lang === 'ar' ? 'صلاحيات المشرف الدقيقة (Granular Permissions):' : 'Supervisor Granular Permissions:'}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPermissions.canManageUsers}
                        onChange={(e) => setNewPermissions(p => ({ ...p, canManageUsers: e.target.checked }))}
                        className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                      />
                      {lang === 'ar' ? 'إدارة المستخدمين والمندوبين' : 'Manage Users & Reps'}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPermissions.canManageRequests}
                        onChange={(e) => setNewPermissions(p => ({ ...p, canManageRequests: e.target.checked }))}
                        className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                      />
                      {lang === 'ar' ? 'إدارة طلبات الجمع والنماذج' : 'Manage Requests & Forms'}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPermissions.canManageRegions}
                        onChange={(e) => setNewPermissions(p => ({ ...p, canManageRegions: e.target.checked }))}
                        className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                      />
                      {lang === 'ar' ? 'إدارة المناطق وتعيينها' : 'Manage Regions Assignments'}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPermissions.canViewAllBranches}
                        onChange={(e) => setNewPermissions(p => ({ ...p, canViewAllBranches: e.target.checked }))}
                        className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                      />
                      {lang === 'ar' ? 'رؤية بيانات جميع الفروع' : 'View All Branches Data'}
                    </label>
                  </div>
                </div>
              )}

              <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 space-y-1">
                <span className="font-bold">ملاحظات الأمان الإلزامية:</span>
                <div>• كلمة المرور الأولية للحساب الجديد هي: <strong>1234</strong></div>
                <div>• الحساب مفروض عليه تغيير كلمة المرور فور أول تسجيل دخول.</div>
                <div>• سيتم ربط الحساب تلقائياً بأول هاتف يتم تسجيل الدخول منه.</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold"
                >
                  {lang === 'ar' ? 'إنشاء وتفعيل' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel Import Modal */}
      <AdminUserImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(count) =>
          showToast(
            lang === 'ar'
              ? `تم استيراد ${count} مندوب بنجاح (كلمة المرور الافتراضية 1234 مع إلزام التغيير فوراً)`
              : `Imported ${count} representatives successfully (Default PIN 1234, change required)`
          )
        }
      />
    </div>
  );
};
