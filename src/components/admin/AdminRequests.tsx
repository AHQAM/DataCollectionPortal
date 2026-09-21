import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { RequestItem, RequestPriority, RequestType } from "../../types";
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
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  CreateRequestModal,
  EditRequestModal,
  AssignmentsOverviewModal,
} from "./requests";
import { RequestsHeader } from "./requests/RequestsHeader";
import { RequestsTable } from "./requests/RequestsTable";
import { RequestFilters } from "./requests/RequestFilters";
import { RequestTableRow } from "./requests/RequestTableRow";
import { SaveTemplateModal } from "./requests/SaveTemplateModal";
import { DeleteRequestModal } from "./requests/DeleteRequestModal";

interface Props {
  onOpenFormBuilder: (requestId: string) => void;
  onOpenImportWizard: (requestId: string) => void;
  onNavigate?: (module: string) => void;
  onViewResponses?: (requestId: string) => void;
}

export const AdminRequests: React.FC<Props> = ({
  onOpenFormBuilder,
  onOpenImportWizard,
  onNavigate,
  onViewResponses: propOnViewResponses,
}) => {
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
    deleteRequest,
    saveAsTemplate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState<string | null>(
    null,
  );
  const [templateNameAr, setTemplateNameAr] = useState("");
  const [templateNameEn, setTemplateNameEn] = useState("");

  // Active Modals & Operations State
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(
    null,
  );
  const [viewingAssignmentsRequest, setViewingAssignmentsRequest] =
    useState<RequestItem | null>(null);
  const [deleteConfirmRequest, setDeleteConfirmRequest] =
    useState<RequestItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAr = r.titleAr.toLowerCase().includes(q);
      const matchEn = r.titleEn.toLowerCase().includes(q);
      const matchCode = r.requestCode.toLowerCase().includes(q);
      if (!matchAr && !matchEn && !matchCode) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (data: {
    requestCode: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    priority: RequestPriority;
    requestType: RequestType;
    dueAt: string;
    targetBranches: string[];
    targetRegions: string[];
    allowEditAfterSubmit: boolean;
    requireSupervisorApproval: boolean;
  }) => {
    try {
      const res = await createRequest(
        {
          requestCode: data.requestCode,
          titleAr: data.titleAr.trim(),
          titleEn: data.titleEn?.trim() || data.titleAr.trim(),
          descriptionAr: data.descriptionAr || "",
          descriptionEn: data.descriptionEn || data.descriptionAr || "",
          priority: data.priority,
          requestType: data.requestType,
          dueAt: new Date(data.dueAt).toISOString(),
          dueDate: data.dueAt,
          targetBranches: data.targetBranches,
          targetRegions: data.targetRegions,
          allowEditAfterSubmit: data.allowEditAfterSubmit,
          requireSupervisorApproval: data.requireSupervisorApproval,
        },
        [],
      );

      setShowCreateModal(false);
      if (res.success && res.data) {
        onOpenFormBuilder(res.data);
      }
    } catch (err) {
      console.error("Error creating request:", err);
      alert(
        lang === "ar" ? "حدث خطأ أثناء إنشاء الطلب" : "Error creating request",
      );
    }
  };

  const handleEditSubmit = async (
    requestId: string,
    updates: Partial<RequestItem>,
  ) => {
    try {
      await updateRequest(requestId, updates);
      setEditingRequest(null);
    } catch (err) {
      console.error("Error updating request:", err);
      alert(
        lang === "ar" ? "تعذر حفظ تعديلات الطلب" : "Error updating request",
      );
    }
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showTemplateModal) {
      saveAsTemplate(
        showTemplateModal,
        templateNameAr,
        templateNameEn,
        "Custom",
      );
      setShowTemplateModal(null);
      showToast(
        lang === "ar" ? "تم حفظ القالب بنجاح" : "Template saved successfully",
      );
    }
  };

  const handlePublish = async (requestId: string) => {
    setActionLoadingId(`${requestId}_publish`);
    try {
      await publishRequest(requestId);
      showToast(
        lang === "ar" ? "تم نشر الطلب بنجاح" : "Request published successfully",
      );
    } catch (err: any) {
      const message =
        err?.details?.message ||
        err?.message ||
        (lang === "ar"
          ? "تعذر نشر الطلب. تحقق من حقول النموذج ثم حاول مرة أخرى."
          : "The request could not be published. Check the form fields and try again.");
      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClose = async (requestId: string) => {
    setActionLoadingId(`${requestId}_close`);
    try {
      await closeRequest(requestId);
      showToast(
        lang === "ar" ? "تم إغلاق الطلب بنجاح" : "Request closed successfully",
      );
    } catch (err: any) {
      alert(
        err?.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء إغلاق الطلب"
            : "Error closing request"),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (requestId: string) => {
    setActionLoadingId(`${requestId}_archive`);
    try {
      await archiveRequest(requestId);
      showToast(
        lang === "ar"
          ? "تمت أرشفة الطلب بنجاح"
          : "Request archived successfully",
      );
    } catch (err: any) {
      alert(
        err?.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء أرشفة الطلب"
            : "Error archiving request"),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReopen = async (requestId: string) => {
    setActionLoadingId(`${requestId}_reopen`);
    try {
      await reopenRequest(requestId);
      showToast(
        lang === "ar"
          ? "تمت إعادة فتح الطلب بنجاح"
          : "Request reopened successfully",
      );
    } catch (err: any) {
      alert(
        err?.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء إعادة فتح الطلب"
            : "Error reopening request"),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClone = async (requestId: string) => {
    setActionLoadingId(`${requestId}_clone`);
    try {
      await cloneRequest(requestId);
      showToast(
        lang === "ar"
          ? "تم استنساخ الطلب بنجاح"
          : "Request cloned successfully",
      );
    } catch (err: any) {
      alert(
        err?.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء استنساخ الطلب"
            : "Error cloning request"),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    setActionLoadingId(`${requestId}_delete`);
    try {
      const res = await deleteRequest(requestId);
      if (res.success) {
        showToast(
          lang === "ar"
            ? "تم حذف الطلب وجميع بياناته بنجاح"
            : "Request deleted successfully",
        );
      } else {
        alert(lang === "ar" ? "فشل حذف الطلب" : "Failed to delete request");
      }
    } catch (err: any) {
      alert(
        err?.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء حذف الطلب"
            : "Error deleting request"),
      );
    } finally {
      setActionLoadingId(null);
      setDeleteConfirmRequest(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <RequestsHeader
        lang={lang}
        onOpenImportWizard={onOpenImportWizard}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* Filter and Search Bar */}
      <RequestFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        lang={lang}
        onAddRequest={() => setShowCreateModal(true)}
      />

      {/* Requests Table / Grid */}
      <RequestsTable
        lang={lang}
        requests={filteredRequests}
        fields={fields}
        actionLoadingId={actionLoadingId}
        onEdit={setEditingRequest}
        onViewAssignments={setViewingAssignmentsRequest}
        onOpenFormBuilder={onOpenFormBuilder}
        onOpenImportWizard={onOpenImportWizard}
        onPublish={handlePublish}
        onClose={handleClose}
        onArchive={handleArchive}
        onReopen={handleReopen}
        onClone={handleClone}
        onSaveTemplate={(r) => {
          setShowTemplateModal(r.requestId);
          setTemplateNameAr(r.titleAr);
          setTemplateNameEn(r.titleEn);
        }}
        onDelete={setDeleteConfirmRequest}
        onViewResponses={(r) => {
          if (onNavigate) {
            onNavigate("reports");
          }
          if (propOnViewResponses) {
            propOnViewResponses(r.requestId);
          }
        }}
      />

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        branches={branches}
        regions={regions}
        lang={lang}
        defaultCode={`REQ-${Math.floor(100 + Math.random() * 900)}`}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Request Modal */}
      <EditRequestModal
        request={editingRequest}
        onClose={() => setEditingRequest(null)}
        branches={branches}
        regions={regions}
        lang={lang}
        onSubmit={handleEditSubmit}
      />

      {/* Assignments Overview Modal */}
      <AssignmentsOverviewModal
        request={viewingAssignmentsRequest}
        onClose={() => setViewingAssignmentsRequest(null)}
        assignments={assignments}
        users={users}
        branches={branches}
        lang={lang}
        onOpenImportWizard={onOpenImportWizard}
      />
      <SaveTemplateModal
        isOpen={showTemplateModal !== null}
        onClose={() => setShowTemplateModal(null)}
        lang={lang}
        templateNameAr={templateNameAr}
        setTemplateNameAr={setTemplateNameAr}
        templateNameEn={templateNameEn}
        setTemplateNameEn={setTemplateNameEn}
        onSubmit={handleSaveTemplateSubmit}
      />

      <DeleteRequestModal
        request={deleteConfirmRequest}
        onClose={() => setDeleteConfirmRequest(null)}
        onConfirm={handleDelete}
        lang={lang}
        isDeleting={
          actionLoadingId !== null &&
          deleteConfirmRequest !== null &&
          actionLoadingId === `${deleteConfirmRequest.requestId}_delete`
        }
      />
    </div>
  );
};
