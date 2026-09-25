import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { BroadcastNotificationModal } from "../admin/BroadcastNotificationModal";
import {
  Globe,
  UserCheck,
  Bell,
  LogOut,
  Shield,
  Key,
  Lock,
  Share2,
  Smartphone,
  Radio,
} from "lucide-react";

export const TopNavbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    lang,
    setLang,
    dir,
    notifications,
    currentUser,
    users,
    quickSwitchUser,
    logout,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowRoleMenu(false);
        setShowNotifMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeAllMenus = () => {
    setShowRoleMenu(false);
    setShowNotifMenu(false);
  };

  const unreadCount = notifications.filter(
    (n) =>
      n.status !== "READ" &&
      (!currentUser ||
        n.userId === currentUser.userId ||
        currentUser.role === "ADMIN"),
  ).length;

  const isAdminOrSupervisor =
    currentUser?.role === "ADMIN" || currentUser?.role === "SUPERVISOR";
  const isRep = currentUser?.role === "REP";

  return (
    <header className="sticky top-0 z-40 bg-[#2d0a3d] text-white shadow-md border-b border-purple-900/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-700/80 border border-purple-500/40 flex items-center justify-center text-white font-bold shadow-inner">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <div className="font-extrabold text-base sm:text-lg leading-tight tracking-wide flex items-center gap-2">
              <span>{t("common.appTitle")}</span>
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-800 text-purple-200 border border-purple-600/40">
                Enterprise v2.4
              </span>
            </div>
            <div className="text-[11px] text-purple-200/80 font-medium">
              {t("topNavbar.subTitle")}
            </div>
          </div>
        </div>

        {/* App Title Area */}

        {/* Right Controls: Connectivity, Share Link, Lang, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => {
              setLang(lang === "ar" ? "en" : "ar");
              closeAllMenus();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-purple-200 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t("common.langToggle", { lng: lang })}</span>
          </button>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallBanner variant="button" />
          </div>

          {/* Quick Role Switcher Dropdown - ONLY FOR ADMIN (QA Tools) */}
          {currentUser?.role === "ADMIN" && (
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => {
                  setShowRoleMenu((prev) => !prev);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-800/60 hover:bg-purple-700/70 border border-purple-600/50 text-white transition-all cursor-pointer"
                title={t("topNavbar.qaSwitcher")}
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden md:inline font-bold">
                  {t("roles.admin")}
                </span>
              </button>

              {showRoleMenu && (
                <div
                  className={`absolute ${
                    dir === "rtl" ? "left-0" : "right-0"
                  } mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="px-3 py-1.5 font-bold text-slate-500 border-b border-slate-100 flex items-center justify-between">
                    <span>{t("topNavbar.qaModalTitle")}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                      QA Tools
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelected = currentUser?.userId === u.userId;
                      return (
                        <button
                          key={u.userId}
                          onClick={() => {
                            quickSwitchUser(u.userId);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-start px-3 py-2.5 hover:bg-purple-50 flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected ? "bg-purple-100/70 font-bold" : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1 me-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                              {u.role === "ADMIN" ? (
                                <Shield className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              ) : u.role === "SUPERVISOR" ? (
                                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : (
                                <Smartphone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              )}
                              <span className="truncate">
                                {lang === "ar"
                                  ? u.userNameAr
                                  : u.userNameEn || u.userNameAr}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {u.role === "ADMIN"
                                ? t("topNavbar.adminRoleDesc", { lng: lang })
                                : u.role === "SUPERVISOR"
                                  ? t("topNavbar.supervisorRoleDesc", {
                                      lng: lang,
                                      branch:
                                        lang === "ar"
                                          ? u.branchNameAr || u.branchId
                                          : u.branchNameEn ||
                                            u.branchNameAr ||
                                            u.branchId,
                                    })
                                  : t("topNavbar.userRoleDesc", {
                                      lng: lang,
                                      region: u.regionNo,
                                      branch:
                                        lang === "ar"
                                          ? u.branchNameAr || u.branchId
                                          : u.branchNameEn ||
                                            u.branchNameAr ||
                                            u.branchId,
                                    })}
                            </div>
                          </div>
                          {(() => {
                            const isLocked = Boolean(
                              u.lockedUntil &&
                              new Date(u.lockedUntil) > new Date(),
                            );
                            return (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                  u.role === "ADMIN"
                                    ? "bg-purple-200 text-purple-900"
                                    : u.role === "SUPERVISOR"
                                      ? "bg-blue-100 text-blue-800"
                                      : isLocked
                                        ? "bg-rose-100 text-rose-800"
                                        : u.mustChangePassword
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {isLocked
                                  ? t("topNavbar.statusLocked", { lng: lang })
                                  : u.mustChangePassword
                                    ? t("topNavbar.statusNewPw", { lng: lang })
                                    : u.role}
                              </span>
                            );
                          })()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Broadcast Notification Button - ADMIN & SUPERVISOR */}
          {isAdminOrSupervisor && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="p-2 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-amber-300 hover:text-amber-200 transition-all cursor-pointer"
              title={t("topNavbar.broadcast")}
            >
              <Radio className="w-4 h-4" />
            </button>
          )}

          {/* Notifications Icon with unread badge */}
          {currentUser && (
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => {
                  setShowNotifMenu((prev) => !prev);
                  setShowRoleMenu(false);
                }}
                className="p-2 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-purple-200 relative transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-purple-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div
                  className={`absolute ${
                    dir === "rtl" ? "left-0" : "right-0"
                  } mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>{t("topNavbar.notifications")}</span>
                    <span className="text-purple-600 text-xs font-semibold">
                      {notifications.length} {t("nav.notifications")}
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-2">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.notificationId} className="py-2.5">
                        <div className="font-bold text-slate-800">
                          {lang === "ar" ? notif.titleAr : notif.titleEn}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          {lang === "ar" ? notif.bodyAr : notif.bodyEn}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>
                            {new Date(notif.sentAt).toLocaleDateString(
                              lang === "ar" ? "ar-SA" : "en-US",
                            )}
                          </span>
                          <span className="uppercase text-purple-600 font-bold">
                            {notif.channel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout if user is logged in */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-purple-900/60 hover:bg-rose-800/80 border border-purple-700/50 text-purple-200 hover:text-white transition-all cursor-pointer"
              title={t("topNavbar.logout")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Push Notification Modal */}
      <BroadcastNotificationModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </header>
  );
};
