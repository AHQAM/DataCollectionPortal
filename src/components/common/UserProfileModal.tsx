import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase";
import {
  User,
  Lock,
  X,
  Check,
  AlertCircle,
  Shield,
  UserCircle2,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser, lang, dir } = useApp();

  const [username, setUsername] = useState(
    currentUser?.username || currentUser?.userNo || "",
  );
  const [userNameAr, setUserNameAr] = useState(currentUser?.userNameAr || "");
  const [userNameEn, setUserNameEn] = useState(currentUser?.userNameEn || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword.length < 6) {
      setError(
        lang === "ar"
          ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل"
          : "Password must be at least 6 characters",
      );
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError(
        lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
      );
      return;
    }

    setLoading(true);
    try {
      const updateFn = httpsCallable(functions, "updateUserProfile");
      const res: any = await updateFn({
        newUsername: username.trim(),
        userNameAr: userNameAr.trim(),
        userNameEn: userNameEn.trim(),
        newPassword: newPassword ? newPassword : undefined,
      });

      if (res.data?.success) {
        if (setCurrentUser) {
          setCurrentUser({
            ...currentUser,
            username: username.trim(),
            userNameAr: userNameAr.trim(),
            userNameEn: userNameEn.trim(),
          });
        }
        setSuccess(
          lang === "ar"
            ? res.data.messageAr || "تم تحديث الملف الشخصي بنجاح"
            : res.data.messageEn || "Profile updated successfully",
        );
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(
        err.message ||
          (lang === "ar"
            ? "حدث خطأ أثناء تحديث الملف الشخصي"
            : "Failed to update profile"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        dir={dir}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-700/80 border border-purple-500/40 flex items-center justify-center font-bold text-white shadow-inner">
              <UserCircle2 className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">
                {lang === "ar" ? "الملف الشخصي" : "User Profile"}
              </h2>
              <p className="text-[11px] text-purple-300">
                {currentUser.role} • #
                {currentUser.regionNo || currentUser.branchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Email (Read-Only) */}
          {(currentUser.email ||
            currentUser.role === "SUPERVISOR" ||
            currentUser.role === "ADMIN") && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {lang === "ar" ? "(غير قابل للتعديل)" : "(Read-only)"}
                </span>
              </div>
              <input
                type="text"
                disabled
                value={
                  currentUser.email || (lang === "ar" ? "غير مسجل" : "Not set")
                }
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>
          )}

          {/* Region Number (Read-Only for Reps / Users) */}
          {currentUser.role === "REP" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  {lang === "ar"
                    ? "رقم المنطقة المخصصة"
                    : "Assigned Region Number"}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {lang === "ar" ? "(غير قابل للتعديل)" : "(Read-only)"}
                </span>
              </div>
              <input
                type="text"
                disabled
                value={
                  currentUser.regionNo ||
                  (lang === "ar" ? "غير محدد" : "Not assigned")
                }
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-xs cursor-not-allowed font-bold"
              />
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar"
                ? "اسم المستخدم (لتسجيل الدخول)"
                : "Username (Login ID)"}
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-9 pr-9 pl-3 rounded-xl border border-slate-300 font-mono text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* Name in Arabic */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
            </label>
            <input
              type="text"
              required
              value={userNameAr}
              onChange={(e) => setUserNameAr(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Name in English */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === "ar" ? "الاسم بالإنجليزية" : "Name (English)"}
            </label>
            <input
              type="text"
              value={userNameEn}
              onChange={(e) => setUserNameEn(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="block font-black text-slate-800 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-700" />
              <span>
                {lang === "ar"
                  ? "تغيير كلمة المرور (اختياري)"
                  : "Change Password (Optional)"}
              </span>
            </span>

            <div className="space-y-2">
              <div>
                <input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder={
                    lang === "ar"
                      ? "كلمة المرور الجديدة (6 أحرف فأكثر)"
                      : "New password (min 6 chars)"
                  }
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-mono focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {newPassword && (
                <div>
                  <input
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    placeholder={
                      lang === "ar"
                        ? "تأكيد كلمة المرور الجديدة"
                        : "Confirm new password"
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-mono focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{lang === "ar" ? "حفظ التغييرات" : "Save Changes"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
