import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import { useApp } from "../../context/AppContext";
import { Send, X, AlertCircle, CheckCircle2, Radio, Users } from "lucide-react";

interface BroadcastNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastNotificationModal: React.FC<
  BroadcastNotificationModalProps
> = ({ isOpen, onClose }) => {
  const { lang, dir , t} = useApp();

  const [targetAudience, setTargetAudience] = useState<
    "ALL" | "REPRESENTATIVES" | "SUPERVISORS"
  >("ALL");
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [requestId, setRequestId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !titleAr.trim() ||
      !titleEn.trim() ||
      !bodyAr.trim() ||
      !bodyEn.trim()
    ) {
      setStatusMessage({
        type: "error",
        text:
          t("auto.pleaseFillAllRequired"),
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const sendBroadcast = httpsCallable<
        {
          targetAudience: string;
          titleAr: string;
          titleEn: string;
          bodyAr: string;
          bodyEn: string;
          payload?: Record<string, string>;
        },
        { success: boolean; count: number }
      >(functions, "sendBroadcastNotification");

      const payload: Record<string, string> = {
        type: "BROADCAST",
      };
      if (requestId.trim()) {
        payload.requestId = requestId.trim();
      }

      const res = await sendBroadcast({
        targetAudience,
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        bodyAr: bodyAr.trim(),
        bodyEn: bodyEn.trim(),
        payload,
      });

      setStatusMessage({
        type: "success",
        text:
          lang === "ar"
            ? `تم إرسال الإشعار بنجاح إلى ${res.data.count} مستخدم!`
            : `Notification successfully sent to ${res.data.count} users!`,
      });

      // Clear form on success
      setTitleAr("");
      setTitleEn("");
      setBodyAr("");
      setBodyEn("");
      setRequestId("");
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 2000);
    } catch (err: any) {
      console.error("Error sending broadcast notification:", err);
      setStatusMessage({
        type: "error",
        text:
          err?.message ||
          (t("auto.failedToSendNotification")),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      dir={dir}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {t("auto.broadcastPushNotification")}
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                {t("auto.sendInstantPushTo")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-700" />
              <span>
                {t("auto.targetAudience")}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "ALL", labelAr: "الجميع", labelEn: "All" },
                  {
                    id: "REPRESENTATIVES",
                    labelAr: "المستخدمين الميدانيين",
                    labelEn: "Field Users",
                  },
                  {
                    id: "SUPERVISORS",
                    labelAr: "المشرفين",
                    labelEn: "Supervisors",
                  },
                ] as const
              ).map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setTargetAudience(opt.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    targetAudience === opt.id
                      ? "bg-purple-900 text-white border-purple-900 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {lang === "ar" ? opt.labelAr : opt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Title AR / EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("auto.titleArabic")}
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={
                  t("auto.egImportantNoticeTo")
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("auto.titleEnglish")}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Important Alert for all Reps"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-medium"
              />
            </div>
          </div>

          {/* Body AR / EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("auto.bodyArabic")}
              </label>
              <textarea
                required
                rows={3}
                value={bodyAr}
                onChange={(e) => setBodyAr(e.target.value)}
                placeholder="اكتب نص الإشعار هنا..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("auto.bodyEnglish")}
              </label>
              <textarea
                required
                rows={3}
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                placeholder="Write notification message here..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none font-medium"
              />
            </div>
          </div>

          {/* Optional Request ID for Deep Linking */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("auto.requestIdOptionalFor")}
            </label>
            <input
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="e.g. REQ-2026-001"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono font-medium"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t("auto.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? t("auto.sending")
                  : t("auto.sendBroadcastNow")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
