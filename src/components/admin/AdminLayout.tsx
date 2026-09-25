import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Users,
  Smartphone,
  Layers,
  FileSpreadsheet,
  Archive,
  ShieldCheck,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sliders,
} from "lucide-react";
const AdminDashboard = React.lazy(() =>
  import("./AdminDashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const AdminRequests = React.lazy(() =>
  import("./AdminRequests").then((module) => ({
    default: module.AdminRequests,
  })),
);
const AdminFormBuilder = React.lazy(() =>
  import("./AdminFormBuilder").then((module) => ({
    default: module.AdminFormBuilder,
  })),
);
const AdminImportWizard = React.lazy(() =>
  import("./AdminImportWizard").then((module) => ({
    default: module.AdminImportWizard,
  })),
);
const AdminBranches = React.lazy(() =>
  import("./AdminBranches").then((module) => ({
    default: module.AdminBranches,
  })),
);
const AdminSupervisorMatrix = React.lazy(() =>
  import("./AdminSupervisorMatrix").then((module) => ({
    default: module.AdminSupervisorMatrix,
  })),
);
const AdminUsers = React.lazy(() =>
  import("./AdminUsers").then((module) => ({ default: module.AdminUsers })),
);
const AdminDeviceManager = React.lazy(() =>
  import("./AdminDeviceManager").then((module) => ({
    default: module.AdminDeviceManager,
  })),
);
const AdminAssignments = React.lazy(() =>
  import("./AdminAssignments").then((module) => ({
    default: module.AdminAssignments,
  })),
);
const AdminReports = React.lazy(() =>
  import("./AdminReports").then((module) => ({ default: module.AdminReports })),
);
const AdminArchive = React.lazy(() =>
  import("./AdminArchive").then((module) => ({ default: module.AdminArchive })),
);
const AdminAuditLogs = React.lazy(() =>
  import("./AdminAuditLogs").then((module) => ({
    default: module.AdminAuditLogs,
  })),
);
const AdminSettings = React.lazy(() =>
  import("./AdminSettings").then((module) => ({
    default: module.AdminSettings,
  })),
);

export const AdminLayout: React.FC = () => {
  const { lang, dir, t, currentUser } = useApp();

  const [currentModule, setCurrentModule] = useState<string>("dashboard");
  const [activeBuilderRequestId, setActiveBuilderRequestId] = useState<
    string | null
  >(null);
  const [activeImportRequestId, setActiveImportRequestId] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      labelAr: "لوحة القيادة",
      labelEn: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "branches",
      labelAr: "إدارة الفروع والمناطق",
      labelEn: "Branches & Regions",
      icon: Building2,
    },
    {
      id: "supervisor_matrix",
      labelAr: "مصفوفة صلاحيات المشرفين",
      labelEn: "Supervisor Permissions",
      icon: ShieldCheck,
    },
    {
      id: "users",
      labelAr: "المستخدمين",
      labelEn: "Users",
      icon: Users,
    },
    {
      id: "requests",
      labelAr: "طلبات جمع البيانات",
      labelEn: "Requests & Forms",
      icon: FileText,
    },
    {
      id: "import",
      labelAr: "معالج استيراد Excel",
      labelEn: "Excel Import Wizard",
      icon: UploadCloud,
    },
    {
      id: "devices",
      labelAr: "ربط وأمان الأجهزة",
      labelEn: "Device Security",
      icon: Smartphone,
    },
    {
      id: "assignments",
      labelAr: "إعادة توزيع السجلات",
      labelEn: "Record Reassignments",
      icon: Layers,
    },
    {
      id: "reports",
      labelAr: "التقارير وتصدير إكسل",
      labelEn: "Reports & Export",
      icon: FileSpreadsheet,
    },
    {
      id: "archive",
      labelAr: "الأرشيف التاريخي",
      labelEn: "Archive",
      icon: Archive,
    },
    {
      id: "audit",
      labelAr: "سجل التدقيق والرقابة",
      labelEn: "Audit Trail",
      icon: ShieldCheck,
    },
    {
      id: "settings",
      labelAr: "إعدادات النظام",
      labelEn: "Settings",
      icon: Settings,
    },
  ];

  const handleOpenFormBuilder = (requestId: string) => {
    setActiveBuilderRequestId(requestId);
    setCurrentModule("form_builder");
  };

  const handleOpenImportWizard = (requestId: string) => {
    setActiveImportRequestId(requestId);
    setCurrentModule("import");
  };

  const renderModuleContent = () => {
    if (currentModule === "form_builder" && activeBuilderRequestId) {
      return (
        <AdminFormBuilder
          requestId={activeBuilderRequestId}
          onBack={() => {
            setActiveBuilderRequestId(null);
            setCurrentModule("requests");
          }}
          onOpenImportWizard={handleOpenImportWizard}
        />
      );
    }

    switch (currentModule) {
      case "dashboard":
        return <AdminDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
      case "requests":
        return (
          <AdminRequests
            onOpenFormBuilder={handleOpenFormBuilder}
            onOpenImportWizard={handleOpenImportWizard}
            onNavigate={(mod) => setCurrentModule(mod)}
          />
        );
      case "import":
        return (
          <AdminImportWizard
            initialRequestId={activeImportRequestId || undefined}
            onBack={() => {
              setActiveImportRequestId(null);
              setCurrentModule("requests");
            }}
          />
        );
      case "branches":
        return <AdminBranches />;
      case "supervisor_matrix":
        return <AdminSupervisorMatrix />;
      case "users":
        return <AdminUsers />;
      case "devices":
        return <AdminDeviceManager />;
      case "assignments":
        return <AdminAssignments />;
      case "reports":
        return <AdminReports />;
      case "archive":
        return <AdminArchive />;
      case "audit":
        return <AdminAuditLogs />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100/90 text-slate-900 relative">
      {/* Mobile Drawer (Only shown on < lg when isSidebarOpen is true) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between z-10 border-e border-slate-200 animate-in slide-in-from-start duration-200">
            <div>
              {/* Drawer Top Bar */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-700" />
                  <span>
                    {t("auto.managementPortal")}
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentModule(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-start cursor-pointer ${
                          isActive
                            ? "bg-purple-900 text-white shadow-xs font-extrabold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-purple-950"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                        />
                        <span className="truncate">
                          {lang === "ar" ? item.labelAr : item.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile Drawer Footer with Current User */}
            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {currentUser?.userNameAr?.charAt(0) ||
                    currentUser?.username?.charAt(0) ||
                    "م"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-slate-900 truncate">
                    {currentUser?.userNameAr ||
                      currentUser?.username ||
                      (t("auto.user"))}
                  </div>
                  <div className="text-[10px] text-purple-700 font-bold truncate">
                    {currentUser?.role === "ADMIN"
                      ? t("auto.systemAdmin")
                      : t("auto.branchSupervisor")}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Permanently docked in the grid on lg screens) */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-e border-slate-200 sticky top-16 h-[calc(100vh-4rem)] flex-col justify-between z-20">
        <div className="p-4 overflow-y-auto">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
            {t("auto.managementPortal")}
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentModule(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-start cursor-pointer ${
                    isActive
                      ? "bg-purple-900 text-white shadow-xs font-extrabold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-purple-950"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="truncate">
                    {lang === "ar" ? item.labelAr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info Bar at bottom of desktop sidebar */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser?.userNameAr?.charAt(0) ||
                currentUser?.username?.charAt(0) ||
                "م"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-xs text-slate-900 truncate">
                {currentUser?.userNameAr ||
                  currentUser?.username ||
                  (t("auto.user"))}
              </div>
              <div className="text-[10px] text-purple-700 font-bold truncate">
                {currentUser?.role === "ADMIN"
                  ? t("auto.systemAdmin")
                  : t("auto.branchSupervisor")}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Mobile Toggle Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors"
          >
            <Menu className="w-4 h-4 text-purple-700" />
            <span>{t("auto.adminMenu")}</span>
          </button>
          <span className="text-xs font-bold text-purple-900">
            {menuItems.find((m) => m.id === currentModule)?.labelAr || ""}
          </span>
        </div>

        <React.Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-sm text-slate-500 font-bold">
              {t("auto.loadingModule")}
            </div>
          }
        >
          {renderModuleContent()}
        </React.Suspense>
      </main>
    </div>
  );
};
