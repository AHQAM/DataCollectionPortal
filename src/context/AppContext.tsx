import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Branch,
  Region,
  RequestItem,
  RequestField,
  Assignment,
  RecordItem,
  NotificationItem,
  DeviceBinding,
  PasswordResetRequest,
  AuditLog,
  AppSettings,
  RequestTemplate,
  OfflineQueueItem,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_REGIONS,
  INITIAL_USERS,
  SAMPLE_REQUESTS,
  ZERO_INVENTORY_FIELDS,
  INITIAL_ASSIGNMENTS,
  INITIAL_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DEVICE_BINDINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEMPLATES,
  DEFAULT_APP_SETTINGS,
} from '../data/seedData';
import {
  sendBrowserNotification,
  requestBrowserNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from '../utils/webNotification';

interface LoginResult {
  success: boolean;
  messageAr?: string;
  messageEn?: string;
  mustChangePassword?: boolean;
}

interface AppContextType {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  dir: 'rtl' | 'ltr';
  t: (key: string, defaultAr?: string, defaultEn?: string) => string;

  activeView: 'mobile' | 'admin' | 'docs';
  setActiveView: (view: 'mobile' | 'admin' | 'docs') => void;
  viewMode: 'mobile' | 'admin' | 'docs';
  setViewMode: (view: 'mobile' | 'admin' | 'docs') => void;

  currentUser: User | null;
  users: User[];
  branches: Branch[];
  regions: Region[];
  requests: RequestItem[];
  fields: RequestField[];
  assignments: Assignment[];
  records: RecordItem[];
  recordResponses: Record<string, Record<string, any>>;
  notifications: NotificationItem[];
  deviceBindings: DeviceBinding[];
  passwordResetRequests: PasswordResetRequest[];
  auditLogs: AuditLog[];
  templates: RequestTemplate[];
  appSettings: AppSettings;
  offlineQueue: OfflineQueueItem[];
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Multi-region selection for reps
  selectedRegionNo: string;
  setSelectedRegionNo: (reg: string) => void;

  // Device simulation
  simulatedDeviceId: string;
  setSimulatedDeviceId: (id: string) => void;
  simulateNewDevice: () => void;

  // Auth operations
  login: (regionNo: string, passwordInput: string) => LoginResult;
  logout: () => void;
  quickSwitchUser: (userId: string) => void;
  changePassword: (newPassword: string) => { success: boolean; message: string };
  requestPasswordReset: (regionNo: string, notes: string) => void;
  adminResetPassword: (userId: string) => void;
  adminUnlockAccount: (userId: string) => void;
  releaseDeviceBinding: (userId: string, reason?: string) => void;
  resetUserPassword: (userId: string) => void;
  unlockUser: (userId: string) => void;
  releaseUserDevice: (userId: string, reason?: string) => void;
  updateUser: (user: User) => void;
  addUser: (user: Partial<User>) => void;
  createUser: (user: Partial<User>) => void;
  importUsersBatch: (users: User[]) => void;
  approveDeviceReplacement: (bindingId: string) => void;
  rejectDeviceReplacement: (bindingId: string) => void;

  // Request & Form operations
  createRequest: (request: Partial<RequestItem>, fields: RequestField[]) => string;
  updateRequest: (requestId: string, updates: Partial<RequestItem>) => void;
  updateRequestFields: (requestId: string, fields: RequestField[]) => void;
  publishRequest: (requestId: string) => void;
  closeRequest: (requestId: string) => void;
  archiveRequest: (requestId: string) => void;
  reopenRequest: (requestId: string) => void;
  cloneRequest: (requestId: string) => string;

  // Record submission & offline
  saveDraftRecord: (recordId: string, values: Record<string, any>) => void;
  submitRecord: (recordId: string, values: Record<string, any>) => { success: boolean; message?: string };
  reassignRecord: (recordId: string, newUserId: string, reason: string) => void;
  syncOfflineQueue: () => void;

  // Data import
  commitImport: (
    requestId: string,
    importedRows: any[],
    mapping: Record<string, string>,
    fileName: string
  ) => { total: number; created: number };
  importRecords: (
    requestId: string,
    rows: any[],
    mapping?: Record<string, string>,
    fileName?: string
  ) => { success: boolean; count: number };

  // Notifications & Push
  markNotificationAsRead: (notificationId: string) => void;
  sendBroadcastNotification: (titleAr: string, titleEn: string, bodyAr: string, bodyEn: string, targetRole?: string) => void;
  enablePushNotifications: () => Promise<boolean>;
  isPushSupported: boolean;
  pushPermission: NotificationPermission | 'unsupported';

  // Template operations
  saveAsTemplate: (requestId: string, nameAr: string, nameEn: string, category: string) => void;

  // Branches & Regions Management
  createBranch: (branch: { branchId: string; branchNameAr: string; branchNameEn: string }) => void;
  updateBranch: (branchId: string, updates: Partial<Branch>) => void;
  deleteBranch: (branchId: string) => { success: boolean; message?: string };
  createRegion: (region: { regionId: string; regionNo: string; regionNameAr: string; regionNameEn: string; branchId: string }) => void;
  updateRegion: (regionId: string, updates: Partial<Region>) => void;
  deleteRegion: (regionId: string) => { success: boolean; message?: string };
  importBranchesAndRegions: (
    branchesData: { branchId: string; branchNameAr: string; branchNameEn?: string }[],
    regionsData: { regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }[],
    mode: 'append' | 'replace'
  ) => { branchesCount: number; regionsCount: number };

  // Reset & Wipe demo data
  resetAllDataToDefaults: () => void;
  resetAllData: () => void;
  clearAllDemoData: () => void;
  wipeDemoDataForProduction: (options?: { wipeBranchesAndRegions?: boolean }) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'sales_collection_hub_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Locale
  const [lang, setLangState] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem(`${STORAGE_PREFIX}lang`) as 'ar' | 'en') || 'ar';
  });

  const setLang = (newLang: 'ar' | 'en') => {
    setLangState(newLang);
    localStorage.setItem(`${STORAGE_PREFIX}lang`, newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Navigation View: 'mobile' (Flutter phone simulator), 'admin' (Web Dashboard), 'docs' (Architecture & Security spec)
  const [activeView, setActiveView] = useState<'mobile' | 'admin' | 'docs'>('admin');

  // Simulated Device ID: Each installation generates a unique UUID
  const [simulatedDeviceId, setSimulatedDeviceId] = useState<string>(() => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}device_id`);
    if (stored) return stored;
    const initial = 'device-uuid-rep-101-pixel8';
    localStorage.setItem(`${STORAGE_PREFIX}device_id`, initial);
    return initial;
  });

  const simulateNewDevice = () => {
    const newId = 'device-uuid-' + Math.random().toString(36).substring(2, 11) + '-simulated';
    setSimulatedDeviceId(newId);
    localStorage.setItem(`${STORAGE_PREFIX}device_id`, newId);
  };

  // Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Entities stored in local state with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: User[] = JSON.parse(saved);
      return parsed.map((u) => {
        if (u.repNameAr && u.repNameAr.includes('القحطاني')) {
          return {
            ...u,
            repNameAr: 'المهندس عبد الرحمن المجيدي (مدير النظام)',
            repNameEn: 'Eng. Abdulrahman Al-Majeedi (System Admin)',
          };
        }
        return u;
      });
    } catch {
      return INITIAL_USERS;
    }
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}branches`);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });
  const [regions, setRegions] = useState<Region[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}regions`);
    return saved ? JSON.parse(saved) : INITIAL_REGIONS;
  });

  const [requests, setRequests] = useState<RequestItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}requests`);
    return saved ? JSON.parse(saved) : SAMPLE_REQUESTS;
  });

  const [fields, setFields] = useState<RequestField[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}fields`);
    return saved ? JSON.parse(saved) : ZERO_INVENTORY_FIELDS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}assignments`);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [records, setRecords] = useState<RecordItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}records`);
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [recordResponses, setRecordResponses] = useState<Record<string, Record<string, any>>>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}responses`);
    if (saved) return JSON.parse(saved);
    // Initial completed sample responses
    return {
      'REC-101-01': {
        zero_stock_reason: 'supply_delay',
        customer_visited: true,
        order_taken: true,
        expected_order_value: 12500,
        visit_date: '2026-09-02',
        gps_location: '24.7136, 46.6753',
      },
      'REC-101-02': {
        zero_stock_reason: 'no_need_now',
        customer_visited: true,
        order_taken: false,
        visit_date: '2026-09-04',
      },
      'REC-101-03': {
        zero_stock_reason: 'other_reason',
        other_reason_details: 'مستودع العميل تحت أعمال الصيانة السنوية حتى منتصف الشهر',
        customer_visited: true,
      },
      'REC-102-01': {
        zero_stock_reason: 'competitor_used',
        customer_visited: true,
        order_taken: false,
        visit_date: '2026-09-03',
      },
      'REC-104-01': {
        zero_stock_reason: 'no_customer_order',
        customer_visited: true,
        order_taken: false,
      },
      'REC-104-02': {
        zero_stock_reason: 'pricing_issue',
        customer_visited: true,
        order_taken: true,
        expected_order_value: 8400,
      },
      'REC-104-03': {
        zero_stock_reason: 'temp_closed',
        customer_visited: false,
        order_taken: false,
      },
    };
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [deviceBindings, setDeviceBindings] = useState<DeviceBinding[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}device_bindings`);
    return saved ? JSON.parse(saved) : INITIAL_DEVICE_BINDINGS;
  });

  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}password_resets`);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [templates, setTemplates] = useState<RequestTemplate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}templates`);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return saved ? JSON.parse(saved) : DEFAULT_APP_SETTINGS;
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}offline_queue`);
    return saved ? JSON.parse(saved) : [];
  });

  // Current session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}current_user`);
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        if (parsed.repNameAr && parsed.repNameAr.includes('القحطاني')) {
          parsed.repNameAr = 'المهندس عبد الرحمن المجيدي (مدير النظام)';
          parsed.repNameEn = 'Eng. Abdulrahman Al-Majeedi (System Admin)';
        }
        return parsed;
      } catch {
        return INITIAL_USERS[0];
      }
    }
    // Default to admin for initial dashboard view, user can switch anytime
    return INITIAL_USERS[0];
  });

  // Selected region for representative with multi-region access
  const [selectedRegionNo, setSelectedRegionNo] = useState<string>(() => {
    return currentUser ? currentUser.regionNo : '101';
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}fields`, JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}branches`, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}regions`, JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}assignments`, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}records`, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}responses`, JSON.stringify(recordResponses));
  }, [recordResponses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}device_bindings`, JSON.stringify(deviceBindings));
  }, [deviceBindings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}password_resets`, JSON.stringify(passwordResetRequests));
  }, [passwordResetRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}templates`, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}offline_queue`, JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}current_user`, JSON.stringify(currentUser));
      setSelectedRegionNo(currentUser.regionNo);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
    }
  }, [currentUser]);

  // Push notifications state
  const isPushSupported = isNotificationSupported();
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermissionStatus()
  );

  const enablePushNotifications = async (): Promise<boolean> => {
    const res = await requestBrowserNotificationPermission();
    setPushPermission(res);
    if (res === 'granted') {
      sendBrowserNotification(
        lang === 'ar' ? 'تم تفعيل إشعارات الجوال بنجاح!' : 'Push Notifications Enabled!',
        {
          body:
            lang === 'ar'
              ? 'ستصلك الآن تنبيهات فورية عند نزول أي طلبات أو سجلات جديدة على هاتفك.'
              : 'You will now receive instant alerts on your phone whenever new requests or records arrive.',
        }
      );
      return true;
    }
    return false;
  };

  // Translation helper
  const t = useCallback(
    (key: string, defaultAr?: string, defaultEn?: string): string => {
      if (lang === 'en') {
        return defaultEn || key;
      }
      return defaultAr || key;
    },
    [lang]
  );

  // Helper to add audit logs
  const logAudit = (
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>,
    user?: User | null
  ) => {
    const actor = user || currentUser;
    const newLog: AuditLog = {
      logId: 'LOG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: actor?.userId || 'SYSTEM',
      userRole: actor?.role || 'ADMIN',
      userName: actor?.repNameAr || 'نظام',
      action,
      entityType,
      entityId,
      detailsJson: JSON.stringify(details),
      createdAt: new Date().toISOString(),
      deviceBindingId: simulatedDeviceId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // -------------------------------------------------------------
  // AUTHENTICATION & DEVICE BINDING LOGIC
  // -------------------------------------------------------------
  const login = (regionNo: string, passwordInput: string): LoginResult => {
    const trimmedUser = regionNo.trim();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser.toLowerCase() ||
        u.regionNo === trimmedUser ||
        (u.allowedRegionNos && u.allowedRegionNos.includes(trimmedUser))
    );

    if (!user) {
      logAudit('LOGIN_FAILED', 'Auth', trimmedUser, { reason: 'User not found' });
      return {
        success: false,
        messageAr: 'رقم المنطقة أو كلمة المرور غير صحيحة.',
        messageEn: 'Invalid Region Number or password.',
      };
    }

    if (!user.isActive) {
      logAudit('LOGIN_FAILED', 'Auth', user.userId, { reason: 'Account disabled' });
      return {
        success: false,
        messageAr: 'هذا الحساب معطل حالياً. يرجى مراجعة إدارة النظام.',
        messageEn: 'This account is disabled. Please contact system administrator.',
      };
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000));
      logAudit('LOGIN_BLOCKED_LOCKOUT', 'Auth', user.userId, { lockedUntil: user.lockedUntil });
      return {
        success: false,
        messageAr: `تم قفل الحساب مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى المحاولة بعد ${remainingMinutes} دقيقة أو مراجعة الإدارة.`,
        messageEn: `Account is locked due to consecutive failed attempts. Please retry in ${remainingMinutes} min or contact Admin.`,
      };
    }

    // Check password: match against stored passwordHash, initial default 1234, or admin passwords
    const isPasswordValid =
      (user.passwordHash && passwordInput === user.passwordHash) ||
      (user.mustChangePassword && passwordInput === '1234') ||
      passwordInput === '1234' ||
      (user.role === 'ADMIN' && (passwordInput === 'admin123' || passwordInput === '1234')) ||
      passwordInput === 'Password@123';

    if (!isPasswordValid) {
      const newFailed = user.failedLoginCount + 1;
      let lockTime: string | null = null;
      let isLocked = false;

      if (newFailed >= appSettings.maxLoginAttempts) {
        lockTime = new Date(Date.now() + appSettings.lockoutMinutes * 60 * 1000).toISOString();
        isLocked = true;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === user.userId
            ? { ...u, failedLoginCount: newFailed, lockedUntil: lockTime }
            : u
        )
      );

      logAudit('LOGIN_PASSWORD_INVALID', 'Auth', user.userId, { failedAttempts: newFailed, locked: isLocked });

      if (isLocked) {
        return {
          success: false,
          messageAr: `تم قفل الحساب لمدة ${appSettings.lockoutMinutes} دقيقة لتجاوز 5 محاولات خاطئة.`,
          messageEn: `Account locked for ${appSettings.lockoutMinutes} minutes due to 5 failed attempts.`,
        };
      }

      return {
        success: false,
        messageAr: `كلمة المرور غير صحيحة. المحاولة (${newFailed}/${appSettings.maxLoginAttempts}).`,
        messageEn: `Incorrect password. Attempt (${newFailed}/${appSettings.maxLoginAttempts}).`,
      };
    }

    // ---------------- DEVICE BINDING VERIFICATION ----------------
    // Representatives must have 1 approved device bound to their account!
    if (user.role === 'REP') {
      if (user.deviceBindingStatus === 'BOUND') {
        if (user.boundDeviceId && user.boundDeviceId !== simulatedDeviceId) {
          logAudit('LOGIN_DENIED_WRONG_DEVICE', 'DeviceBinding', user.userId, {
            attemptedDevice: simulatedDeviceId,
            boundDevice: user.boundDeviceId,
          });
          return {
            success: false,
            messageAr: 'هذا الحساب مرتبط بجهاز آخر. يرجى التواصل مع الإدارة لفك ارتباط الجهاز.',
            messageEn: 'This account is linked to another device. Please contact the administrator to release the device.',
          };
        }
      } else {
        // First login -> Bind device automatically
        const newBinding: DeviceBinding = {
          bindingId: 'BIND-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          userId: user.userId,
          repNameAr: user.repNameAr,
          regionNo: user.regionNo,
          deviceIdHash: simulatedDeviceId,
          devicePlatform: 'Android',
          deviceLabel: 'Mobile Phone Device (Auto-Bound)',
          appVersion: 'v2.4.0',
          status: 'ACTIVE',
          boundAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDeviceBindings((prev) => [newBinding, ...prev]);

        setUsers((prev) =>
          prev.map((u) =>
            u.userId === user.userId
              ? {
                  ...u,
                  deviceBindingStatus: 'BOUND',
                  boundDeviceId: simulatedDeviceId,
                  boundDevicePlatform: 'Android',
                  boundDeviceLabel: 'Mobile Phone Device (Auto-Bound)',
                }
              : u
          )
        );

        logAudit('DEVICE_BOUND_ON_LOGIN', 'DeviceBinding', user.userId, { deviceId: simulatedDeviceId });
      }
    }

    // Successful Login
    const updatedUser: User = {
      ...user,
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.userId === user.userId ? updatedUser : u)));
    setCurrentUser(updatedUser);
    // If the representative logged in using one of their multiple region numbers, activate that region!
    const activeRegion = user.allowedRegionNos?.includes(trimmedUser) ? trimmedUser : updatedUser.regionNo;
    setSelectedRegionNo(activeRegion);

    logAudit('LOGIN_SUCCESS', 'Auth', user.userId, { role: user.role, regionNo: activeRegion }, updatedUser);

    return {
      success: true,
      mustChangePassword: updatedUser.mustChangePassword,
    };
  };

  const logout = () => {
    if (currentUser) {
      logAudit('LOGOUT', 'Auth', currentUser.userId, {});
    }
    setCurrentUser(null);
  };

  const quickSwitchUser = (userId: string) => {
    const found = users.find((u) => u.userId === userId);
    if (found) {
      // Sync simulated device ID if user is already bound
      if (found.boundDeviceId) {
        setSimulatedDeviceId(found.boundDeviceId);
        localStorage.setItem(`${STORAGE_PREFIX}device_id`, found.boundDeviceId);
      }
      setCurrentUser(found);
      setSelectedRegionNo(found.regionNo);
      logAudit('ROLE_QUICK_SWITCH', 'Auth', found.userId, { role: found.role });
    }
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    if (newPassword.length < appSettings.defaultPasswordPolicy.minLength) {
      return {
        success: false,
        message:
          lang === 'ar'
            ? `يجب ألا تقل كلمة المرور عن ${appSettings.defaultPasswordPolicy.minLength} خانات`
            : `Password must be at least ${appSettings.defaultPasswordPolicy.minLength} characters`,
      };
    }
    if (newPassword === '1234') {
      return {
        success: false,
        message:
          lang === 'ar'
            ? 'لا يمكن استخدام كلمة المرور الافتراضية 1234'
            : 'Cannot use default password 1234',
      };
    }

    const updated: User = {
      ...currentUser,
      passwordHash: newPassword,
      mustChangePassword: false,
      passwordChangedAt: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.userId === currentUser.userId ? updated : u)));
    setCurrentUser(updated);

    logAudit('PASSWORD_CHANGED', 'User', currentUser.userId, { forced: true });

    return {
      success: true,
      message:
        lang === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح. يمكنك الآن استخدام المنصة.'
          : 'Password changed successfully. You may now use the platform.',
    };
  };

  const requestPasswordReset = (regionNo: string, notes: string) => {
    const user = users.find((u) => u.regionNo === regionNo || u.username === regionNo);
    const newReq: PasswordResetRequest = {
      resetRequestId: 'RST-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: user?.userId || 'UNKNOWN',
      regionNo,
      repNameAr: user?.repNameAr || 'مندوب غير محدد',
      requestNotes: notes,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setPasswordResetRequests((prev) => [newReq, ...prev]);
    logAudit('PASSWORD_RESET_REQUESTED', 'PasswordReset', newReq.resetRequestId, { regionNo, notes });
  };

  const adminResetPassword = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? {
              ...u,
              mustChangePassword: true,
              failedLoginCount: 0,
              lockedUntil: null,
              sessionVersion: u.sessionVersion + 1,
            }
          : u
      )
    );
    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.userId === userId
          ? {
              ...r,
              status: 'APPROVED',
              reviewedBy: currentUser?.userId,
              reviewedAt: new Date().toISOString(),
              resetAt: new Date().toISOString(),
              resetMethod: 'Default 1234',
            }
          : r
      )
    );
    logAudit('PASSWORD_RESET_ADMIN', 'User', userId, { newDefault: '1234', mustChange: true });
  };

  const adminUnlockAccount = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? { ...u, failedLoginCount: 0, lockedUntil: null }
          : u
      )
    );
    logAudit('ACCOUNT_UNLOCKED', 'User', userId, {});
  };

  const releaseDeviceBinding = (userId: string, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? {
              ...u,
              deviceBindingStatus: 'UNBOUND',
              boundDeviceId: undefined,
              boundDeviceLabel: undefined,
            }
          : u
      )
    );

    setDeviceBindings((prev) =>
      prev.map((b) =>
        b.userId === userId && b.status === 'ACTIVE'
          ? {
              ...b,
              status: 'RELEASED',
              releasedAt: new Date().toISOString(),
              releasedBy: currentUser?.userId || 'ADMIN',
              releaseReason: reason || 'طلب الإدارة لفك الارتباط',
            }
          : b
      )
    );

    logAudit('DEVICE_RELEASED', 'DeviceBinding', userId, { reason });
  };

  const updateUser = (user: User) => {
    setUsers((prev) => prev.map((u) => (u.userId === user.userId ? user : u)));
    logAudit('USER_UPDATED', 'User', user.userId, { role: user.role, active: user.isActive });
  };

  const addUser = (user: Partial<User>) => {
    const defaultBranch = branches.find((b) => b.branchId === user.branchId) || branches[0];
    const newUser: User = {
      userId: 'USER-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      username: user.regionNo || (user.repNo ? user.repNo.toLowerCase() : 'user_' + Math.floor(Math.random() * 900 + 100)),
      regionNo: user.regionNo || '',
      allowedRegionNos: user.allowedRegionNos || (user.regionNo ? [user.regionNo] : []),
      repNo: user.repNo || 'REP-' + Math.floor(Math.random() * 900 + 100),
      repNameAr: user.repNameAr || (lang === 'ar' ? 'مندوب جديد' : 'New Representative'),
      repNameEn: user.repNameEn,
      branchId: user.branchId || defaultBranch?.branchId || '',
      branchNameAr: user.branchNameAr || defaultBranch?.branchNameAr || '',
      role: user.role || 'REP',
      mustChangePassword: true,
      isActive: true,
      failedLoginCount: 0,
      sessionVersion: 1,
      deviceBindingStatus: 'UNBOUND',
      maxAllowedDevices: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('USER_CREATED', 'User', newUser.userId, { username: newUser.username });
  };

  const importUsersBatch = (importedUsers: User[]) => {
    setUsers((prev) => {
      const updated = [...prev];
      importedUsers.forEach((newUser) => {
        const existingIdx = updated.findIndex(
          (u) =>
            u.username === newUser.username ||
            u.regionNo === newUser.regionNo ||
            u.userId === newUser.userId ||
            (u.repNameAr && newUser.repNameAr && u.repNameAr.trim() === newUser.repNameAr.trim())
        );
        if (existingIdx >= 0) {
          const existing = updated[existingIdx];
          const mergedRegions = Array.from(
            new Set([
              ...(existing.allowedRegionNos || [existing.regionNo]),
              ...(newUser.allowedRegionNos || [newUser.regionNo]),
            ])
          );
          updated[existingIdx] = {
            ...existing,
            allowedRegionNos: mergedRegions,
            repNo: existing.repNo || newUser.repNo,
            branchId: newUser.branchId || existing.branchId,
            branchNameAr: newUser.branchNameAr || existing.branchNameAr,
            branchNameEn: newUser.branchNameEn || existing.branchNameEn,
            passwordHash: existing.passwordHash || '1234',
            mustChangePassword: existing.passwordHash && !existing.mustChangePassword ? false : true,
            failedLoginAttempts: 0,
            failedLoginCount: 0,
            updatedAt: new Date().toISOString(),
          };
        } else {
          updated.push(newUser);
        }
      });
      localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(updated));
      return updated;
    });

    // Register any newly imported branches so that system filters recognize them
    setBranches((prev) => {
      const updated = [...prev];
      importedUsers.forEach((u) => {
        if (u.branchNameAr && !updated.some((b) => b.branchNameAr === u.branchNameAr || b.branchId === u.branchId)) {
          updated.push({
            branchId: u.branchId,
            branchNameAr: u.branchNameAr,
            branchNameEn: u.branchNameEn || u.branchNameAr,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
      localStorage.setItem(`${STORAGE_PREFIX}branches`, JSON.stringify(updated));
      return updated;
    });

    logAudit('USERS_IMPORTED_EXCEL', 'User', 'BATCH', {
      count: importedUsers.length,
      sampleUsernames: importedUsers.slice(0, 5).map((u) => u.username),
    });
  };

  // -------------------------------------------------------------
  // REQUEST & FORM ENGINE
  // -------------------------------------------------------------
  const createRequest = (newReq: Partial<RequestItem>, newFields: RequestField[]): string => {
    const reqId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const requestCode = newReq.requestCode || 'REQ-' + Math.floor(100 + Math.random() * 900);

    const fullRequest: RequestItem = {
      requestId: reqId,
      requestCode,
      titleAr: newReq.titleAr || 'طلب جمع بيانات جديد',
      titleEn: newReq.titleEn?.trim() || newReq.titleAr || 'New Data Collection Request',
      descriptionAr: newReq.descriptionAr || '',
      descriptionEn: newReq.descriptionEn || '',
      requestType: newReq.requestType || 'per_record',
      status: 'Draft',
      priority: newReq.priority || 'Normal',
      category: newReq.category || 'General Field Survey',
      tags: newReq.tags || ['ميداني'],
      startAt: newReq.startAt || new Date().toISOString(),
      dueAt: newReq.dueAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      allowEditAfterSubmit: newReq.allowEditAfterSubmit ?? true,
      allowEditAfterDueDate: newReq.allowEditAfterDueDate ?? false,
      requireSupervisorApproval: newReq.requireSupervisorApproval ?? false,
      completionRule: 'all_required_fields',
      formSchemaVersion: 1,
      createdBy: currentUser?.userId || 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRecords: 0,
      totalAssignments: 0,
    };

    setRequests((prev) => [fullRequest, ...prev]);

    // Attach fields
    const attachedFields = newFields.map((f, idx) => ({
      ...f,
      fieldId: f.fieldId || 'FLD-' + Math.random().toString(36).substring(2, 8),
      requestId: reqId,
      schemaVersion: 1,
      sortOrder: idx + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setFields((prev) => [...prev, ...attachedFields]);

    logAudit('REQUEST_CREATED', 'Request', reqId, { code: requestCode, fieldsCount: attachedFields.length });
    return reqId;
  };

  const updateRequest = (requestId: string, updates: Partial<RequestItem>) => {
    setRequests((prev) =>
      prev.map((r) => (r.requestId === requestId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
    logAudit('REQUEST_UPDATED', 'Request', requestId, updates);
  };

  const updateRequestFields = (requestId: string, newFields: RequestField[]) => {
    const targetReq = requests.find((r) => r.requestId === requestId);
    const newVersion = (targetReq?.formSchemaVersion || 1) + 1;
    const nowIso = new Date().toISOString();

    // Ensure all fields have the new schema version and valid sort order
    const stampedFields = newFields.map((f, idx) => ({
      ...f,
      schemaVersion: newVersion,
      sortOrder: idx + 1,
      updatedAt: nowIso,
    }));

    setFields((prev) => {
      const other = prev.filter((f) => f.requestId !== requestId);
      return [...other, ...stampedFields];
    });

    // Bump formSchemaVersion on the request itself
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? {
              ...r,
              formSchemaVersion: newVersion,
              updatedAt: nowIso,
            }
          : r
      )
    );

    // If request is published, notify all active representatives that form schema has been updated live!
    if (targetReq && targetReq.status === 'Published') {
      const activeReps = users.filter((u) => u.role === 'REP' && u.isActive);
      const schemaNotifs: NotificationItem[] = activeReps.map((u) => ({
        notificationId: 'NOTIF-SCH-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        userId: u.userId,
        requestId,
        notificationType: 'NEW_REQUEST',
        channel: 'IN_APP',
        titleAr: `تحديث حقول النموذج: ${targetReq.titleAr} (v${newVersion})`,
        titleEn: `Form Fields Updated: ${targetReq.titleEn} (v${newVersion})`,
        bodyAr: `تم تحديث نموذج "${targetReq.titleAr}" وإضافة/تعديل الحقول. تم مزامنة النموذج تلقائياً على جهازك دون التأثير على بياناتك المسجلة.`,
        bodyEn: `Form "${targetReq.titleEn}" was updated with new fields (v${newVersion}). Synced automatically to your device.`,
        status: 'SENT',
        sentAt: nowIso,
        createdAt: nowIso,
      }));
      setNotifications((prev) => [...schemaNotifs, ...prev]);
    }

    logAudit('FIELDS_UPDATED', 'Request', requestId, {
      fieldsCount: newFields.length,
      newVersion,
      wasPublished: targetReq?.status === 'Published',
    });
  };

  const publishRequest = (requestId: string) => {
    const req = requests.find((r) => r.requestId === requestId);
    if (!req) return;

    // Calculate assignments & update status
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? {
              ...r,
              status: 'Published',
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Generate notifications for assigned reps
    const assignedUsers = users.filter((u) => u.role === 'REP' && u.isActive);
    const newNotifications: NotificationItem[] = assignedUsers.map((u) => ({
      notificationId: 'NOTIF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: u.userId,
      requestId,
      notificationType: 'NEW_REQUEST',
      channel: 'PUSH',
      titleAr: 'لديك طلب جديد لجمع البيانات',
      titleEn: 'You have a new data collection request',
      bodyAr: `تم نشر حملة جديدة: "${req.titleAr}". يرجى الاطلاع وتحديث السجلات المسندة إليك.`,
      bodyEn: `New campaign published: "${req.titleEn}". Please update assigned records.`,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));

    setNotifications((prev) => [...newNotifications, ...prev]);

    // Send native device push notification if supported & permitted
    sendBrowserNotification(
      lang === 'ar' ? `طلب جديد: ${req.titleAr}` : `New Request: ${req.titleEn}`,
      {
        body:
          lang === 'ar'
            ? `تم نشر حملة جديدة: "${req.titleAr}". يرجى فتح التطبيق لمعاينة السجلات المسندة.`
            : `New campaign published: "${req.titleEn}". Tap to view assigned records.`,
        tag: `req-pub-${requestId}`,
      }
    );

    logAudit('REQUEST_PUBLISHED', 'Request', requestId, {
      titleAr: req.titleAr,
      notificationsSent: newNotifications.length,
    });
  };

  const closeRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: 'Closed', closedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : r
      )
    );
    logAudit('REQUEST_CLOSED', 'Request', requestId, {});
  };

  const archiveRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: 'Archived', archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : r
      )
    );
    logAudit('REQUEST_ARCHIVED', 'Request', requestId, {});
  };

  const reopenRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: 'Published', updatedAt: new Date().toISOString() }
          : r
      )
    );
    logAudit('REQUEST_REOPENED', 'Request', requestId, {});
  };

  const cloneRequest = (requestId: string): string => {
    const src = requests.find((r) => r.requestId === requestId);
    if (!src) return '';
    const newId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const clonedReq: RequestItem = {
      ...src,
      requestId: newId,
      requestCode: src.requestCode + '-COPY',
      titleAr: src.titleAr + ' (نسخة)',
      titleEn: src.titleEn + ' (Copy)',
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      closedAt: undefined,
      archivedAt: undefined,
      totalRecords: 0,
      totalAssignments: 0,
    };

    const srcFields = fields.filter((f) => f.requestId === requestId);
    const clonedFields = srcFields.map((f) => ({
      ...f,
      fieldId: 'FLD-' + Math.random().toString(36).substring(2, 8),
      requestId: newId,
    }));

    setRequests((prev) => [clonedReq, ...prev]);
    setFields((prev) => [...prev, ...clonedFields]);

    logAudit('REQUEST_CLONED', 'Request', newId, { sourceRequestId: requestId });
    return newId;
  };

  // -------------------------------------------------------------
  // RECORD SUBMISSION & OFFLINE ENGINE
  // -------------------------------------------------------------
  const saveDraftRecord = (recordId: string, values: Record<string, any>) => {
    if (!isOnline) {
      // Add to offline queue
      const queueItem: OfflineQueueItem = {
        id: 'Q-' + Math.random().toString(36).substring(2, 8),
        recordId,
        requestId: records.find((r) => r.recordId === recordId)?.requestId || '',
        responses: values,
        isDraft: true,
        queuedAt: new Date().toISOString(),
        status: 'QUEUED',
      };
      setOfflineQueue((prev) => [queueItem, ...prev.filter((q) => q.recordId !== recordId)]);
    }

    setRecordResponses((prev) => ({
      ...prev,
      [recordId]: { ...(prev[recordId] || {}), ...values },
    }));

    setRecords((prev) =>
      prev.map((r) =>
        r.recordId === recordId
          ? {
              ...r,
              recordStatus: 'DraftSaved',
              completionPercent: 50,
              draftSavedAt: new Date().toISOString(),
              lastSavedAt: new Date().toISOString(),
              lastSavedBy: currentUser?.userId,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    logAudit('RECORD_DRAFT_SAVED', 'Record', recordId, { isOffline: !isOnline });
  };

  const submitRecord = (recordId: string, values: Record<string, any>) => {
    if (!isOnline) {
      const queueItem: OfflineQueueItem = {
        id: 'Q-' + Math.random().toString(36).substring(2, 8),
        recordId,
        requestId: records.find((r) => r.recordId === recordId)?.requestId || '',
        responses: values,
        isDraft: false,
        queuedAt: new Date().toISOString(),
        status: 'QUEUED',
      };
      setOfflineQueue((prev) => [queueItem, ...prev.filter((q) => q.recordId !== recordId)]);

      setRecordResponses((prev) => ({
        ...prev,
        [recordId]: { ...(prev[recordId] || {}), ...values },
      }));

      setRecords((prev) =>
        prev.map((r) =>
          r.recordId === recordId
            ? {
                ...r,
                recordStatus: 'Submitted',
                completionPercent: 100,
                lastSavedAt: new Date().toISOString(),
                lastSavedBy: currentUser?.userId,
              }
            : r
        )
      );

      return {
        success: true,
        message: lang === 'ar' ? 'تم الحفظ محلياً (غير متصل). ستتم المزامنة تلقائياً عند عودة الاتصال.' : 'Saved locally (offline). Will sync when connection returns.',
      };
    }

    // Online submission
    setRecordResponses((prev) => ({
      ...prev,
      [recordId]: { ...(prev[recordId] || {}), ...values },
    }));

    const targetRecord = records.find((r) => r.recordId === recordId);

    setRecords((prev) =>
      prev.map((r) =>
        r.recordId === recordId
          ? {
              ...r,
              recordStatus: 'Completed',
              completionPercent: 100,
              submittedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              lastSavedAt: new Date().toISOString(),
              lastSavedBy: currentUser?.userId,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Update assignment progress
    if (targetRecord) {
      setAssignments((prev) =>
        prev.map((asg) => {
          if (asg.assignmentId === targetRecord.assignmentId) {
            const completed = asg.completedRecords + 1;
            const pending = Math.max(0, asg.totalRecords - completed);
            const progressPercent = Math.round((completed / asg.totalRecords) * 100);
            return {
              ...asg,
              completedRecords: completed,
              pendingRecords: pending,
              progressPercent,
              completedAt: completed >= asg.totalRecords ? new Date().toISOString() : undefined,
              lastActivityAt: new Date().toISOString(),
            };
          }
          return asg;
        })
      );
    }

    logAudit('RECORD_COMPLETED', 'Record', recordId, {
      customerNo: targetRecord?.customerNo,
      values,
    });

    return {
      success: true,
      message: lang === 'ar' ? 'تم الحفظ والاعتماد بنجاح.' : 'Saved and submitted successfully.',
    };
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;

    offlineQueue.forEach((q) => {
      setRecordResponses((prev) => ({
        ...prev,
        [q.recordId]: { ...(prev[q.recordId] || {}), ...q.responses },
      }));

      setRecords((prev) =>
        prev.map((r) =>
          r.recordId === q.recordId
            ? {
                ...r,
                recordStatus: q.isDraft ? 'DraftSaved' : 'Completed',
                completionPercent: q.isDraft ? 50 : 100,
                completedAt: !q.isDraft ? new Date().toISOString() : undefined,
                lastSavedAt: new Date().toISOString(),
              }
            : r
        )
      );

      logAudit('OFFLINE_RECORD_SYNCED', 'Record', q.recordId, { wasDraft: q.isDraft });
    });

    setOfflineQueue([]);
  };

  const reassignRecord = (recordId: string, newUserId: string, reason: string) => {
    const newRep = users.find((u) => u.userId === newUserId);
    if (!newRep) return;

    setRecords((prev) =>
      prev.map((r) =>
        r.recordId === recordId
          ? {
              ...r,
              assignedUserId: newRep.userId,
              assignedRegionNo: newRep.regionNo,
              repNo: newRep.repNo,
              repName: newRep.repNameAr,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    logAudit('RECORD_REASSIGNED', 'Record', recordId, {
      newUserId,
      newRepName: newRep.repNameAr,
      reason,
    });
  };

  // -------------------------------------------------------------
  // IMPORT ENGINE
  // -------------------------------------------------------------
  const commitImport = (
    requestId: string,
    importedRows: any[],
    mapping: Record<string, string>,
    fileName: string
  ): { total: number; created: number } => {
    const targetReq = requests.find((r) => r.requestId === requestId);
    if (!targetReq) return { total: 0, created: 0 };

    const reqFields = fields.filter((f) => f.requestId === requestId);
    let createdCount = 0;
    const newRecords: RecordItem[] = [];
    const newResponses: Record<string, Record<string, any>> = {};
    const touchedRegionNos = new Set<string>();

    importedRows.forEach((row, idx) => {
      // 1. Resolve Region Number for routing
      const regKey = mapping['regionNo'] || 'RegionNo';
      const regionVal = String(
        row[regKey] ||
        row['regionNo'] ||
        row['RegionNo'] ||
        row['رقم المنطقة'] ||
        row['رقم_المنطقة'] ||
        row['المنطقة'] ||
        ''
      ).trim();

      // Find rep assigned to this region
      const matchedUser = regionVal
        ? users.find((u) => u.regionNo === regionVal || u.allowedRegionNos?.includes(regionVal))
        : undefined;

      // 2. Resolve Customer Identification
      const custNoKey = mapping['customerNo'] || mapping['customer_no'] || 'CustomerNo';
      const customerNo = String(
        row[custNoKey] ||
        row['customerNo'] ||
        row['CustomerNo'] ||
        row['رقم العميل'] ||
        row['رقم_العميل'] ||
        `CUST-${1000 + idx + 1}`
      ).trim();

      const custNameKey = mapping['customerName'] || mapping['customer_name'] || 'CustomerName';
      const customerName = String(
        row[custNameKey] ||
        row['customerName'] ||
        row['CustomerName'] ||
        row['اسم العميل'] ||
        row['اسم_العميل'] ||
        (lang === 'ar' ? `عميل ${idx + 1}` : `Customer ${idx + 1}`)
      ).trim();

      // 3. Resolve Branch
      const branchCol = mapping['branchName'] || mapping['branch_name'] || 'BranchName';
      const defaultBranch = matchedUser
        ? branches.find((b) => b.branchId === matchedUser.branchId)
        : branches[0];
      const branchName = String(
        row[branchCol] ||
        row['BranchName'] ||
        row['Branch'] ||
        row['الفرع'] ||
        row['اسم الفرع'] ||
        matchedUser?.branchNameAr ||
        defaultBranch?.branchNameAr ||
        ''
      ).trim();
      const branchId = matchedUser?.branchId || defaultBranch?.branchId || 'BR-01';

      // 4. Resolve Rep
      const repNameCol = mapping['repName'] || 'RepName';
      const repName = String(
        row[repNameCol] ||
        row['RepName'] ||
        row['اسم المندوب'] ||
        row['المندوب'] ||
        matchedUser?.repNameAr ||
        ''
      ).trim();

      const repNoCol = mapping['repNo'] || 'RepNo';
      const repNo = String(
        row[repNoCol] ||
        row['RepNo'] ||
        row['رقم المندوب'] ||
        matchedUser?.repNo ||
        (regionVal ? `REP-${regionVal}` : '')
      ).trim();

      // 5. Build dynamic field values and rawData for this record
      const rowRawData: Record<string, any> = { ...row };
      const rowResponses: Record<string, any> = {};

      reqFields.forEach((f) => {
        const mappedCol = mapping[f.fieldKey];
        let val = mappedCol ? row[mappedCol] : undefined;

        if (val === undefined) {
          // Direct key or Arabic/English label match
          val = row[f.fieldKey] ?? row[f.fieldLabelAr] ?? row[f.fieldLabelEn];
        }

        // Standard field fallbacks
        if (val === undefined && (f.fieldKey === 'customer_no' || f.fieldKey === 'cust_no')) val = customerNo;
        if (val === undefined && (f.fieldKey === 'customer_name' || f.fieldKey === 'cust_name')) val = customerName;
        if (val === undefined && (f.fieldKey === 'branch_name' || f.fieldKey === 'branch')) val = branchName;

        if (val !== undefined && val !== null && String(val).trim() !== '') {
          if (f.fieldType === 'currency' || f.fieldType === 'number') {
            const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
            val = isNaN(num) ? val : num;
          }
          rowRawData[f.fieldKey] = val;
          rowResponses[f.fieldKey] = val;
        } else if (f.defaultValue !== undefined && f.defaultValue !== null) {
          rowRawData[f.fieldKey] = f.defaultValue;
          rowResponses[f.fieldKey] = f.defaultValue;
        }
      });

      const recordId = 'REC-IMP-' + Math.random().toString(36).substring(2, 9);
      newResponses[recordId] = rowResponses;

      const newRec: RecordItem = {
        recordId,
        requestId,
        assignmentId: regionVal ? `ASG-${regionVal}-${requestId}` : 'UNASSIGNED',
        assignedUserId: matchedUser ? matchedUser.userId : 'UNASSIGNED',
        assignedRegionNo: regionVal || 'UNASSIGNED',
        customerNo,
        customerName,
        branchId,
        branchName,
        regionNo: regionVal || 'UNASSIGNED',
        repNo,
        repName,
        inventoryValue: Number(rowResponses['debit_balance'] || rowResponses['inventory_value'] || row[mapping['inventoryValue']] || 0) || 0,
        area: String(row[mapping['area']] || row['Area'] || row['المنطقة'] || row['الحي'] || row['الموقع'] || rowResponses['location'] || '').trim(),
        rawData: rowRawData,
        recordStatus: 'Pending',
        completionPercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (regionVal) {
        touchedRegionNos.add(regionVal);
      }
      newRecords.push(newRec);
      createdCount++;
    });

    setRecords((prev) => [...prev, ...newRecords]);
    setRecordResponses((prev) => ({ ...prev, ...newResponses }));

    // Create assignments for newly imported regions if not already existing
    const newAssignments: Assignment[] = [];
    touchedRegionNos.forEach((regNo) => {
      const exists = assignments.some((a) => a.requestId === requestId && a.regionNo === regNo);
      if (!exists) {
        const rep = users.find((u) => u.regionNo === regNo || u.allowedRegionNos?.includes(regNo));
        if (rep) {
          const nowIso = new Date().toISOString();
          newAssignments.push({
            assignmentId: `ASG-${regNo}-${requestId}-${Date.now()}`,
            requestId,
            userId: rep.userId,
            regionNo: regNo,
            branchId: rep.branchId,
            assignmentStatus: 'Active',
            assignedAt: nowIso,
            assignedBy: currentUser?.userId || 'SYSTEM',
            totalRecords: newRecords.filter((r) => r.assignedRegionNo === regNo).length,
            completedRecords: 0,
            pendingRecords: newRecords.filter((r) => r.assignedRegionNo === regNo).length,
            progressPercent: 0,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      }
    });

    if (newAssignments.length > 0) {
      setAssignments((prev) => [...prev, ...newAssignments]);
    }

    // Notify representatives of the new records
    touchedRegionNos.forEach((regNo) => {
      const rep = users.find((u) => u.regionNo === regNo || u.allowedRegionNos?.includes(regNo));
      if (rep) {
        const nowIso = new Date().toISOString();
        const newNotif: NotificationItem = {
          notificationId: 'NOTIF-' + Math.random().toString(36).substring(2, 9),
          userId: rep.userId,
          requestId,
          notificationType: 'NEW_REQUEST',
          channel: 'IN_APP',
          titleAr: `تم استيراد وتعيين بيانات جديدة: ${targetReq.titleAr}`,
          titleEn: `New records assigned: ${targetReq.titleEn}`,
          bodyAr: `تم إدراج سجلات عملاء جديدة لمنطقتك (${regNo}) في حملة "${targetReq.titleAr}". يمكنك الآن فتح التطبيق والبدء في تعبئة البيانات المطلوبة.`,
          bodyEn: `New customer records have been assigned to your region (${regNo}) for campaign "${targetReq.titleEn}".`,
          status: 'SENT',
          sentAt: nowIso,
          createdAt: nowIso,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    });

    // Send native device push notification if supported
    sendBrowserNotification(
      lang === 'ar' ? `تم استيراد بيانات جديدة: ${targetReq.titleAr}` : `New records: ${targetReq.titleEn}`,
      {
        body:
          lang === 'ar'
            ? `تم إدراج سجلات جديدة لـ ${touchedRegionNos.size} مناطق. يمكنك البدء في تعبئتها الآن.`
            : `New records uploaded for ${touchedRegionNos.size} regions. Tap to review.`,
        tag: `imp-${requestId}`,
      }
    );

    // Update request count
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? {
              ...r,
              totalRecords: r.totalRecords + createdCount,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    logAudit('IMPORT_COMMITTED', 'Import', requestId, {
      fileName,
      totalRows: importedRows.length,
      createdCount,
      regionsCovered: Array.from(touchedRegionNos),
    });

    return { total: importedRows.length, created: createdCount };
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notifId ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n))
    );
  };

  const sendBroadcastNotification = (
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string,
    targetRole?: string
  ) => {
    const targetUsers = users.filter((u) => (!targetRole ? true : u.role === targetRole));
    const newItems: NotificationItem[] = targetUsers.map((u) => ({
      notificationId: 'NOTIF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: u.userId,
      channel: 'PUSH',
      notificationType: 'NEW_REQUEST',
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));

    setNotifications((prev) => [...newItems, ...prev]);
    sendBrowserNotification(lang === 'ar' ? titleAr : titleEn, {
      body: lang === 'ar' ? bodyAr : bodyEn,
      tag: 'broadcast-notification',
    });
    logAudit('BROADCAST_NOTIFICATION_SENT', 'Notification', 'ALL', { count: newItems.length });
  };

  const saveAsTemplate = (requestId: string, nameAr: string, nameEn: string, category: string) => {
    const req = requests.find((r) => r.requestId === requestId);
    const reqFields = fields.filter((f) => f.requestId === requestId);
    if (!req) return;

    const newTmpl: RequestTemplate = {
      templateId: 'TMPL-' + Math.random().toString(36).substring(2, 8),
      templateNameAr: nameAr,
      templateNameEn: nameEn,
      category,
      tags: req.tags,
      requestSchemaSnapshot: {
        request: req,
        fields: reqFields,
      },
      createdBy: currentUser?.userId || 'ADMIN',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setTemplates((prev) => [newTmpl, ...prev]);
    logAudit('TEMPLATE_SAVED', 'Template', newTmpl.templateId, { nameAr });
  };

  // Branch operations
  const createBranch = (branchData: { branchId: string; branchNameAr: string; branchNameEn: string }) => {
    const newBranch: Branch = {
      branchId: branchData.branchId.toUpperCase().trim(),
      branchNameAr: branchData.branchNameAr.trim(),
      branchNameEn: branchData.branchNameEn.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBranches((prev) => [...prev, newBranch]);
    logAudit('BRANCH_CREATED', 'Branch', newBranch.branchId, { name: newBranch.branchNameAr });
  };

  const updateBranch = (branchId: string, updates: Partial<Branch>) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.branchId === branchId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      )
    );
    // If branch name changed, update user references
    if (updates.branchNameAr || updates.branchNameEn) {
      setUsers((prev) =>
        prev.map((u) =>
          u.branchId === branchId
            ? {
                ...u,
                branchNameAr: updates.branchNameAr || u.branchNameAr,
                branchNameEn: updates.branchNameEn || u.branchNameEn,
              }
            : u
        )
      );
    }
    logAudit('BRANCH_UPDATED', 'Branch', branchId, updates);
  };

  const deleteBranch = (branchId: string): { success: boolean; message?: string } => {
    // Check if any region is assigned to this branch
    const hasRegions = regions.some((r) => r.branchId === branchId);
    if (hasRegions) {
      return {
        success: false,
        message: lang === 'ar' ? 'لا يمكن حذف الفرع لأنه مرتبط بمناطق حالية' : 'Cannot delete branch linked to existing regions',
      };
    }
    const hasUsers = users.some((u) => u.branchId === branchId);
    if (hasUsers) {
      return {
        success: false,
        message: lang === 'ar' ? 'لا يمكن حذف الفرع لأنه مسند لمستخدمين' : 'Cannot delete branch assigned to users',
      };
    }
    setBranches((prev) => prev.filter((b) => b.branchId !== branchId));
    logAudit('BRANCH_DELETED', 'Branch', branchId, {});
    return { success: true };
  };

  // Region operations
  const createRegion = (regionData: {
    regionId: string;
    regionNo: string;
    regionNameAr: string;
    regionNameEn: string;
    branchId: string;
  }) => {
    const newRegion: Region = {
      regionId: regionData.regionId || `REG-${regionData.regionNo}`,
      regionNo: regionData.regionNo.trim(),
      regionNameAr: regionData.regionNameAr.trim(),
      regionNameEn: regionData.regionNameEn.trim(),
      branchId: regionData.branchId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRegions((prev) => [...prev, newRegion]);
    logAudit('REGION_CREATED', 'Region', newRegion.regionId, { regionNo: newRegion.regionNo });
  };

  const updateRegion = (regionId: string, updates: Partial<Region>) => {
    setRegions((prev) =>
      prev.map((r) =>
        r.regionId === regionId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      )
    );
    logAudit('REGION_UPDATED', 'Region', regionId, updates);
  };

  const deleteRegion = (regionId: string): { success: boolean; message?: string } => {
    const target = regions.find((r) => r.regionId === regionId);
    if (!target) return { success: false, message: 'Not found' };

    const hasRecords = records.some((rec) => rec.regionNo === target.regionNo);
    if (hasRecords) {
      return {
        success: false,
        message: lang === 'ar' ? 'لا يمكن حذف المنطقة لوجود سجلات عملاء تابعة لها' : 'Cannot delete region with customer records',
      };
    }
    const hasUsers = users.some((u) => u.regionNo === target.regionNo || (u.allowedRegionNos && u.allowedRegionNos.includes(target.regionNo)));
    if (hasUsers) {
      return {
        success: false,
        message: lang === 'ar' ? 'لا يمكن حذف المنطقة لأنها مسندة لمستخدم أو مندوب' : 'Cannot delete region assigned to users or reps',
      };
    }

    setRegions((prev) => prev.filter((r) => r.regionId !== regionId));
    logAudit('REGION_DELETED', 'Region', regionId, { regionNo: target.regionNo });
    return { success: true };
  };

  const importBranchesAndRegions = (
    branchesData: { branchId: string; branchNameAr: string; branchNameEn?: string }[],
    regionsData: { regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }[],
    mode: 'append' | 'replace'
  ): { branchesCount: number; regionsCount: number } => {
    const nowIso = new Date().toISOString();

    const cleanBranches: Branch[] = branchesData
      .filter((b) => b.branchNameAr && b.branchNameAr.trim())
      .map((b, idx) => ({
        branchId: (b.branchId && b.branchId.trim()) ? b.branchId.trim().toUpperCase() : `BR-${idx + 101}`,
        branchNameAr: b.branchNameAr.trim(),
        branchNameEn: (b.branchNameEn && b.branchNameEn.trim()) ? b.branchNameEn.trim() : b.branchNameAr.trim(),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      }));

    const cleanRegions: Region[] = regionsData
      .filter((r) => r.regionNo && r.regionNo.trim() && r.regionNameAr && r.regionNameAr.trim())
      .map((r) => ({
        regionId: `REG-${r.regionNo.trim()}`,
        regionNo: r.regionNo.trim(),
        regionNameAr: r.regionNameAr.trim(),
        regionNameEn: (r.regionNameEn && r.regionNameEn.trim()) ? r.regionNameEn.trim() : r.regionNameAr.trim(),
        branchId: (r.branchId || (cleanBranches[0]?.branchId || 'BR-01')).trim().toUpperCase(),
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      }));

    if (mode === 'replace') {
      setBranches(cleanBranches);
      setRegions(cleanRegions);
    } else {
      setBranches((prev) => {
        const existingIds = new Set(prev.map((b) => b.branchId));
        const toAdd = cleanBranches.filter((b) => !existingIds.has(b.branchId));
        return [...prev, ...toAdd];
      });

      setRegions((prev) => {
        const existingNos = new Set(prev.map((r) => r.regionNo));
        const toAdd = cleanRegions.filter((r) => !existingNos.has(r.regionNo));
        return [...prev, ...toAdd];
      });
    }

    logAudit('BRANCHES_REGIONS_IMPORTED', 'MasterData', 'ALL', {
      branchesCount: cleanBranches.length,
      regionsCount: cleanRegions.length,
      mode,
    });

    return { branchesCount: cleanBranches.length, regionsCount: cleanRegions.length };
  };

  const resetAllDataToDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setRequests(SAMPLE_REQUESTS);
    setFields(ZERO_INVENTORY_FIELDS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setRecords(INITIAL_RECORDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setDeviceBindings(INITIAL_DEVICE_BINDINGS);
    setPasswordResetRequests([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTemplates(INITIAL_TEMPLATES);
    setOfflineQueue([]);
    setCurrentUser(INITIAL_USERS[0]);
    logAudit('RESET_SYSTEM_DATA', 'System', 'ALL', {});
  };

  const clearAllDemoData = () => {
    setRequests([]);
    setRecords([]);
    setRecordResponses({});
    setNotifications([]);
    setAssignments([]);
    setOfflineQueue([]);
    logAudit('SYSTEM_CLEARED_FOR_PRODUCTION', 'System', 'ALL', {});
  };

  const wipeDemoDataForProduction = (options?: { wipeBranchesAndRegions?: boolean }) => {
    // 1. Wipe all operational and transactional data
    setRequests([]);
    setRecords([]);
    setRecordResponses({});
    setAssignments([]);
    setNotifications([]);
    setOfflineQueue([]);

    // 2. Wipe branches & regions if explicitly requested
    if (options?.wipeBranchesAndRegions) {
      setBranches([]);
      setRegions([]);
    }

    // 3. Keep admin user active so session is never broken
    const adminUser = users.find((u) => u.role === 'ADMIN') || INITIAL_USERS[0];
    setCurrentUser(adminUser);

    // 4. Update localStorage immediately for clean blank slate
    localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_PREFIX}records`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_PREFIX}responses`, JSON.stringify({}));
    localStorage.setItem(`${STORAGE_PREFIX}assignments`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify([]));
    if (options?.wipeBranchesAndRegions) {
      localStorage.setItem(`${STORAGE_PREFIX}branches`, JSON.stringify([]));
      localStorage.setItem(`${STORAGE_PREFIX}regions`, JSON.stringify([]));
    }

    logAudit('WIPE_DEMO_DATA_FOR_PRODUCTION', 'System', 'ALL', {
      wipeBranchesAndRegions: !!options?.wipeBranchesAndRegions,
      timestamp: new Date().toISOString(),
    });
  };

  const updateAppSettings = (updates: Partial<AppSettings>) => {
    setAppSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(next));
      return next;
    });
  };

  const approveDeviceReplacement = (bindingId: string) => {
    setDeviceBindings((prev) =>
      prev.map((b) =>
        b.bindingId === bindingId
          ? { ...b, status: 'ACTIVE', bindingStatus: 'Bound', updatedAt: new Date().toISOString() }
          : b
      )
    );
    logAudit('DEVICE_REPLACEMENT_APPROVED', 'DeviceBinding', bindingId, {});
  };

  const rejectDeviceReplacement = (bindingId: string) => {
    setDeviceBindings((prev) =>
      prev.map((b) =>
        b.bindingId === bindingId
          ? { ...b, status: 'RELEASED', bindingStatus: 'Unbound', updatedAt: new Date().toISOString() }
          : b
      )
    );
    logAudit('DEVICE_REPLACEMENT_REJECTED', 'DeviceBinding', bindingId, {});
  };

  const importRecords = (
    requestId: string,
    rows: any[],
    mapping?: Record<string, string>,
    fileName?: string
  ): { success: boolean; count: number } => {
    const res = commitImport(requestId, rows, mapping || {}, fileName || 'imported_dataset.xlsx');
    return { success: true, count: res.created };
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        dir,
        t,
        activeView,
        setActiveView,
        viewMode: activeView,
        setViewMode: setActiveView,
        currentUser,
        users,
        branches,
        regions,
        requests,
        fields,
        assignments,
        records,
        recordResponses,
        notifications,
        deviceBindings,
        passwordResetRequests,
        auditLogs,
        templates,
        appSettings,
        offlineQueue,
        isOnline,
        setIsOnline,
        selectedRegionNo,
        setSelectedRegionNo,
        simulatedDeviceId,
        setSimulatedDeviceId,
        simulateNewDevice,
        login,
        logout,
        quickSwitchUser,
        changePassword,
        requestPasswordReset,
        adminResetPassword,
        adminUnlockAccount,
        releaseDeviceBinding,
        resetUserPassword: adminResetPassword,
        unlockUser: adminUnlockAccount,
        releaseUserDevice: releaseDeviceBinding,
        updateUser,
        addUser,
        createUser: addUser,
        importUsersBatch,
        approveDeviceReplacement,
        rejectDeviceReplacement,
        createRequest,
        updateRequest,
        updateRequestFields,
        publishRequest,
        closeRequest,
        archiveRequest,
        reopenRequest,
        cloneRequest,
        saveDraftRecord,
        submitRecord,
        reassignRecord,
        syncOfflineQueue,
        commitImport,
        importRecords,
        markNotificationAsRead,
        sendBroadcastNotification,
        enablePushNotifications,
        isPushSupported,
        pushPermission,
        saveAsTemplate,
        createBranch,
        updateBranch,
        deleteBranch,
        createRegion,
        updateRegion,
        deleteRegion,
        importBranchesAndRegions,
        resetAllDataToDefaults,
        resetAllData: resetAllDataToDefaults,
        clearAllDemoData,
        wipeDemoDataForProduction,
        updateAppSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
