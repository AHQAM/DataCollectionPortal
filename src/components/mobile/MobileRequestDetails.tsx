import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestItem, RecordItem, RequestField } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileEdit,
  AlertCircle,
  Calendar,
  Building,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Layers,
} from 'lucide-react';
import { MobileRecordForm } from './MobileRecordForm';

interface Props {
  request: RequestItem;
  fields: RequestField[];
  onBack: () => void;
}

export const MobileRequestDetails: React.FC<Props> = ({ request, fields, onBack }) => {
  const { lang, dir, t, currentUser, records, selectedRegionNo, setSelectedRegionNo } = useApp();

  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter records scoped strictly to representative's authorized region and current request!
  const userAllowedRegions = currentUser?.allowedRegionNos || [currentUser?.regionNo || '101'];

  const filteredRecords = records.filter((rec) => {
    if (rec.requestId !== request.requestId) return false;
    // Authorized scope check: Must be in rep's allowed regions
    if (!userAllowedRegions.includes(rec.assignedRegionNo)) return false;
    // Current selected region tab filter
    if (rec.assignedRegionNo !== selectedRegionNo) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.customerName.toLowerCase().includes(q);
      const matchNo = rec.customerNo.toLowerCase().includes(q);
      if (!matchName && !matchNo) return false;
    }

    // Status filter
    if (statusFilter === 'COMPLETED') return rec.recordStatus === 'Completed';
    if (statusFilter === 'PENDING') return rec.recordStatus === 'Pending';
    if (statusFilter === 'DRAFT') return rec.recordStatus === 'DraftSaved';

    return true;
  });

  // Calculate region stats
  const totalInRegion = records.filter(
    (r) => r.requestId === request.requestId && r.assignedRegionNo === selectedRegionNo
  ).length;
  const completedInRegion = records.filter(
    (r) =>
      r.requestId === request.requestId &&
      r.assignedRegionNo === selectedRegionNo &&
      r.recordStatus === 'Completed'
  ).length;
  const progressPercent = totalInRegion > 0 ? Math.round((completedInRegion / totalInRegion) * 100) : 0;

  if (selectedRecord) {
    return (
      <MobileRecordForm
        record={selectedRecord}
        fields={fields}
        onBack={() => setSelectedRecord(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all flex items-center gap-1 text-xs font-bold"
        >
          {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{lang === 'ar' ? 'الطلبات' : 'Requests'}</span>
        </button>

        <div className="text-center truncate px-2">
          <div className="text-xs font-extrabold text-slate-900 truncate">
            {lang === 'ar' ? request.titleAr : request.titleEn}
          </div>
          <div className="text-[10px] text-purple-700 font-mono font-bold">{request.requestCode}</div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            request.priority === 'Urgent'
              ? 'bg-rose-100 text-rose-800'
              : request.priority === 'High'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {request.priority}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Request Overview Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {lang === 'ar' ? request.descriptionAr : request.descriptionEn}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span>
                {lang === 'ar' ? 'تاريخ الاستحقاق: ' : 'Due: '}
                {new Date(request.dueAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
              </span>
            </div>
            <div className="font-bold text-slate-700">
              {completedInRegion}/{totalInRegion} {lang === 'ar' ? 'سجل مكتمل' : 'completed'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-purple-900'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>{lang === 'ar' ? 'نسبة الإنجاز في منطقتك' : 'Region completion'}</span>
            <span className="text-purple-900 font-extrabold">{progressPercent}%</span>
          </div>
        </div>

        {/* Multi-Region Selector (if representative has multiple regions) */}
        {userAllowedRegions.length > 1 && (
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-900 mb-2">
              <Layers className="w-4 h-4 text-purple-700" />
              <span>{lang === 'ar' ? 'تبديل المنطقة المصرحة:' : 'Switch Authorized Region:'}</span>
            </div>
            <div className="flex gap-2">
              {userAllowedRegions.map((regNo) => (
                <button
                  key={regNo}
                  onClick={() => setSelectedRegionNo(regNo)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedRegionNo === regNo
                      ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                      : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100/50'
                  }`}
                >
                  {lang === 'ar' ? `المنطقة #${regNo}` : `Region #${regNo}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Status Filters */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث باسم العميل أو رقمه...' : 'Search by customer name or ID...'}
              className="w-full h-11 ps-10 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'ALL', labelAr: 'الكل', labelEn: 'All' },
              { key: 'PENDING', labelAr: 'معلق', labelEn: 'Pending' },
              { key: 'DRAFT', labelAr: 'مسودات', labelEn: 'Drafts' },
              { key: 'COMPLETED', labelAr: 'مكتمل', labelEn: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border text-xs ${
                  statusFilter === tab.key
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lang === 'ar' ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Records List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>{lang === 'ar' ? `سجلات العملاء (${filteredRecords.length})` : `Customer Records (${filteredRecords.length})`}</span>
            <span className="text-[10px] text-slate-400 font-mono">{lang === 'ar' ? 'المنطقة ' + selectedRegionNo : 'Region ' + selectedRegionNo}</span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="font-bold text-xs">
                {lang === 'ar' ? 'لا توجد سجلات مطابقة' : 'No matching customer records'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'ar' ? 'جرب تغيير شروط البحث أو الفلاتر' : 'Try adjusting search or filters'}
              </div>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isDone = rec.recordStatus === 'Completed';
              const isDraft = rec.recordStatus === 'DraftSaved';

              return (
                <div
                  key={rec.recordId}
                  onClick={() => setSelectedRecord(rec)}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDraft
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isDone
                          ? lang === 'ar' ? 'مكتمل' : 'Completed'
                          : isDraft
                          ? lang === 'ar' ? 'مسودة' : 'Draft'
                          : lang === 'ar' ? 'معلق' : 'Pending'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{rec.customerNo}</span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 truncate">
                      {rec.customerName}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="truncate">{rec.area || rec.branchName}</span>
                      {rec.rawData?.TargetItem && (
                        <span className="text-purple-700 truncate font-semibold">
                          • {rec.rawData.TargetItem}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
