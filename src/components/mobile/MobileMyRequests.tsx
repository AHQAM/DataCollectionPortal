import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestItem } from '../../types';
import {
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  Search,
  WifiOff,
  Filter,
} from 'lucide-react';
import { MobileRequestDetails } from './MobileRequestDetails';

export const MobileMyRequests: React.FC = () => {
  const { lang, dir, t, requests, records, fields, currentUser, isOnline } = useApp();

  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Scoped strictly to requests matching representative's active assignments or published status
  const userAllowedRegions = currentUser?.allowedRegionNos || [currentUser?.regionNo || '101'];

  const filteredRequests = requests.filter((req) => {
    if (filterTab === 'ACTIVE' && req.status !== 'Published') return false;
    if (filterTab === 'ARCHIVED' && req.status !== 'Archived') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAr = req.titleAr.toLowerCase().includes(q);
      const matchEn = req.titleEn.toLowerCase().includes(q);
      const matchCode = req.requestCode.toLowerCase().includes(q);
      if (!matchAr && !matchEn && !matchCode) return false;
    }

    return true;
  });

  if (selectedRequest) {
    const reqFields = fields.filter((f) => f.requestId === selectedRequest.requestId);
    return (
      <MobileRequestDetails
        request={selectedRequest}
        fields={reqFields}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">
            {lang === 'ar' ? 'طلبات جمع البيانات' : 'Data Collection Tasks'}
          </h1>
          <div className="text-[10px] text-slate-400">
            {lang === 'ar'
              ? `المندوب: ${currentUser?.repNameAr || ''} • المناطق: ${userAllowedRegions.join(', ')}`
              : `Rep: ${currentUser?.repNameEn || currentUser?.repNameAr || ''} • Regions: ${userAllowedRegions.join(', ')}`}
          </div>
        </div>

        {!isOnline && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            <WifiOff className="w-3 h-3" />
            <span>{lang === 'ar' ? 'أوفلاين' : 'Offline'}</span>
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث في الطلبات...' : 'Search requests...'}
            className="w-full h-11 ps-10 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
              filterTab === 'ACTIVE'
                ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'ar' ? 'النشطة' : 'Active'}
          </button>
          <button
            onClick={() => setFilterTab('ARCHIVED')}
            className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
              filterTab === 'ARCHIVED'
                ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'ar' ? 'الأرشيف' : 'Archived'}
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="font-bold text-xs">
                {lang === 'ar' ? 'لا توجد طلبات في هذا التبويب' : 'No requests in this tab'}
              </div>
            </div>
          ) : (
            filteredRequests.map((req) => {
              // Calculate representative's scoped records for this request
              const repRecords = records.filter(
                (r) => r.requestId === req.requestId && userAllowedRegions.includes(r.assignedRegionNo)
              );
              const totalCount = repRecords.length;
              const completedCount = repRecords.filter((r) => r.recordStatus === 'Completed').length;
              const remainingCount = Math.max(0, totalCount - completedCount);
              const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              const isUrgent = req.priority === 'Urgent';
              const isOverdue = new Date(req.dueAt) < new Date();

              return (
                <div
                  key={req.requestId}
                  onClick={() => setSelectedRequest(req)}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 hover:border-purple-400 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                          {req.requestCode}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </div>
                      <h2 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {lang === 'ar' ? req.titleAr : req.titleEn}
                      </h2>
                    </div>

                    <div className="text-slate-400">
                      {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                    {lang === 'ar' ? req.descriptionAr : req.descriptionEn}
                  </p>

                  {/* Progress info */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500">
                        {completedCount} / {totalCount} {lang === 'ar' ? 'سجل مكتمل' : 'completed'}
                        {remainingCount > 0 && ` (${remainingCount} متبقٍ)`}
                      </span>
                      <span className="text-purple-900 font-extrabold">{progressPct}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPct === 100 ? 'bg-emerald-500' : 'bg-purple-900'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {lang === 'ar' ? 'الاستحقاق: ' : 'Due: '}
                          {new Date(req.dueAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                      {isOverdue && req.status === 'Published' && (
                        <span className="text-rose-600 font-bold">
                          {lang === 'ar' ? 'متأخر' : 'Overdue'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
