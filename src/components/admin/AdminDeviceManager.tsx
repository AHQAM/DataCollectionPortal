import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Unlock,
  Clock,
  Laptop,
} from "lucide-react";

export const AdminDeviceManager: React.FC = () => {
  const {
    lang,
    t,
    deviceBindings,
    releaseDeviceBinding,
    approveDeviceReplacement,
    rejectDeviceReplacement,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredBindings = deviceBindings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.userNameAr.toLowerCase().includes(q);
      const matchReg = b.regionNo.includes(q);
      const matchDevice = (b.deviceLabel || "").toLowerCase().includes(q);
      const matchUuid = (b.deviceIdHash || "").toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchDevice && !matchUuid) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-700" />
            <span>
              {lang === "ar"
                ? "مركز أمان وربط أجهزة المستخدمين"
                : "User Device Binding & Security"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "ar"
              ? "تأمين تسجيل الدخول وحصر كل مستخدم على هاتف ذكي معتمد برقم UUID فريد"
              : "Enforce single-device binding and approve phone replacements with UUID validation"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl">
            {deviceBindings.filter((b) => b.status === "ACTIVE").length}{" "}
            {lang === "ar" ? "جهاز نشط" : "Active Devices"}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث باسم المستخدم، طراز الهاتف، UUID..."
                : "Search by user, model, UUID..."
            }
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
        </div>

        <div className="flex gap-1.5 text-xs">
          {[
            { key: "ALL", labelAr: "الكل", labelEn: "All" },
            {
              key: "ACTIVE",
              labelAr: "الأجهزة النشطة",
              labelEn: "Bound & Active",
            },
            {
              key: "PENDING_REPLACEMENT",
              labelAr: "طلبات التبديل المعلقة",
              labelEn: "Replacement Pending",
            },
            { key: "RELEASED", labelAr: "تم فك الارتباط", labelEn: "Unbound" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                statusFilter === tab.key
                  ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {lang === "ar" ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Device Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "المستخدم والمنطقة" : "User & Region"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "طراز الهاتف والنظام" : "Device & OS"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "معرّف التثبيت (UUID)" : "Installation UUID"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "تاريخ أول ربط" : "First Bound"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "حالة الربط" : "Binding Status"}
                </th>
                <th className="px-4 py-3 text-center">
                  {lang === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBindings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {lang === "ar"
                      ? "لا توجد أجهزة مطابقة للفلتر"
                      : "No device bindings found"}
                  </td>
                </tr>
              ) : (
                filteredBindings.map((b) => {
                  return (
                    <tr
                      key={b.bindingId}
                      className="hover:bg-slate-50/80 transition-all"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900">
                          {b.userNameAr}
                        </div>
                        <div className="text-[10px] text-purple-700 font-mono font-bold">
                          المنطقة #{b.regionNo}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{b.deviceLabel || "Android Phone"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {b.devicePlatform || "Android"} • v
                          {b.appVersion || "1.0.0"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-700 select-all">
                          {(b.deviceIdHash || "").substring(0, 20)}...
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500">
                        {new Date(b.boundAt).toLocaleDateString(
                          lang === "ar" ? "ar-SA" : "en-US",
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "PENDING_REPLACEMENT"
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {b.status === "ACTIVE"
                            ? lang === "ar"
                              ? "معتمد ونشط"
                              : "Active Bound"
                            : b.status === "PENDING_REPLACEMENT"
                              ? lang === "ar"
                                ? "بانتظار الموافقة"
                                : "Pending Approval"
                              : lang === "ar"
                                ? "مفكوك"
                                : "Unbound"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {b.status === "ACTIVE" && (
                            <button
                              onClick={() => releaseDeviceBinding(b.userId)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200"
                              title={
                                lang === "ar"
                                  ? "فك الارتباط فوراً"
                                  : "Release Device"
                              }
                            >
                              {lang === "ar" ? "فك الارتباط" : "Release"}
                            </button>
                          )}

                          {b.status === "PENDING_REPLACEMENT" && (
                            <>
                              <button
                                onClick={() =>
                                  approveDeviceReplacement(b.bindingId)
                                }
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                              >
                                {lang === "ar" ? "موافقة" : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  rejectDeviceReplacement(b.bindingId)
                                }
                                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px]"
                              >
                                {lang === "ar" ? "رفض" : "Reject"}
                              </button>
                            </>
                          )}
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
    </div>
  );
};
