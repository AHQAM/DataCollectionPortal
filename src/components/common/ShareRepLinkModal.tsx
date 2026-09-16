import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  X,
  MessageCircle,
  QrCode,
} from 'lucide-react';

interface ShareRepLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareRepLinkModal: React.FC<ShareRepLinkModalProps> = ({ isOpen, onClose }) => {
  const { lang, users } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the direct link for representatives
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const repLink = `${origin}${pathname}?view=mobile`;

  const handleCopy = () => {
    navigator.clipboard.writeText(repLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenTest = () => {
    window.open(repLink, '_blank');
  };

  const shareText =
    lang === 'ar'
      ? `رابط تطبيق جمع البيانات الميدانية للمندوبين:\n${repLink}\n\nيرجى فتح الرابط من الهاتف وتسجيل الدخول برقم المنطقة وكلمة المرور المسندة لك.`
      : `Field Sales Collection App for Representatives:\n${repLink}\n\nPlease open from your mobile device and log in with your assigned Region Number.`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const repUsers = users.filter((u) => u.role === 'REP');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {lang === 'ar' ? 'مشاركة رابط تطبيق المندوبين' : 'Share Field Rep Application Link'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ar'
                  ? 'رابط مباشر محمي لفتح تطبيق الجوال الميداني فقط دون أي وصول للوحة الإدارة'
                  : 'Direct secure URL to open field mobile app without admin dashboard access'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Reassurance Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-emerald-950">
            <div className="font-extrabold">
              {lang === 'ar' ? 'حماية وعزل الصلاحيات التام (Role Isolation):' : 'Strict Role Isolation Enforced:'}
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              {lang === 'ar'
                ? 'عندما يفتح المندوب هذا الرابط من هاتفه، يظهر له تطبيق الجوال الميداني وشاشة تسجيل الدخول فقط. لا يمكن للمندوبين رؤية لوحة الإدارة، أو الاطلاع على بيانات فروع أخرى، أو تعديل إعدادات النظام.'
                : 'When reps open this URL on their phones, they are locked into the mobile rep interface and login. They cannot access admin settings, other branches, or system database controls.'}
            </p>
          </div>
        </div>

        {/* Link Box & Copy Button */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {lang === 'ar' ? 'رابط تطبيق المندوب الميداني (انسخ وأرسل):' : 'Field Rep Link (Copy & Send):'}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-purple-900 truncate select-all">
              {repLink}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-900 hover:bg-purple-800 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Test */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إرسال عبر الواتساب' : 'Share via WhatsApp'}</span>
          </a>

          <button
            type="button"
            onClick={handleOpenTest}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>{lang === 'ar' ? 'تجربة فتح الرابط في نافذة جديدة' : 'Test Rep View in New Tab'}</span>
          </button>
        </div>

        {/* Quick Rep Accounts Helper */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-700 flex items-center justify-between">
            <span>{lang === 'ar' ? 'أرقام مناطق المناديب المسجلة بالنظام:' : 'Registered Rep Region Accounts:'}</span>
            <span className="text-[10px] text-purple-700 font-bold">{repUsers.length} مناديب</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {repUsers.slice(0, 6).map((u) => (
              <span
                key={u.userId}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 shadow-2xs"
              >
                {lang === 'ar' ? `منطقة ${u.regionNo}` : `Region ${u.regionNo}`} ({u.repNameAr.split(' ')[0]})
              </span>
            ))}
          </div>
          <div className="text-[10px] text-slate-400">
            {lang === 'ar'
              ? 'يحصل كل مندوب جديد على كلمة مرور مؤقتة لمرة واحدة ويطلب التطبيق تغييرها عند أول تسجيل دخول'
              : 'Each new rep receives a one-time temporary password and must change it on first login'}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
