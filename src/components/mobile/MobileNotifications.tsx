import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export const MobileNotifications: React.FC = () => {
  const {
    lang,
    t,
    notifications,
    markNotificationAsRead,
    currentUser,
    enablePushNotifications,
    isPushSupported,
    pushPermission,
  } = useApp();

  // Filter notifications for representative
  const repNotifications = notifications.filter(
    (n) => !currentUser || n.userId === currentUser.userId || currentUser.role === 'ADMIN'
  );

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <h1 className="text-base font-extrabold text-slate-900">
          {lang === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications & Alerts'}
        </h1>
        <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
          {repNotifications.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {/* Push Notification Activation Card */}
        {isPushSupported && (
          <div className="bg-white rounded-2xl p-3.5 border border-purple-200/80 shadow-xs mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {lang === 'ar' ? 'إشعارات الجوال الفورية' : 'Instant Mobile Push Alerts'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {pushPermission === 'granted'
                      ? lang === 'ar'
                        ? 'مفعلة — ستصلك التنبيهات حتى عند قفل الشاشة'
                        : 'Active — You will receive alerts on lock screen'
                      : lang === 'ar'
                      ? 'تفعيل التنبيهات عند نزول طلبات أو مهام جديدة'
                      : 'Enable alerts when new requests or tasks arrive'}
                  </div>
                </div>
              </div>

              {pushPermission === 'granted' ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{lang === 'ar' ? 'مفعّلة' : 'Active'}</span>
                </span>
              ) : (
                <button
                  onClick={() => enablePushNotifications()}
                  className="text-xs font-extrabold bg-purple-900 hover:bg-purple-800 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  {lang === 'ar' ? 'تفعيل الآن' : 'Enable'}
                </button>
              )}
            </div>
          </div>
        )}
        {repNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <div className="font-bold text-xs">
              {lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications'}
            </div>
          </div>
        ) : (
          repNotifications.map((n) => {
            const isRead = n.status === 'READ';
            return (
              <div
                key={n.notificationId}
                onClick={() => markNotificationAsRead(n.notificationId)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                  isRead
                    ? 'bg-white border-slate-200/80'
                    : 'bg-purple-50/60 border-purple-200 shadow-xs ring-1 ring-purple-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRead ? 'bg-slate-300' : 'bg-purple-700 animate-pulse'
                      }`}
                    />
                    <h2 className="text-xs font-bold text-slate-900">
                      {lang === 'ar' ? n.titleAr : n.titleEn}
                    </h2>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded">
                    {n.channel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {lang === 'ar' ? n.bodyAr : n.bodyEn}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.sentAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                  </div>
                  {isRead ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'تمت القراءة' : 'Read'}</span>
                    </span>
                  ) : (
                    <span className="text-purple-700 font-bold">
                      {lang === 'ar' ? 'جديد' : 'Unread'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
