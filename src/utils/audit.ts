import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import { User, AuditLog } from "../types";

export const logAudit = (
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, any>,
  user?: User | null,
) => {
  const { currentUser, simulatedDeviceId } = useAuthStore.getState();
  const actor = user || currentUser;
  const newLog: AuditLog = {
    logId: "LOG-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    userId: actor?.userId || "SYSTEM",
    userRole: actor?.role || "ADMIN",
    userName: actor?.repNameAr || "نظام",
    action,
    entityType,
    entityId,
    detailsJson: JSON.stringify(details),
    createdAt: new Date().toISOString(),
    deviceBindingId: simulatedDeviceId,
  };
  useDataStore.getState().addAuditLogLocal(newLog);
};
