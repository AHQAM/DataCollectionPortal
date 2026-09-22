import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  ShieldCheck,
  LayoutDashboard,
  Lock,
  User as UserIcon,
  AlertCircle,
  Globe,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export const AuthPortal: React.FC = () => {
  const { lang, setLang, dir, login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError(
        lang === "ar" ? "يرجى إدخال البريد الإلكتروني" : "Please enter email",
      );
      return;
    }
    if (!password.trim()) {
      setError(
        lang === "ar" ? "يرجى إدخال كلمة المرور" : "Please enter password",
      );
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(lang === "ar" ? result.messageAr : result.messageEn);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-100 via-purple-50/40 to-slate-200/80">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/60 border border-purple-400/40 flex items-center justify-center font-black text-lg shadow-md">
                ف
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white">
                  {lang === "ar"
                    ? "بوابة جمع البيانات الميدانية"
                    : "Field Data Collection Portal"}
                </h1>
                <p className="text-[11px] text-purple-200 mt-0.5 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {lang === "ar"
                      ? "بوابة تسجيل الدخول المعتمدة والمحمية"
                      : "Secure Enterprise Authentication Portal"}
                  </span>
                </p>
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "English" : "عربي"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 text-xs text-purple-950 flex items-start gap-2">
              <LayoutDashboard className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {lang === "ar"
                  ? "بوابة الدخول الإدارية لمدير النظام والمشرفين لمتابعة العمليات الميدانية والتحكم بنماذج الفروع وإعدادات النظام."
                  : "Administrative portal for system admins and supervisors to manage operations, forms, and branches."}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "أدخل البريد الإلكتروني"
                      : "Enter email address"
                  }
                  className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                {lang === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pr-10 pl-4 rounded-xl border border-slate-300 font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{lang === "ar" ? "تسجيل الدخول" : "Login"}</span>
              {dir === "rtl" ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === "ar"
                ? "بوابة الدخول محمية ومشفرة"
                : "Secure & Encrypted Portal"}
            </span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
      </div>
    </div>
  );
};
