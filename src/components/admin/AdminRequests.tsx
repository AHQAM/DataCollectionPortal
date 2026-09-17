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
          allowEditAfterSubmit: newAllowEdit,
          requireSupervisorApproval: newRequireSupervisor,
        },
        []
      );

      setShowCreateModal(false);
      // Open Form Builder directly for newly created draft request!
      onOpenFormBuilder(newId);
    } catch (err) {
      console.error("Error creating request:", err);
      alert(lang === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating request');
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
