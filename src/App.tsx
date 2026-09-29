import React, { useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AppProvider, useApp } from "./context/AppContext";
import { TopNavbar } from "./components/common/TopNavbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { useInactivityTimeout } from "./hooks/useInactivityTimeout";
import { lazyWithRetry } from "./utils/lazyWithRetry";

const AuthPortal = lazyWithRetry(
  () => import("./components/common/AuthPortal"),
  "AuthPortal",
);
const AdminLayout = lazyWithRetry(
  () => import("./components/admin/AdminLayout"),
  "AdminLayout",
);

const MainAppContent: React.FC = () => {
  const { t } = useTranslation();
  const { lang, dir, currentUser, authReady, setIsOnline, syncOfflineQueue } =
    useApp();

  useInactivityTimeout();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue?.();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      syncOfflineQueue?.();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        {t("app.verifyingSession", { lng: lang })}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
            {t("app.loadingInterface", { lng: lang })}
          </div>
        }
      >
        <AuthPortal />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-purple-900 selection:text-white">
      {/* Navigation and authenticated user controls */}
      <TopNavbar />

      {/* Main View Mode Container */}
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-slate-500">
              {t("app.loadingDashboard", { lng: lang })}
            </div>
          }
        >
          <AdminLayout />
        </Suspense>
      </div>

      {/* Global Brand Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-2.5 px-4 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">
            {t("app.footerTitle", { lng: lang })}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <MainAppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}
