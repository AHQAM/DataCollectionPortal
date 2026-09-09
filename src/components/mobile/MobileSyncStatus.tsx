import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Clock,
  Database,
  CloudUpload,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const MobileSyncStatus: React.FC = () => {
  const { lang, t, isOnline, setIsOnline, offlineQueue, syncOfflineQueue, records } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncOfflineQueue();
      setIsSyncing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <h1 className="text-base font-extrabold text-slate-900">
          {lang === 'ar' ? 'حالة المزامنة والعمل أوفلاين' : 'Sync & Offline Status'}
        </h1>
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
            isOnline
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
          <span>{isOnline ? (lang === 'ar' ? 'متصل' : 'Online') : (lang === 'ar' ? 'غير متصل' : 'Offline')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Indicator Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 text-center">
          <div
            className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isOnline ? <CloudUpload className="w-7 h-7" /> : <WifiOff className="w-7 h-7" />}
          </div>

          <h2 className="font-extrabold text-sm text-slate-900">
            {isOnline
              ? lang === 'ar' ? 'تمت المزامنة بنجاح مع السيرفر' : 'Synced with Cloud Server'
              : lang === 'ar' ? 'غير متصل بالإنترنت (وضع أوفلاين)' : 'Offline Mode (Local Storage)'}
          </h2>

          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {isOnline
              ? lang === 'ar'
                ? 'جميع استجابات النماذج والمسودات متزامنة مع قاعدة بيانات فيربيس في الوقت الفعلي.'
                : 'All form drafts and completed records are synchronized with Firebase Firestore.'
              : lang === 'ar'
                ? 'يمكنك متابعة تعبئة النماذج وحفظ المسودات بدون إنترنت. سيتم إدراجها في قائمة الانتظار للمزامنة فور عودة الاتصال.'
                : 'You can continue filling forms and saving drafts. Changes are queued locally and will sync when reconnected.'}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={!isOnline || offlineQueue.length === 0 || isSyncing}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? lang === 'ar' ? 'جارٍ المزامنة...' : 'Syncing...'
                  : lang === 'ar' ? 'مزامنة السجلات المعلقة الآن' : 'Sync Pending Queue'}
              </span>
            </button>
          </div>
        </div>

        {/* Sync States Dictionary Card (Section 17 Requirements) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <div className="font-extrabold text-xs text-slate-800 mb-2.5 pb-1 border-b border-slate-100">
            {lang === 'ar' ? 'دليل حالات المزامنة المعتمدة' : 'Official Synchronization States'}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <div>
                <div className="font-bold text-slate-800">{lang === 'ar' ? 'غير متصل' : 'Offline'}</div>
                <div className="text-[10px] text-slate-400">Offline status</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <div>
                <div className="font-bold text-slate-800">{lang === 'ar' ? 'تم الحفظ محلياً' : 'Saved locally'}</div>
                <div className="text-[10px] text-slate-400">Cached in local storage</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div>
                <div className="font-bold text-slate-800">{lang === 'ar' ? 'جارٍ المزامنة' : 'Syncing'}</div>
                <div className="text-[10px] text-slate-400">Uploading to server</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <div className="font-bold text-slate-800">{lang === 'ar' ? 'تمت المزامنة' : 'Synced'}</div>
                <div className="text-[10px] text-slate-400">Server verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Queued Records List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>{lang === 'ar' ? `قائمة الانتظار المحلية (${offlineQueue.length})` : `Local Queue (${offlineQueue.length})`}</span>
            {offlineQueue.length > 0 && (
              <span className="text-[10px] text-amber-600 font-semibold">
                {lang === 'ar' ? 'في انتظار الاتصال' : 'Waiting for connection'}
              </span>
            )}
          </div>

          {offlineQueue.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400 border border-slate-200">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1.5 opacity-80" />
              <div className="font-bold text-xs text-slate-700">
                {lang === 'ar' ? 'قائمة الانتظار فارغة' : 'Queue is empty'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'ar' ? 'لا توجد سجلات معلقة بانتظار المزامنة' : 'No records pending upload'}
              </div>
            </div>
          ) : (
            offlineQueue.map((item) => {
              const rec = records.find((r) => r.recordId === item.recordId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-amber-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-800">
                      {rec?.customerName || item.recordId}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono">{rec?.customerNo}</span>
                      <span>•</span>
                      <span>{item.isDraft ? (lang === 'ar' ? 'مسودة' : 'Draft') : (lang === 'ar' ? 'اعتماد نهائي' : 'Submission')}</span>
                      <span>•</span>
                      <span>{new Date(item.queuedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {lang === 'ar' ? 'تم الحفظ محلياً' : 'Saved locally'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
