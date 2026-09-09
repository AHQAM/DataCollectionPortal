import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShareRepLinkModal } from '../common/ShareRepLinkModal';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Building,
  Building2,
  Layers,
  TrendingUp,
  UploadCloud,
  FilePlus,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Lock,
  Smartphone,
  AlertOctagon,
  Trash2,
  Check,
  X,
  Sparkles,
  Share2,
  Settings,
} from 'lucide-react';

interface Props {
  onNavigate: (module: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onNavigate }) => {
  const {
    lang,
    dir,
    t,
    requests,
    records,
    assignments,
    users,
    branches,
    regions,
    auditLogs,
  } = useApp();

  const [showShareModal, setShowShareModal] = useState(false);

  // Calculations
  const activeRequests = requests.filter((r) => r.status === 'Published').length;
  const draftRequests = requests.filter((r) => r.status === 'Draft').length;
  const closedRequests = requests.filter((r) => r.status === 'Closed').length;
  const archivedRequests = requests.filter((r) => r.status === 'Archived').length;

  const totalAssignedRecords = records.length;
  const completedRecords = records.filter((r) => r.recordStatus === 'Completed').length;
  const pendingRecords = records.filter((r) => r.recordStatus === 'Pending' || r.recordStatus === 'DraftSaved').length;
  const overallPercentage = totalAssignedRecords > 0 ? Math.round((completedRecords / totalAssignedRecords) * 100) : 0;

  const lockedUsersCount = users.filter((u) => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length;

  // Branch statistics
  const branchStats = branches.map((branch) => {
    const branchRecords = records.filter((r) => r.branchId === branch.branchId);
    const completed = branchRecords.filter((r) => r.recordStatus === 'Completed').length;
    const total = branchRecords.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      branch,
      total,
      completed,
      pct,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-[#2d0a3d] to-[#4a1264] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-700/80 text-purple-200 border border-purple-500/30">
            {lang === 'ar' ? 'لوحة القيادة المركزية' : 'Executive Dashboard'}
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold mt-1">
            {lang === 'ar' ? 'منظومة جمع بيانات المبيعات الميدانية' : 'Field Sales Collection Platform'}
          </h1>
          <p className="text-xs text-purple-200/90 mt-1 max-w-xl">
            {lang === 'ar'
              ? 'متابعة الحملات النشطة ونسب الإنجاز في الفروع وإدارة السجلات المستوردة لحظياً.'
              : 'Real-time campaign progress, branch completion metrics, and field assignment tracking.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
          {/* Share Rep Link Button */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
            title={lang === 'ar' ? 'مشاركة رابط التطبيق المباشر للمناديب الميدانيين' : 'Share direct field app link for reps'}
          >
            <Share2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مشاركة رابط المندوبين' : 'Share Rep Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('branches')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إدارة الفروع والمناطق' : 'Branches & Zones'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('requests')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إنشاء طلب جديد' : 'New Request'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title={lang === 'ar' ? 'إعدادات النظام وإدارة قاعدة البيانات' : 'System Settings & Database'}
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إعدادات النظام وقاعدة البيانات' : 'Settings & DB'}</span>
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner - pointing to Settings */}
      {records.length > 0 && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-amber-950">
                {lang === 'ar' ? 'وضع البيانات التجريبية الفعّال (Demo Mode)' : 'Active Demo Mode'}
              </span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                {lang === 'ar'
                  ? `يحتوي النظام حالياً على ${records.length} سجل تجريبي و ${requests.length} طلبات نموذجية. يمكنك تفريغها بالكامل من تبويب إعدادات النظام للبدء بصفحة بيضاء.`
                  : `System contains ${records.length} demo records. You can purge them cleanly from System Settings to start with a blank slate.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'ar' ? 'الانتقال لإعدادات النظام وتفريغ البيانات' : 'Go to Settings & Data Management'}</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Requests */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{lang === 'ar' ? 'الطلبات النشطة' : 'Active Campaigns'}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeRequests}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-bold text-purple-700">{draftRequests}</span>
            <span>{lang === 'ar' ? 'مسودة قيد الإعداد' : 'in draft'}</span>
          </div>
        </div>

        {/* Overall Completion Percentage */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{lang === 'ar' ? 'نسبة الإنجاز الكلية' : 'Overall Completion'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{overallPercentage}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Total Assigned Records */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{lang === 'ar' ? 'إجمالي السجلات' : 'Total Records'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalAssignedRecords}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-bold text-emerald-600">{completedRecords} مكتمل</span>
            <span>•</span>
            <span className="font-bold text-amber-600">{pendingRecords} معلق</span>
          </div>
        </div>

        {/* Security & Lockouts */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">{lang === 'ar' ? 'حالة أمان الحسابات' : 'Security & Access'}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{users.filter((u) => u.role === 'REP').length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{lang === 'ar' ? 'مندوب مبيعات معتمد' : 'authorized reps'}</span>
            {lockedUsersCount > 0 && (
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                {lockedUsersCount} مقفل
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Branch Progress & Active Requests Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Progress Comparison (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">
                {lang === 'ar' ? 'نسبة الإنجاز وتوزيع السجلات حسب الفرع' : 'Completion by Branch'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar' ? 'مقارنة تقدم العمل في الفروع الرئيسية الثلاثة' : 'Comparative performance across 3 operating branches'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'التقارير التفصيلية' : 'View Reports'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {branchStats.map(({ branch, total, completed, pct }) => (
              <div key={branch.branchId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-xs text-slate-900">
                      {lang === 'ar' ? branch.branchNameAr : branch.branchNameEn}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {completed} / {total} {lang === 'ar' ? 'سجل' : 'records'} ({pct}%)
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-purple-800' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approaching Deadlines / Request Alerts (1 col) */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-700" />
                <span>{lang === 'ar' ? 'حالة الحملات الحالية' : 'Current Campaigns'}</span>
              </h2>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            </div>

            <div className="space-y-3">
              {requests.slice(0, 3).map((req) => (
                <div key={req.requestId} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-800 line-clamp-1">
                      {lang === 'ar' ? req.titleAr : req.titleEn}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        req.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Archived'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span className="font-mono text-purple-700">{req.requestCode}</span>
                    <span>
                      {lang === 'ar' ? 'الاستحقاق: ' : 'Due: '}
                      {new Date(req.dueAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('requests')}
              className="w-full h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>{lang === 'ar' ? 'عرض وإدارة جميع الطلبات' : 'Manage All Requests'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Operational Audit Activity */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-700 animate-pulse" />
            <h2 className="font-extrabold text-sm text-slate-900">
              {lang === 'ar' ? 'سجل العمليات والنشاط الميداني اللحظي' : 'Recent Field Audit Activity'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs text-purple-700 hover:text-purple-900 font-bold"
          >
            {lang === 'ar' ? 'عرض السجل الكامل' : 'Full Audit Trail'}
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.logId} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {log.action}
                </span>
                <span className="font-bold text-slate-800">{log.userName}</span>
                <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                  {log.entityType} #{log.entityId}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Share Rep Link Modal */}
      <ShareRepLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};
