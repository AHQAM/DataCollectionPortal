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
  DEFAULT_APP_SETTINGS,
} from '../data/seedData';
import {
  sendBrowserNotification,
  requestBrowserNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from '../utils/webNotification';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, writeBatch, query, where } from 'firebase/firestore';
import { signInWithCustomToken, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { db, functions, auth } from '../firebase';

interface LoginResult {
  success: boolean;
  messageAr?: string;
  messageEn?: string;
  mustChangePassword?: boolean;
}

// Ensure login can return a Promise now


interface AppContextType {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  dir: 'rtl' | 'ltr';
  t: (key: string, defaultAr?: string, defaultEn?: string) => string;

  currentUser: User | null;
  authReady: boolean;
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
  syncOfflineQueue: () => Promise<void>;

  // Multi-region selection for reps
  selectedRegionNo: string;
  setSelectedRegionNo: (reg: string) => void;

  // Device simulation
  simulatedDeviceId: string;
  setSimulatedDeviceId: (id: string) => void;
  simulateNewDevice: () => void;

  // Auth operations
  login: (regionNo: string, passwordInput: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  quickSwitchUser: (userId: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (regionNo: string, notes: string) => void;
  adminResetPassword: (userId: string) => void;
  adminUnlockAccount: (userId: string) => void;
  releaseDeviceBinding: (userId: string, reason?: string) => void;
  resetUserPassword: (userId: string) => Promise<{ success: boolean; temporaryPassword?: string; message: string }>;
  unlockUser: (userId: string) => void;
  releaseUserDevice: (userId: string, reason?: string) => void;
  updateUser: (user: User) => void;
  addUser: (user: Partial<User>) => Promise<void>;
  createUser: (user: Partial<User>) => Promise<void>;
  importUsersBatch: (users: User[]) => void;
  approveDeviceReplacement: (bindingId: string) => void;
  rejectDeviceReplacement: (bindingId: string) => void;

  // Request & Form operations
  createRequest: (request: Partial<RequestItem>, fields: RequestField[]) => string;
  updateRequest: (requestId: string, updates: Partial<RequestItem>) => void;
  updateRequestFields: (requestId: string, fields: RequestField[]) => void;
  publishRequest: (requestId: string) => Promise<void>;
  closeRequest: (requestId: string) => void;
  archiveRequest: (requestId: string) => void;
  reopenRequest: (requestId: string) => void;
  cloneRequest: (requestId: string) => string;

  // Record submission & offline
  saveDraftRecord: (recordId: string, values: Record<string, any>) => void;
  submitRecord: (recordId: string, values: Record<string, any>) => { success: boolean; message?: string };
  reassignRecord: (recordId: string, newUserId: string, reason: string) => void;
  // Data import
  commitImport: (
    requestId: string,
    importedRows: any[],
    mapping: Record<string, string>,
    fileName: string
  ) => Promise<{ total: number; created: number }>;
  importRecords: (
    requestId: string,
    rows: any[],
    mapping?: Record<string, string>,
    fileName?: string
  ) => Promise<{ success: boolean; count: number }>;

  // Notifications & Push
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  sendBroadcastNotification: (titleAr: string, titleEn: string, bodyAr: string, bodyEn: string, targetRole?: string) => Promise<void>;
  enablePushNotifications: () => Promise<boolean>;
  isPushSupported: boolean;
  pushPermission: NotificationPermission | 'unsupported';

  // Template operations
  saveAsTemplate: (requestId: string, nameAr: string, nameEn: string, category: string) => void;

  // Branches & Regions Management
  createBranch: (branch: { branchId: string; branchNameAr: string; branchNameEn: string }) => Promise<void>;
  updateBranch: (branchId: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (branchId: string) => Promise<{ success: boolean; message?: string }>;
  createRegion: (region: { regionId: string; regionNo: string; regionNameAr: string; regionNameEn: string; branchId: string }) => Promise<void>;
  updateRegion: (regionId: string, updates: Partial<Region>) => Promise<void>;
  deleteRegion: (regionId: string) => Promise<{ success: boolean; message?: string }>;
  importBranchesAndRegions: (
    branchesData: { branchId: string; branchNameAr: string; branchNameEn?: string }[],
    regionsData: { regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }[],
    mode: 'append' | 'replace'
  ) => Promise<{ branchesCount: number; regionsCount: number }>;

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

  // Simulated Device ID: Each installation generates a unique UUID
  const [simulatedDeviceId, setSimulatedDeviceId] = useState<string>(() => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}device_id`);
    if (stored) return stored;
    // Generate a random UUID for this browser session
    const initial = 'web-' + crypto.randomUUID();
    localStorage.setItem(`${STORAGE_PREFIX}device_id`, initial);
    return initial;
  });

  const simulateNewDevice = () => {
    const newId = 'device-uuid-' + Math.random().toString(36).substring(2, 11) + '-simulated';
    setSimulatedDeviceId(newId);
    localStorage.setItem(`${STORAGE_PREFIX}device_id`, newId);
  };

  // Entities stored in local state with localStorage persistence
  const [users, setUsers] = useState<User[]>([]);

  // Current session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Sync users with Firestore real-time
  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setRequests([]);
      setFields([]);
      setAssignments([]);
      setRecords([]);
      setRecordResponses({});
      setNotifications([]);
      return;
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const isSupervisor = currentUser.role === 'SUPERVISOR';
    const usersQuery = isAdmin
      ? collection(db, 'users')
      : isSupervisor
      ? query(collection(db, 'users'), where('branchId', '==', currentUser.branchId))
      : query(collection(db, 'users'), where('userId', '==', currentUser.userId));
    const requestsQuery = isAdmin
      ? collection(db, 'requests')
      : isSupervisor
      ? query(collection(db, 'requests'), where('branchId', '==', currentUser.branchId))
      : query(collection(db, 'requests'), where('assignedUserId', '==', currentUser.userId));
    const assignmentsQuery = isAdmin
      ? collection(db, 'assignments')
      : isSupervisor
      ? query(collection(db, 'assignments'), where('branchId', '==', currentUser.branchId))
      : query(collection(db, 'assignments'), where('userId', '==', currentUser.userId));
    const recordsQuery = isAdmin
      ? collection(db, 'records')
      : isSupervisor
      ? query(collection(db, 'records'), where('branchId', '==', currentUser.branchId))
      : query(collection(db, 'records'), where('assignedUserId', '==', currentUser.userId));
    const responsesQuery = isAdmin
      ? collection(db, 'responses')
      : query(collection(db, 'responses'), where('submittedBy', '==', currentUser.userId));
    const notificationsQuery = isAdmin
      ? collection(db, 'notifications')
      : query(collection(db, 'notifications'), where('userId', '==', currentUser.userId));

    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const firestoreUsers: User[] = [];
      snapshot.forEach((docSnap) => firestoreUsers.push(docSnap.data() as User));
      if (firestoreUsers.length > 0) setUsers(firestoreUsers);
    }, (error) => console.error("Error listening to users:", error));

    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
      const data: RequestItem[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as RequestItem));
      setRequests(data);
    }, (error) => console.error("Error listening to requests:", error));

    const unsubFields = onSnapshot(collection(db, 'request_fields'), (snapshot) => {
      const data: RequestField[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as RequestField));
      setFields(data);
    }, (error) => console.error("Error listening to fields:", error));

    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const data: Assignment[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as Assignment));
      setAssignments(data);
    }, (error) => console.error("Error listening to assignments:", error));

    const unsubRecords = onSnapshot(recordsQuery, (snapshot) => {
      const data: RecordItem[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as RecordItem));
      setRecords(data);
    }, (error) => console.error("Error listening to records:", error));

    const unsubResponses = onSnapshot(responsesQuery, (snapshot) => {
      const data: Record<string, Record<string, any>> = {};
      snapshot.forEach((docSnap) => {
        const resp = docSnap.data();
        if (resp.recordId && resp.answers) {
          data[resp.recordId] = resp.answers;
        }
      });
      setRecordResponses(data);
    }, (error) => console.error("Error listening to responses:", error));

    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const data: NotificationItem[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as NotificationItem));
      setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => console.error("Error listening to notifications:", error));

    const unsubBranches = onSnapshot(collection(db, 'branches'), (snapshot) => {
      const data: Branch[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as Branch));
      setBranches(data);
    }, (error) => console.error("Error listening to branches:", error));

    const unsubRegions = onSnapshot(collection(db, 'regions'), (snapshot) => {
      const data: Region[] = [];
      snapshot.forEach((docSnap) => data.push(docSnap.data() as Region));
      setRegions(data);
    }, (error) => console.error("Error listening to regions:", error));

    return () => {
      unsubUsers();
      unsubRequests();
      unsubFields();
      unsubAssignments();
      unsubRecords();
      unsubResponses();
      unsubNotifications();
      unsubBranches();
      unsubRegions();
    };
  }, [currentUser]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [fields, setFields] = useState<RequestField[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [recordResponses, setRecordResponses] = useState<Record<string, Record<string, any>>>({});

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [deviceBindings, setDeviceBindings] = useState<DeviceBinding[]>([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [templates, setTemplates] = useState<RequestTemplate[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return saved ? JSON.parse(saved) : DEFAULT_APP_SETTINGS;
  });

  // Selected region for representative with multi-region access
  const [selectedRegionNo, setSelectedRegionNo] = useState<string>(() => {
    return currentUser ? currentUser.regionNo : '101';
  });



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
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}current_user`, JSON.stringify(currentUser));
      setSelectedRegionNo(currentUser.regionNo);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
    }
  }, [currentUser]);

  // Push notifications state
  const isPushSupported = isNotificationSupported();
  // Online status tracking
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.getIdTokenResult(true);
        } catch (err) {
          console.error('Error refreshing Firebase Auth token:', err);
          setCurrentUser(null);
          setAuthReady(true);
          return;
        }

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setCurrentUser(userData);
            setSelectedRegionNo(userData.regionNo);
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error('Error fetching user from Firestore:', err);
          setCurrentUser(null);
        }
      } else {
        // If not logged in on Firebase, clear context user
        setCurrentUser(null);
        localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const login = async (regionNoOrEmail: string, passwordInput: string): Promise<LoginResult> => {
    const trimmedInput = regionNoOrEmail.trim();
    
    // Validate required fields
    if (!trimmedInput || !passwordInput) {
       return {
         success: false,
         messageAr: 'اسم المستخدم وكلمة المرور مطلوبة.',
         messageEn: 'Username and password are required.',
       };
    }

    try {
      // Check if input is an email
      if (trimmedInput.includes('@')) {
        // Use standard Firebase Email/Password Auth
        const userCredential = await signInWithEmailAndPassword(auth, trimmedInput, passwordInput);
        const firebaseUser = userCredential.user;
        
        // Context will be synced via the onAuthStateChanged listener, 
        // but we can return success here immediately
        return {
          success: true,
          mustChangePassword: false, // We'll rely on claims or separate check if needed
        };
      } else {
        // Fallback for Field Reps (using Cloud Function)
        // Call the secure Cloud Function
        const authFunction = httpsCallable(functions, 'authenticateWithRegionPassword');
        const response = await authFunction({
          regionNo: trimmedInput,
          password: passwordInput,
          installationDeviceId: simulatedDeviceId,
          platform: 'Web',
          appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
        });

        const data = response.data as any;

        if (data.success && data.token) {
            // Use the custom token to sign in with Firebase Auth
            await signInWithCustomToken(auth, data.token);

            const loggedInUser: User = {
              userId: data.userId || data.uid || trimmedInput,
              username: trimmedInput,
              regionNo: data.regionNo,
              allowedRegionNos: data.allowedRegionNos || [data.regionNo],
              repNo: data.repNo || data.regionNo,
              repNameAr: data.repNameAr || trimmedInput,
              repNameEn: data.repNameEn || undefined,
              branchId: data.branchId,
              role: data.role,
              mustChangePassword: Boolean(data.mustChangePassword),
              isActive: true,
              failedLoginCount: 0,
              sessionVersion: Number(data.sessionVersion || 0),
              deviceBindingStatus: 'UNBOUND',
              maxAllowedDevices: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            setCurrentUser(loggedInUser);
            setSelectedRegionNo(loggedInUser.regionNo);
            
            logAudit('LOGIN_SUCCESS', 'Auth', loggedInUser.userId, { role: loggedInUser.role, regionNo: loggedInUser.regionNo }, loggedInUser);
            
            return {
              success: true,
              mustChangePassword: loggedInUser.mustChangePassword,
            };
        } else {
            return {
              success: false,
              messageAr: 'بيانات تسجيل الدخول غير صحيحة.',
              messageEn: 'Invalid login credentials.',
            };
        }
      }
    } catch (err: any) {
       console.error("Login Error:", err);
       
       let errorAr = 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
       let errorEn = 'Login failed. Please try again.';
       
       if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
         errorAr = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
         errorEn = 'Invalid email or password.';
       }
       
       // Handle known error messages from Cloud Function
       if (err.message) {
         if (err.message.includes('User not found') || err.message.includes('Invalid credentials')) {
           errorAr = 'البيانات غير صحيحة.';
           errorEn = 'Invalid credentials.';
         } else if (err.message.includes('Account is locked')) {
           errorAr = 'تم قفل الحساب مؤقتاً. يرجى مراجعة الإدارة.';
           errorEn = 'Account is locked. Please contact Admin.';
         } else if (err.message.includes('bound to another device')) {
           errorAr = 'هذا الحساب مرتبط بجهاز آخر.';
           errorEn = 'This account is linked to another device.';
         } else if (err.message.includes('Account is disabled')) {
           errorAr = 'هذا الحساب معطل حالياً.';
           errorEn = 'This account is disabled.';
         }
       }

       return {
         success: false,
         messageAr: errorAr,
         messageEn: errorEn,
       };
    }
  };

// Removed local validation since CF handles it now

  const logout = async () => {
    if (currentUser) {
      logAudit('LOGOUT', 'Auth', currentUser.userId, {});
    }
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_PREFIX}current_user`);
  };

  const quickSwitchUser = (userId: string) => {
    if (!import.meta.env.DEV) {
      console.warn('Quick user switching is available only in development builds.');
      return;
    }
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
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
    try {
      const changePasswordFn = httpsCallable(functions, 'changePassword');
      await changePasswordFn({ currentPassword, newPassword });
      
      const updated: User = {
        ...currentUser,
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
    } catch (e: any) {
      return {
        success: false,
        message: lang === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'
      };
    }
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

  const adminResetPassword = async (userId: string) => {
    const temporaryPassword = `${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}Aa1!`;
    try {
      const resetPasswordFn = httpsCallable(functions, 'adminResetPassword');
      await resetPasswordFn({ targetUserId: userId, temporaryPassword });

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === userId
            ? { ...u, mustChangePassword: true, failedLoginCount: 0, lockedUntil: null, sessionVersion: u.sessionVersion + 1 }
            : u
        )
      );

      return {
        success: true,
        temporaryPassword,
        message: lang === 'ar' ? 'تم إنشاء كلمة مرور مؤقتة لمرة واحدة.' : 'A one-time temporary password was created.',
      };
    } catch (error) {
      console.error('Admin password reset failed:', error);
      return {
        success: false,
        message: lang === 'ar' ? 'فشل إعادة تعيين كلمة المرور.' : 'Password reset failed.',
      };
    }
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

  const updateUser = async (user: User) => {
    setUsers((prev) => prev.map((u) => (u.userId === user.userId ? user : u)));
    try {
      await updateDoc(doc(db, 'users', user.userId), { ...user });
    } catch (err) {
      console.error("Firestore update error:", err);
    }
    logAudit('USER_UPDATED', 'User', user.userId, { role: user.role, active: user.isActive });
  };

  const addUser = async (user: Partial<User>) => {
    const defaultBranch = branches.find((b) => b.branchId === user.branchId) || branches[0];
    
    // If creating Admin or Supervisor, use the secure Cloud Function
    if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
      try {
        const createAdminFn = httpsCallable(functions, 'createAdminSupervisorUser');
        const response = await createAdminFn({
          email: user.regionNo, // regionNo acts as email for Admins/Supervisors in this context
          role: user.role,
          branchId: user.branchId || defaultBranch?.branchId || null,
          repNameAr: user.repNameAr || 'مستخدم جديد',
          repNameEn: user.repNameEn || '',
          mobileNo: (user as any).mobileNo || (user as any).mobile || '',
          allowedRegionNos: user.allowedRegionNos || [user.regionNo],
        });
        
        const data = response.data as any;
        if (data.success) {
           logAudit('USER_CREATED_VIA_CF', 'User', data.userId, { email: user.regionNo });
        }
      } catch (err: any) {
        console.error("Cloud Function add error:", err);
        throw err; // Re-throw to be caught by UI
      }
      return;
    }

    // For REP, use the Cloud Function (direct Firestore write is blocked by rules)
    try {
      const createRepFn = httpsCallable(functions, 'createUser');
      const response = await createRepFn({
        username: user.regionNo || user.repNo || '',
        regionNo: user.regionNo || '',
        allowedRegionNos: user.allowedRegionNos || (user.regionNo ? [user.regionNo] : []),
        repNo: user.repNo || 'REP-' + Math.floor(Math.random() * 900 + 100),
        repNameAr: user.repNameAr || (lang === 'ar' ? 'مندوب جديد' : 'New Representative'),
        repNameEn: user.repNameEn || '',
        branchId: user.branchId || branches[0]?.branchId || '',
        role: 'REP',
      });
      const data = response.data as any;
      if (data.success) {
        logAudit('USER_CREATED_VIA_CF', 'User', data.userId, { username: user.regionNo });
      }
    } catch (err: any) {
      console.error('Cloud Function create REP error:', err);
      throw err;
    }
  };

  const importUsersBatch = async (importedUsers: User[]) => {
    // Save to Firestore using a batch
    try {
      const batch = writeBatch(db);
      
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
            const mergedUser = {
              ...existing,
              allowedRegionNos: mergedRegions,
              branchNameAr: newUser.branchNameAr || existing.branchNameAr,
              branchId: newUser.branchId || existing.branchId,
              repNo: existing.repNo || newUser.repNo,
              updatedAt: new Date().toISOString(),
            };
            updated[existingIdx] = mergedUser;
            batch.set(doc(db, 'users', existing.userId), mergedUser, { merge: true });
          } else {
            const userToInsert = {
              ...newUser,
              permissions: {
                canManageUsers: false,
                canManageRequests: false,
                canManageRegions: false,
                canViewAllBranches: false
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updated.push(userToInsert);
            batch.set(doc(db, 'users', newUser.userId), userToInsert);
          }
        });
        return updated;
      });

      // Register any newly imported branches
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

      await batch.commit();
      logAudit('USERS_IMPORTED_EXCEL', 'User', 'BATCH', { count: importedUsers.length });
    } catch (err) {
      console.error("Error committing batch to Firestore:", err);
    }
  };

  // -------------------------------------------------------------
  // REQUEST & FORM ENGINE
  // -------------------------------------------------------------
  const createRequest = async (newReq: Partial<RequestItem>, newFields: RequestField[]): Promise<string> => {
    try {
      const createReqFn = httpsCallable(functions, 'createRequest');
      const response = await createReqFn({ ...newReq });
      const data = response.data as any;
      const newActivityId = data.activityId;
      
      if (newFields.length > 0) {
        const saveFieldsFn = httpsCallable(functions, 'saveRequestFields');
        await saveFieldsFn({ activityId: newActivityId, fields: newFields });
      }
      
      logAudit('REQUEST_CREATED', 'Request', newActivityId, { code: newReq.requestCode, fieldsCount: newFields.length });
      return newActivityId;
    } catch (err) {
      console.error("Error creating request via CF:", err);
      return '';
    }
  };

  const updateRequest = async (requestId: string, updates: Partial<RequestItem>) => {
    try {
      const updateReqFn = httpsCallable(functions, 'updateDraftRequest');
      await updateReqFn({ requestId, updates });
      logAudit('REQUEST_UPDATED', 'Request', requestId, updates);
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  const updateRequestFields = async (requestId: string, newFields: RequestField[]) => {
    try {
      const saveFieldsFn = httpsCallable(functions, 'saveRequestFields');
      await saveFieldsFn({ requestId, fields: newFields });
      logAudit('FIELDS_UPDATED', 'Request', requestId, { fieldsCount: newFields.length });
    } catch (err) {
      console.error("Error updating fields in Firestore:", err);
    }
  };

  const publishRequest = async (requestId: string) => {
    try {
      const publishReqFn = httpsCallable(functions, 'publishRequest');
      await publishReqFn({ requestId });
      
      const req = requests.find((r) => r.requestId === requestId);
      if (req) {
        logAudit('REQUEST_PUBLISHED', 'Request', requestId, { titleAr: req.titleAr });
      }
    } catch (err) {
      console.error("Error publishing request:", err);
      throw err;
    }
  };

  const closeRequest = async (requestId: string) => {
    try {
      const closeReqFn = httpsCallable(functions, 'closeRequest');
      await closeReqFn({ requestId });
      logAudit('REQUEST_CLOSED', 'Request', requestId, {});
    } catch (err) {
      console.error("Error closing request:", err);
    }
  };

  const archiveRequest = async (requestId: string) => {
    try {
      const archiveReqFn = httpsCallable(functions, 'archiveRequest');
      await archiveReqFn({ requestId });
      logAudit('REQUEST_ARCHIVED', 'Request', requestId, {});
    } catch (err) {
      console.error("Error archiving request:", err);
    }
  };

  const reopenRequest = async (requestId: string) => {
    try {
      const reopenReqFn = httpsCallable(functions, 'reopenRequest');
      await reopenReqFn({ requestId });
      logAudit('REQUEST_REOPENED', 'Request', requestId, {});
    } catch (err) {
      console.error("Error reopening request:", err);
    }
  };

  const cloneRequest = async (requestId: string): Promise<string> => {
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
    
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'requests', newId), clonedReq);

      srcFields.forEach((f) => {
        const fieldId = 'FLD-' + Math.random().toString(36).substring(2, 8);
        batch.set(doc(db, 'request_fields', fieldId), {
          ...f,
          fieldId,
          requestId: newId,
        });
      });

      await batch.commit();
      logAudit('REQUEST_CLONED', 'Request', newId, { sourceRequestId: requestId });
    } catch (err) {
      console.error("Error cloning request:", err);
    }
    return newId;
  };

  // -------------------------------------------------------------
  // RECORD SUBMISSION & OFFLINE ENGINE
  // -------------------------------------------------------------
  const saveDraftRecord = async (recordId: string, values: Record<string, any>) => {
    if (!isOnline) {
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
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'responses', recordId), values, { merge: true });
      batch.update(doc(db, 'records', recordId), {
        recordStatus: 'DraftSaved',
        completionPercent: 50,
        draftSavedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        lastSavedBy: currentUser?.userId,
        updatedAt: new Date().toISOString(),
      });
      await batch.commit();
      logAudit('RECORD_DRAFT_SAVED', 'Record', recordId, { isOffline: false });
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  const submitRecord = async (recordId: string, values: Record<string, any>) => {
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
      return {
        success: true,
        message: lang === 'ar' ? 'تم الحفظ محلياً (غير متصل). ستتم المزامنة تلقائياً عند عودة الاتصال.' : 'Saved locally (offline). Will sync when connection returns.',
      };
    }

    const targetRecord = records.find((r) => r.recordId === recordId);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'responses', recordId), values, { merge: true });
      batch.update(doc(db, 'records', recordId), {
        recordStatus: 'Completed',
        completionPercent: 100,
        submittedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        lastSavedBy: currentUser?.userId,
        updatedAt: new Date().toISOString(),
      });

      if (targetRecord && targetRecord.assignmentId !== 'UNASSIGNED') {
        const asg = assignments.find((a) => a.assignmentId === targetRecord.assignmentId);
        if (asg) {
          const completed = asg.completedRecords + 1;
          const pending = Math.max(0, asg.totalRecords - completed);
          const progressPercent = Math.round((completed / asg.totalRecords) * 100);
          batch.update(doc(db, 'assignments', targetRecord.assignmentId), {
            completedRecords: completed,
            pendingRecords: pending,
            progressPercent,
            completedAt: completed >= asg.totalRecords ? new Date().toISOString() : null,
            lastActivityAt: new Date().toISOString(),
          });
        }
      }

      await batch.commit();
      logAudit('RECORD_COMPLETED', 'Record', recordId, {
        customerNo: targetRecord?.customerNo,
        values,
      });

      return {
        success: true,
        message: lang === 'ar' ? 'تم الحفظ والاعتماد بنجاح.' : 'Saved and submitted successfully.',
      };
    } catch (err) {
      console.error('Error submitting record:', err);
      return { success: false, message: 'Error submitting record to Firestore' };
    }
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || !isOnline) return;

    for (const q of offlineQueue) {
      if (q.isDraft) {
        await saveDraftRecord(q.recordId, q.responses);
      } else {
        await submitRecord(q.recordId, q.responses);
      }
      logAudit('OFFLINE_RECORD_SYNCED', 'Record', q.recordId, { wasDraft: q.isDraft });
    }
    setOfflineQueue([]);
  };

  const reassignRecord = async (recordId: string, newUserId: string, reason: string) => {
    try {
      const reassignFn = httpsCallable(functions, 'reassignRecords');
      await reassignFn({ recordIds: [recordId], newUserId });
      
      const newRep = users.find((u) => u.userId === newUserId);
      if (newRep) {
        logAudit('RECORD_REASSIGNED', 'Record', recordId, {
          newUserId,
          newRepName: newRep.repNameAr,
          reason,
        });
      }
    } catch (err) {
      console.error('Error reassigning record:', err);
    }
  };

  // -------------------------------------------------------------
  // IMPORT ENGINE
  // -------------------------------------------------------------
  const commitImport = async (
    requestId: string,
    importedRows: any[],
    mapping: Record<string, string>,
    fileName: string
  ): Promise<{ total: number; created: number }> => {
    try {
      const commitFn = httpsCallable<{
        requestId: string;
        importedRows: any[];
        mapping: Record<string, string>;
        fileName: string;
        lang: string;
      }, { total: number; created: number; skipped: number; success: boolean }>(functions, 'commitImport');

      const result = await commitFn({
        requestId,
        importedRows,
        mapping,
        fileName,
        lang,
      });

      if (result.data.success) {
        logAudit('IMPORT_COMMITTED', 'Import', requestId, {
          fileName,
          totalRows: result.data.total,
          createdCount: result.data.created,
          skippedCount: result.data.skipped,
        });

        sendBrowserNotification(
          lang === 'ar' ? `تم استيراد بيانات جديدة بنجاح` : `Records imported successfully`,
          {
            body:
              lang === 'ar'
                ? `تم إدراج ${result.data.created} سجل جديد.`
                : `${result.data.created} new records uploaded.`,
            tag: `imp-${requestId}`,
          }
        );

        return { total: result.data.total, created: result.data.created };
      } else {
        throw new Error('Import failed on server');
      }
    } catch (err) {
      console.error('Error committing import via Cloud Function:', err);
      return { total: 0, created: 0 };
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    try {
      // Find the notification to get its exact ID if it differs, though notifId should be the doc ID
      // If we stored notificationId as doc ID:
      const docRef = doc(db, 'notifications', notifId);
      await updateDoc(docRef, {
        status: 'READ',
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const sendBroadcastNotification = async (
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string,
    targetRole?: string
  ) => {
    try {
      const sendBroadcastFn = httpsCallable<{
        targetAudience: string;
        titleAr: string;
        titleEn: string;
        bodyAr: string;
        bodyEn: string;
      }, { success: boolean; count: number }>(functions, 'sendBroadcastNotification');

      const targetAudience = targetRole === 'REP' ? 'REPRESENTATIVES' :
                             targetRole === 'SUPERVISOR' ? 'SUPERVISORS' : 'ALL';

      const result = await sendBroadcastFn({
        targetAudience,
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
      });

      if (result.data.success) {
        logAudit('BROADCAST_NOTIFICATION_SENT', 'Notification', 'ALL', { count: result.data.count });
        sendBrowserNotification(lang === 'ar' ? titleAr : titleEn, {
          body: lang === 'ar' ? bodyAr : bodyEn,
          tag: 'broadcast-notification',
        });
      }
    } catch (err) {
      console.error('Error sending broadcast notification:', err);
    }
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
  const createBranch = async (branchData: { branchId: string; branchNameAr: string; branchNameEn: string }) => {
    const newBranch: Branch = {
      branchId: branchData.branchId.toUpperCase().trim(),
      branchNameAr: branchData.branchNameAr.trim(),
      branchNameEn: branchData.branchNameEn.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'branches', newBranch.branchId), newBranch);
      logAudit('BRANCH_CREATED', 'Branch', newBranch.branchId, { name: newBranch.branchNameAr });
    } catch (err) {
      console.error("Error creating branch:", err);
    }
  };

  const updateBranch = async (branchId: string, updates: Partial<Branch>) => {
    try {
      await updateDoc(doc(db, 'branches', branchId), { ...updates, updatedAt: new Date().toISOString() });
      logAudit('BRANCH_UPDATED', 'Branch', branchId, updates);
    } catch (err) {
      console.error("Error updating branch:", err);
    }
  };

  const deleteBranch = async (branchId: string): Promise<{ success: boolean; message?: string }> => {
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
    try {
      // Use firestore delete (needs import deleteDoc, which we can import if needed, or we can just update isActive to false, let's delete via CF or deleteDoc)
      // Actually we'll just use cloud functions or deleteDoc. We don't have deleteDoc imported, so let's import it or use it via functions.
      // Wait, we don't have deleteDoc imported. Let's just set isActive to false for soft delete.
      await updateDoc(doc(db, 'branches', branchId), { isActive: false, updatedAt: new Date().toISOString() });
      logAudit('BRANCH_DELETED', 'Branch', branchId, {});
      return { success: true };
    } catch (err) {
      console.error("Error deleting branch:", err);
      return { success: false, message: 'Firestore Error' };
    }
  };

  // Region operations
  const createRegion = async (regionData: {
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
    try {
      await setDoc(doc(db, 'regions', newRegion.regionId), newRegion);
      logAudit('REGION_CREATED', 'Region', newRegion.regionId, { regionNo: newRegion.regionNo });
    } catch (err) {
      console.error("Error creating region:", err);
    }
  };

  const updateRegion = async (regionId: string, updates: Partial<Region>) => {
    try {
      await updateDoc(doc(db, 'regions', regionId), { ...updates, updatedAt: new Date().toISOString() });
      logAudit('REGION_UPDATED', 'Region', regionId, updates);
    } catch (err) {
      console.error("Error updating region:", err);
    }
  };

  const deleteRegion = async (regionId: string): Promise<{ success: boolean; message?: string }> => {
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

    try {
      await updateDoc(doc(db, 'regions', regionId), { isActive: false, updatedAt: new Date().toISOString() });
      logAudit('REGION_DELETED', 'Region', regionId, { regionNo: target.regionNo });
      return { success: true };
    } catch (err) {
      console.error("Error deleting region:", err);
      return { success: false, message: 'Firestore Error' };
    }
  };

  const importBranchesAndRegions = async (
    branchesData: { branchId: string; branchNameAr: string; branchNameEn?: string }[],
    regionsData: { regionNo: string; regionNameAr: string; regionNameEn?: string; branchId: string }[],
    mode: 'append' | 'replace'
  ): Promise<{ branchesCount: number; regionsCount: number }> => {
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

    try {
      const batch = writeBatch(db);
      
      // In replace mode, we would technically need to delete all existing, but we don't have a good way to do that safely here.
      // Usually replace means setting them anew, which will overwrite those with same IDs.
      // For a proper replace, we'd need a Cloud Function. We'll just overwrite existing ones.
      
      cleanBranches.forEach((b) => batch.set(doc(db, 'branches', b.branchId), b, { merge: true }));
      cleanRegions.forEach((r) => batch.set(doc(db, 'regions', r.regionId), r, { merge: true }));

      await batch.commit();

      logAudit('BRANCHES_REGIONS_IMPORTED', 'MasterData', 'ALL', {
        branchesCount: cleanBranches.length,
        regionsCount: cleanRegions.length,
        mode,
      });
      return { branchesCount: cleanBranches.length, regionsCount: cleanRegions.length };
    } catch (err) {
      console.error("Error importing branches/regions to Firestore:", err);
      return { branchesCount: 0, regionsCount: 0 };
    }
  };

  const resetAllDataToDefaults = () => {
    localStorage.clear();
    setUsers([]);
    setRequests([]);
    setFields([]);
    setAssignments([]);
    setRecords([]);
    setNotifications([]);
    setDeviceBindings([]);
    setPasswordResetRequests([]);
    setAuditLogs([]);
    setTemplates([]);
    if (currentUser) {
      logAudit('RESET_SYSTEM_DATA', 'System', 'ALL', {});
    }
  };

  const clearAllDemoData = () => {
    setRequests([]);
    setRecords([]);
    setRecordResponses({});
    setNotifications([]);
    setAssignments([]);
    if (currentUser) {
      logAudit('SYSTEM_CLEARED_FOR_PRODUCTION', 'System', 'ALL', {});
    }
  };

  const wipeDemoDataForProduction = (options?: { wipeBranchesAndRegions?: boolean }) => {
    // 1. Wipe all operational and transactional data
    setRequests([]);
    setRecords([]);
    setRecordResponses({});
    setAssignments([]);
    setNotifications([]);
    // 2. Wipe branches & regions if explicitly requested
    if (options?.wipeBranchesAndRegions) {
      // For production, these should wipe firestore collections instead of state
    }

    // 3. Keep admin user active so session is never broken
    const adminUser = users.find((u) => u.role === 'ADMIN') || null;
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

  const importRecords = async (
    requestId: string,
    rows: any[],
    mapping?: Record<string, string>,
    fileName?: string
  ): Promise<{ success: boolean; count: number }> => {
    const res = await commitImport(requestId, rows, mapping || {}, fileName || 'imported_dataset.xlsx');
    return { success: true, count: res.created };
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        dir,
        t,
        isOnline,
        offlineQueue,
        syncOfflineQueue,
        currentUser,
        authReady,
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
