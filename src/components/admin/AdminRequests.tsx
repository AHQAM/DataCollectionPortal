import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestItem, RequestPriority, RequestType } from '../../types';
import {
  FilePlus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  Archive,
  Copy,
  Edit,
  Sliders,
  Send,
  Lock,
  Layers,
  FileSpreadsheet,
  Calendar,
  X,
  Sparkles,
  Users,
  Building,
  MapPin,
  Check,
  Info,
  Eye,
} from 'lucide-react';

interface Props {
  onOpenFormBuilder: (requestId: string) => void;
  onOpenImportWizard: (requestId: string) => void;
}

export const AdminRequests: React.FC<Props> = ({ onOpenFormBuilder, onOpenImportWizard }) => {
  const {
    lang,
    dir,
    t,
    requests,
    fields,
    branches,
    regions,
    users,
    assignments,
    createRequest,
    updateRequest,
    publishRequest,
    closeRequest,
    archiveRequest,
    reopenRequest,
    cloneRequest,
    saveAsTemplate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState<string | null>(null);
  const [templateNameAr, setTemplateNameAr] = useState('');
  const [templateNameEn, setTemplateNameEn] = useState('');

  // New Request Form State
  const [newCode, setNewCode] = useState(`REQ-${Math.floor(100 + Math.random() * 900)}`);
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newPriority, setNewPriority] = useState<RequestPriority>('Normal');
  const [newType, setNewType] = useState<RequestType>('per_record');
  const [newDueAt, setNewDueAt] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newAllowEdit, setNewAllowEdit] = useState(true);
  const [newRequireSupervisor, setNewRequireSupervisor] = useState(false);
  const [newTargetScope, setNewTargetScope] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [newSelectedBranchIds, setNewSelectedBranchIds] = useState<string[]>([]);
  const [newSelectedRegionNos, setNewSelectedRegionNos] = useState<string[]>([]);

  // Edit Request State
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(null);
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [editPriority, setEditPriority] = useState<RequestPriority>('Normal');
  const [editDueAt, setEditDueAt] = useState('');
  const [editAllowEdit, setEditAllowEdit] = useState(true);
  const [editRequireSupervisor, setEditRequireSupervisor] = useState(false);
  const [editTargetScope, setEditTargetScope] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [editSelectedBranchIds, setEditSelectedBranchIds] = useState<string[]>([]);
  const [editSelectedRegionNos, setEditSelectedRegionNos] = useState<string[]>([]);

  // Assignments Overview State
  const [viewingAssignmentsRequest, setViewingAssignmentsRequest] = useState<RequestItem | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAr = r.titleAr.toLowerCase().includes(q);
      const matchEn = r.titleEn.toLowerCase().includes(q);
      const matchCode = r.requestCode.toLowerCase().includes(q);
      if (!matchAr && !matchEn && !matchCode) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedTitleEn = newTitleEn.trim() || newTitleAr.trim();
    
    try {
      const newId = await createRequest(
        {
          requestCode: newCode,
          titleAr: newTitleAr.trim(),
          titleEn: resolvedTitleEn,
          descriptionAr: newDescAr,
          descriptionEn: newDescEn || newDescAr,
          priority: newPriority,
          requestType: newType,
          dueAt: new Date(newDueAt).toISOString(),
          dueDate: newDueAt,
          targetBranches: newTargetScope === 'ALL' ? [] : newSelectedBranchIds,
          targetRegions: newTargetScope === 'ALL' ? [] : newSelectedRegionNos,
          allowEditAfterSubmit: newAllowEdit,
          requireSupervisorApproval: newRequireSupervisor,
        },
        []
      );

      setShowCreateModal(false);
      // Reset form
      setNewTitleAr('');
      setNewTitleEn('');
      setNewDescAr('');
      setNewTargetScope('ALL');
      setNewSelectedBranchIds([]);
      setNewSelectedRegionNos([]);
      // Open Form Builder directly for newly created draft request!
      onOpenFormBuilder(newId);
    } catch (err) {
      console.error("Error creating request:", err);
      alert(lang === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating request');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    try {
      await updateRequest(editingRequest.requestId, {
        titleAr: editTitleAr.trim(),
        titleEn: editTitleEn.trim() || editTitleAr.trim(),
        descriptionAr: editDescAr,
        priority: editPriority,
        dueAt: new Date(editDueAt).toISOString(),
        targetBranches: editTargetScope === 'ALL' ? [] : editSelectedBranchIds,
        targetRegions: editTargetScope === 'ALL' ? [] : editSelectedRegionNos,
        allowEditAfterSubmit: editAllowEdit,
        requireSupervisorApproval: editRequireSupervisor,
      });
      setEditingRequest(null);
    } catch (err) {
      console.error("Error updating request:", err);
      alert(lang === 'ar' ? 'تعذر حفظ تعديلات الطلب' : 'Error updating request');
    }
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showTemplateModal) {
      saveAsTemplate(showTemplateModal, templateNameAr, templateNameEn, 'Custom');
      setShowTemplateModal(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">
            {lang === 'ar' ? 'إدارة حملات وطلبات جمع البيانات' : 'Data Collection Requests'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'إنشاء وتعديل ونشر وأرشفة نماذج جمع البيانات بدون تعديل الكود'
              : 'Create, build dynamic forms, publish, and archive field collection tasks'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenImportWizard('')}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            title={lang === 'ar' ? 'إدراج بيانات الحملات والعملاء من ملفات الإكسل' : 'Import data from Excel'}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إدراج بيانات من Excel' : 'Import from Excel'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إنشاء طلب جديد' : 'Create New Request'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث برمز الطلب أو العنوان...' : 'Search by code or title...'}
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
          {[
            { key: 'ALL', labelAr: 'الكل', labelEn: 'All' },
            { key: 'Published', labelAr: 'النشطة', labelEn: 'Published' },
            { key: 'Draft', labelAr: 'المسودات', labelEn: 'Drafts' },
            { key: 'Closed', labelAr: 'المغلقة', labelEn: 'Closed' },
            { key: 'Archived', labelAr: 'المؤرشفة', labelEn: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                statusFilter === tab.key
                  ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lang === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رمز وعنوان الطلب' : 'Code & Title'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'النوع والأولوية' : 'Type & Priority'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'السجلات' : 'Records'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    {lang === 'ar' ? 'لا توجد طلبات تطابق الفلتر' : 'No requests found'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const reqFieldsCount = fields.filter((f) => f.requestId === req.requestId).length;

                  return (
                    <tr key={req.requestId} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900">
                          {lang === 'ar' ? req.titleAr : req.titleEn}
                        </div>
                        <div className="text-[11px] text-purple-700 font-mono font-bold mt-0.5">
                          {req.requestCode} • {reqFieldsCount} {lang === 'ar' ? 'حقل ديناميكي' : 'fields'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-700">
                          {req.requestType === 'per_record'
                            ? lang === 'ar' ? 'لكل عميل/سجل' : 'Per Record'
                            : lang === 'ar' ? 'لكل مندوب' : 'Per Rep'}
                        </div>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
                            req.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : req.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        {new Date(req.dueAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">{req.totalRecords}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {req.totalAssignments} {lang === 'ar' ? 'تعيين' : 'asg'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'Published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Draft'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'Archived'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Request Details */}
                          <button
                            onClick={() => {
                              setEditingRequest(req);
                              setEditTitleAr(req.titleAr);
                              setEditTitleEn(req.titleEn || '');
                              setEditDescAr(req.descriptionAr || '');
                              setEditPriority(req.priority || 'Normal');
                              setEditDueAt(req.dueAt ? req.dueAt.split('T')[0] : '');
                              const hasBranches = Array.isArray(req.targetBranches) && req.targetBranches.length > 0;
                              const hasRegions = Array.isArray(req.targetRegions) && req.targetRegions.length > 0;
                              setEditTargetScope(hasBranches || hasRegions ? 'SPECIFIC' : 'ALL');
                              setEditSelectedBranchIds(req.targetBranches || []);
                              setEditSelectedRegionNos(req.targetRegions || []);
                              setEditAllowEdit(req.allowEditAfterSubmit ?? true);
                              setEditRequireSupervisor(req.requireSupervisorApproval ?? false);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200"
                            title={lang === 'ar' ? 'تعديل تفاصيل واستهداف الطلب' : 'Edit Request Details & Scope'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* View Assigned Reps & Progress */}
                          <button
                            onClick={() => setViewingAssignmentsRequest(req)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold border border-indigo-200"
                            title={lang === 'ar' ? 'استعراض تكليفات المناديب ونسب الإنجاز' : 'View Assigned Reps & Progress'}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>

                          {/* Dynamic Form Builder Trigger */}
                          <button
                            onClick={() => onOpenFormBuilder(req.requestId)}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200"
                            title={lang === 'ar' ? 'محرر الحقول الديناميكية' : 'Form Builder'}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Import Wizard Trigger */}
                          <button
                            onClick={() => onOpenImportWizard(req.requestId)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 flex items-center gap-1 text-[11px] shadow-2xs"
                            title={lang === 'ar' ? 'إدراج بيانات عبر Excel لهذا الطلب' : 'Import Excel Data'}
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{lang === 'ar' ? 'إكسل' : 'Excel'}</span>
                          </button>

                          {/* Status Actions */}
                          {req.status === 'Draft' && (
                            <button
                              onClick={() => {
                                void publishRequest(req.requestId).catch((err) => {
                                  const message =
                                    err?.details?.message ||
                                    err?.message ||
                                    (lang === 'ar'
                                      ? 'تعذر نشر الطلب. تحقق من حقول النموذج ثم حاول مرة أخرى.'
                                      : 'The request could not be published. Check the form fields and try again.');
                                  alert(message);
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs"
                            >
                              {lang === 'ar' ? 'نشر' : 'Publish'}
                            </button>
                          )}

                          {req.status === 'Published' && (
                            <button
                              onClick={() => closeRequest(req.requestId)}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px]"
                            >
                              {lang === 'ar' ? 'إغلاق' : 'Close'}
                            </button>
                          )}

                          {req.status === 'Closed' && (
                            <button
                              onClick={() => archiveRequest(req.requestId)}
                              className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[10px]"
                            >
                              {lang === 'ar' ? 'أرشفة' : 'Archive'}
                            </button>
                          )}

                          {req.status === 'Archived' && (
                            <button
                              onClick={() => reopenRequest(req.requestId)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                            >
                              {lang === 'ar' ? 'إعادة فتح' : 'Reopen'}
                            </button>
                          )}

                          {/* Clone */}
                          <button
                            onClick={() => cloneRequest(req.requestId)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                            title={lang === 'ar' ? 'استنساخ الطلب' : 'Clone Request'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Save as Template */}
                          <button
                            onClick={() => {
                              setShowTemplateModal(req.requestId);
                              setTemplateNameAr(req.titleAr);
                              setTemplateNameEn(req.titleEn);
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                            title={lang === 'ar' ? 'حفظ كقالب معتمد' : 'Save as Template'}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-extrabold text-sm text-slate-900">
                {lang === 'ar' ? 'إنشاء طلب جمع بيانات جديد (معالج الإعداد)' : 'Create Data Collection Request'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'رمز الطلب' : 'Request Code'}
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as RequestPriority)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'عنوان الطلب (بالعربية)' : 'Request Title (Arabic)'}
                </label>
                <input
                  type="text"
                  value={newTitleAr}
                  onChange={(e) => setNewTitleAr(e.target.value)}
                  placeholder="مثال: مسح أسعار وتوافر أصناف العصير"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'عنوان الطلب (بالإنجليزية - اختياري)' : 'Request Title (English - Optional)'}
                </label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder={lang === 'ar' ? 'اختياري - يترك فارغاً إذا لم ترغب به' : 'Optional'}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'نوع الطلب' : 'Request Type'}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as RequestType)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                  >
                    <option value="per_record">{lang === 'ar' ? 'استجابة لكل عميل/سجل' : 'Per Customer/Record'}</option>
                    <option value="per_rep">{lang === 'ar' ? 'استجابة واحدة لكل مندوب' : 'Per Representative'}</option>
                    <option value="per_region">{lang === 'ar' ? 'استجابة لكل منطقة' : 'Per Region'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newDueAt}
                    onChange={(e) => setNewDueAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'التعليمات والإرشادات (بالعربية)' : 'Instructions (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={newDescAr}
                  onChange={(e) => setNewDescAr(e.target.value)}
                  placeholder="اكتب تعليمات الزيارة الميدانية وتعبئة النموذج..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Target Scope Selection (Branches & Regions) */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                    <Building className="w-4 h-4 text-purple-700" />
                    <span>{lang === 'ar' ? 'نطاق الفروع والمناطق المستهدفة' : 'Target Branches & Zones'}</span>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input
                        type="radio"
                        name="newTargetScope"
                        checked={newTargetScope === 'ALL'}
                        onChange={() => setNewTargetScope('ALL')}
                        className="text-purple-900"
                      />
                      <span>{lang === 'ar' ? 'كل الفروع والمناطق' : 'All Branches & Zones'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input
                        type="radio"
                        name="newTargetScope"
                        checked={newTargetScope === 'SPECIFIC'}
                        onChange={() => setNewTargetScope('SPECIFIC')}
                        className="text-purple-900"
                      />
                      <span>{lang === 'ar' ? 'تحديد فروع ومناطق' : 'Specific Branches'}</span>
                    </label>
                  </div>
                </div>

                {newTargetScope === 'SPECIFIC' && (
                  <div className="space-y-2 pt-2 border-t border-purple-200/60 animate-in fade-in">
                    <div>
                      <div className="font-bold text-slate-600 text-[11px] mb-1">
                        {lang === 'ar' ? 'اختر الفروع المستهدفة:' : 'Select Target Branches:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {branches.map((b) => {
                          const isSelected = newSelectedBranchIds.includes(b.branchId);
                          return (
                            <button
                              key={b.branchId}
                              type="button"
                              onClick={() => {
                                setNewSelectedBranchIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== b.branchId) : [...prev, b.branchId]
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border ${
                                isSelected
                                  ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{lang === 'ar' ? b.branchNameAr : b.branchNameEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filtered Regions based on selected branches */}
                    {newSelectedBranchIds.length > 0 && (
                      <div className="pt-1">
                        <div className="font-bold text-slate-600 text-[11px] mb-1">
                          {lang === 'ar' ? 'المناطق التابعة للفروع المختارة (اختياري - افتراضياً تشمل الكل):' : 'Regions in Selected Branches:'}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                          {regions
                            .filter((r) => newSelectedBranchIds.includes(r.branchId))
                            .map((r) => {
                              const isRegSelected = newSelectedRegionNos.includes(r.regionNo);
                              return (
                                <button
                                  key={r.regionNo}
                                  type="button"
                                  onClick={() => {
                                    setNewSelectedRegionNos((prev) =>
                                      isRegSelected ? prev.filter((no) => no !== r.regionNo) : [...prev, r.regionNo]
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer border ${
                                    isRegSelected
                                      ? 'bg-purple-700 text-white border-purple-700'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {r.regionNo} - {lang === 'ar' ? r.regionNameAr : r.regionNameEn}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newAllowEdit}
                    onChange={(e) => setNewAllowEdit(e.target.checked)}
                    className="rounded text-purple-900"
                  />
                  <span>{lang === 'ar' ? 'السماح للمندوب بتعديل السجل بعد الاعتماد' : 'Allow editing after submit'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newRequireSupervisor}
                    onChange={(e) => setNewRequireSupervisor(e.target.checked)}
                    className="rounded text-purple-900"
                  />
                  <span>{lang === 'ar' ? 'يتطلب اعتماد المشرف قبل الإغلاق النهائي' : 'Require Supervisor Approval'}</span>
                </label>
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
                  className="flex-2 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold"
                >
                  {lang === 'ar' ? 'إنشاء والانتقال لمصمم الحقول' : 'Create & Open Form Builder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-purple-700" />
                <span>{lang === 'ar' ? 'تعديل تفاصيل واستهداف الطلب' : 'Edit Request Details & Scope'}</span>
                <span className="text-purple-700 font-mono text-xs">({editingRequest.requestCode})</span>
              </h2>
              <button
                onClick={() => setEditingRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as RequestPriority)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={editDueAt}
                    onChange={(e) => setEditDueAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'عنوان الطلب (بالعربية)' : 'Request Title (Arabic)'}
                </label>
                <input
                  type="text"
                  value={editTitleAr}
                  onChange={(e) => setEditTitleAr(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'عنوان الطلب (بالإنجليزية)' : 'Request Title (English)'}
                </label>
                <input
                  type="text"
                  value={editTitleEn}
                  onChange={(e) => setEditTitleEn(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'التعليمات والإرشادات' : 'Instructions'}
                </label>
                <textarea
                  rows={2}
                  value={editDescAr}
                  onChange={(e) => setEditDescAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Target Scope Selection in Edit */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                    <Building className="w-4 h-4 text-purple-700" />
                    <span>{lang === 'ar' ? 'نطاق الفروع والمناطق المستهدفة' : 'Target Branches & Zones'}</span>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input
                        type="radio"
                        name="editTargetScope"
                        checked={editTargetScope === 'ALL'}
                        onChange={() => setEditTargetScope('ALL')}
                        className="text-purple-900"
                      />
                      <span>{lang === 'ar' ? 'كل الفروع والمناطق' : 'All Branches'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                      <input
                        type="radio"
                        name="editTargetScope"
                        checked={editTargetScope === 'SPECIFIC'}
                        onChange={() => setEditTargetScope('SPECIFIC')}
                        className="text-purple-900"
                      />
                      <span>{lang === 'ar' ? 'تحديد فروع ومناطق' : 'Specific'}</span>
                    </label>
                  </div>
                </div>

                {editTargetScope === 'SPECIFIC' && (
                  <div className="space-y-2 pt-2 border-t border-purple-200/60 animate-in fade-in">
                    <div>
                      <div className="font-bold text-slate-600 text-[11px] mb-1">
                        {lang === 'ar' ? 'اختر الفروع المستهدفة:' : 'Select Target Branches:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {branches.map((b) => {
                          const isSelected = editSelectedBranchIds.includes(b.branchId);
                          return (
                            <button
                              key={b.branchId}
                              type="button"
                              onClick={() => {
                                setEditSelectedBranchIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== b.branchId) : [...prev, b.branchId]
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border ${
                                isSelected
                                  ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{lang === 'ar' ? b.branchNameAr : b.branchNameEn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {editSelectedBranchIds.length > 0 && (
                      <div className="pt-1">
                        <div className="font-bold text-slate-600 text-[11px] mb-1">
                          {lang === 'ar' ? 'المناطق التابعة للفروع المختارة:' : 'Regions in Selected Branches:'}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                          {regions
                            .filter((r) => editSelectedBranchIds.includes(r.branchId))
                            .map((r) => {
                              const isRegSelected = editSelectedRegionNos.includes(r.regionNo);
                              return (
                                <button
                                  key={r.regionNo}
                                  type="button"
                                  onClick={() => {
                                    setEditSelectedRegionNos((prev) =>
                                      isRegSelected ? prev.filter((no) => no !== r.regionNo) : [...prev, r.regionNo]
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer border ${
                                    isRegSelected
                                      ? 'bg-purple-700 text-white border-purple-700'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {r.regionNo} - {lang === 'ar' ? r.regionNameAr : r.regionNameEn}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-2 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold cursor-pointer shadow-md"
                >
                  {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments Overview Modal */}
      {viewingAssignmentsRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>{lang === 'ar' ? 'تكليفات المناديب ونسب الإنجاز' : 'Assigned Reps & Field Progress'}</span>
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  {lang === 'ar' ? viewingAssignmentsRequest.titleAr : viewingAssignmentsRequest.titleEn} (
                  <span className="font-mono font-bold text-purple-700">{viewingAssignmentsRequest.requestCode}</span>)
                </div>
              </div>
              <button
                onClick={() => setViewingAssignmentsRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const reqAssignments = assignments.filter((a) => a.requestId === viewingAssignmentsRequest.requestId);

              if (reqAssignments.length === 0) {
                return (
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
                        const reqId = viewingAssignmentsRequest.requestId;
                        setViewingAssignmentsRequest(null);
                        onOpenImportWizard(reqId);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'فتح معالج استيراد Excel' : 'Open Excel Import Wizard'}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between px-1 text-slate-500 font-bold text-[11px]">
                    <span>{lang === 'ar' ? `إجمالي التكليفات: ${reqAssignments.length} مندوب` : `Total: ${reqAssignments.length} reps`}</span>
                    <span>{lang === 'ar' ? `إجمالي السجلات: ${viewingAssignmentsRequest.totalRecords}` : `Total Records: ${viewingAssignmentsRequest.totalRecords}`}</span>
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
              );
            })()}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setViewingAssignmentsRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              {lang === 'ar' ? 'حفظ الطلب كقالب معتمد' : 'Save as Request Template'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'ar'
                ? 'يمكنك إعادة استخدام هيكل الحقول لاحقاً لحملات مشابهة'
                : 'Save field schema to reuse in future campaigns'}
            </p>

            <form onSubmit={handleSaveTemplateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم القالب بالعربية' : 'Template Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={templateNameAr}
                  onChange={(e) => setTemplateNameAr(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'ar' ? 'اسم القالب بالإنجليزية' : 'Template Name (English)'}
                </label>
                <input
                  type="text"
                  value={templateNameEn}
                  onChange={(e) => setTemplateNameEn(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(null)}
                  className="flex-1 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold"
                >
                  {lang === 'ar' ? 'حفظ القالب' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
