import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { BroadcastNotificationModal } from "../admin/BroadcastNotificationModal";
import { UserProfileModal } from "./UserProfileModal";
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
  User,
  CheckCheck,
} from "lucide-react";

export const TopNavbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    lang,
    setLang,
    dir,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentUser,
    users,
    quickSwitchUser,
    logout,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const userNotifications = notifications.filter(
    (n) =>
      !currentUser ||
      n.userId === currentUser.userId ||
      currentUser.role === "ADMIN",
  );

  const unreadCount = userNotifications.filter(
    (n) => n.status !== "READ",
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
              <span>{t("common.appTitle", { lng: lang })}</span>
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
                title={t("topNavbar.qaSwitcher", { lng: lang })}
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden md:inline font-bold">
                  {t("roles.admin", { lng: lang })}
                </span>
              </button>

              {showRoleMenu && (
                <div
                  className={`absolute ${
                    dir === "rtl" ? "left-0" : "right-0"
                  } mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="px-3 py-1.5 font-bold text-slate-500 border-b border-slate-100 flex items-center justify-between">
                    <span>{t("topNavbar.qaModalTitle", { lng: lang })}</span>
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
              title={t("topNavbar.broadcast", { lng: lang })}
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
                  } mt-2 w-80 sm:w-88 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span>{t("topNavbar.notifications", { lng: lang })}</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          {unreadCount} {lang === "ar" ? "جديد" : "new"}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() =>
                          markAllNotificationsAsRead(currentUser?.userId)
                        }
                        className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        title={lang === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "قراءة الكل" : "Mark all read"}</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>
                          {lang === "ar"
                            ? "لا توجد إشعارات حالياً"
                            : "No notifications currently"}
                        </p>
                      </div>
                    ) : (
                      userNotifications.slice(0, 10).map((notif) => {
                        const isUnread = notif.status !== "READ";
                        return (
                          <div
                            key={notif.notificationId}
                            onClick={() => {
                              if (isUnread) {
                                markNotificationAsRead(notif.notificationId);
                              }
                            }}
                            className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                              isUnread
                                ? "bg-purple-50/70 hover:bg-purple-100/70 border-s-2 border-purple-600"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={`text-xs ${
                                  isUnread
                                    ? "font-bold text-slate-900"
                                    : "font-medium text-slate-700"
                                }`}
                              >
                                {lang === "ar" ? notif.titleAr : notif.titleEn}
                              </div>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1" />
                              )}
                            </div>
                            <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                              {lang === "ar" ? notif.bodyAr : notif.bodyEn}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                              <span>
                                {new Date(notif.sentAt).toLocaleDateString(
                                  lang === "ar" ? "ar-SA" : "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {isUnread && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markNotificationAsRead(
                                      notif.notificationId,
                                    );
                                  }}
                                  className="text-[10px] text-purple-600 hover:text-purple-800 font-bold hover:underline"
                                >
                                  {lang === "ar"
                                    ? "تحديد كمقروء"
                                    : "Mark read"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Button */}
          {currentUser && (
            <button
              onClick={() => {
                setShowProfileModal(true);
                closeAllMenus();
              }}
              className="p-2 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-purple-200 hover:text-white transition-all cursor-pointer"
              title={lang === "ar" ? "الملف الشخصي والأمان" : "User Profile & Security"}
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {/* Logout if user is logged in */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-purple-900/60 hover:bg-rose-800/80 border border-purple-700/50 text-purple-200 hover:text-white transition-all cursor-pointer"
              title={t("topNavbar.logout", { lng: lang })}
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

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};
