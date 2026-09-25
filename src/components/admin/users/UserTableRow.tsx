import React from "react";
import { useTranslation } from "react-i18next";
import { User } from "../../../types";
import { Smartphone, Lock, CheckCircle2, KeyRound, Unlock } from "lucide-react";

interface UserTableRowProps {
  user: User;
  lang?: "ar" | "en";
  onResetPassword: (userId: string) => void;
  onUnlockUser: (userId: string) => void;
  onReleaseDevice: (userId: string) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  lang,
  onResetPassword,
  onUnlockUser,
  onReleaseDevice,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date();
  const isDeviceBound = !!user.boundDeviceId;

  return (
    <tr className="hover:bg-slate-50/80 transition-all">
      <td className="px-4 py-3.5">
        <div className="font-extrabold text-slate-900">{user.userNameAr}</div>
        <div className="text-[10px] text-slate-400 font-mono">
          {user.userNo || user.role} • {user.userNameEn || ""}
        </div>
      </td>

      <td className="px-4 py-3.5 font-mono font-bold text-purple-950">
        #{user.regionNo}
      </td>

      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {(user.allowedRegionNos || [user.regionNo]).map((reg) => (
            <span
              key={reg}
              className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-mono text-[10px] font-bold border border-purple-200"
            >
              #{reg}
            </span>
          ))}
        </div>
      </td>

      <td className="px-4 py-3.5 text-slate-700">
        {currentLang === "ar" ? user.branchNameAr : user.branchNameEn}
      </td>

      <td className="px-4 py-3.5">
        {isDeviceBound ? (
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <Smartphone className="w-3 h-3" />
              <span>{user.boundDeviceLabel || "Google Pixel"}</span>
            </span>
            <span className="block text-[9px] text-slate-400 font-mono truncate max-w-[120px] mt-0.5">
              {user.boundDeviceId}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-semibold">
            {t("users.unbound", { lng: currentLang })}
          </span>
        )}
      </td>

      <td className="px-4 py-3.5">
        <div className="space-y-1">
          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              <Lock className="w-3 h-3" />
              <span>{t("users.lockedOut", { lng: currentLang })}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>{t("users.active", { lng: currentLang })}</span>
            </span>
          )}

          {user.mustChangePassword && (
            <span className="block text-[9px] font-bold text-amber-700">
              {t("users.pendingPasswordChange", { lng: currentLang })}
            </span>
          )}
        </div>
      </td>

      <td className="px-4 py-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {/* Generate a one-time temporary password */}
          <button
            onClick={() => onResetPassword(user.userId)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            title={t("users.generateTempPassword", { lng: currentLang })}
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          {/* Unlock Account if Locked */}
          {isLocked && (
            <button
              onClick={() => onUnlockUser(user.userId)}
              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
              title={t("users.unlockAccount", { lng: currentLang })}
            >
              <Unlock className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Release Bound Device */}
          {isDeviceBound && (
            <button
              onClick={() => onReleaseDevice(user.userId)}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200"
              title={t("users.unlinkDevice", { lng: currentLang })}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
