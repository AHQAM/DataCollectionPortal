import {
  Branch,
  Region,
  User,
  RequestItem,
  RequestField,
  Assignment,
  RecordItem,
  NotificationItem,
  DeviceBinding,
  AuditLog,
  AppSettings,
  RequestTemplate,
} from '../types';

export const INITIAL_BRANCHES: Branch[] = [];
export const INITIAL_REGIONS: Region[] = [];

export const INITIAL_USERS: User[] = [
  {
    userId: 'USER-ADMIN',
    username: 'ADMIN',
    regionNo: '000',
    allowedRegionNos: [],
    repNo: 'MGR-01',
    repNameAr: 'مدير النظام',
    repNameEn: 'System Admin',
    email: 'admin@salescollection.sa',
    mobile: '+966501112233',
    branchId: 'BR-RYD',
    branchNameAr: 'المركز الرئيسي',
    role: 'ADMIN',
    mustChangePassword: false,
    isActive: true,
    failedLoginCount: 0,
    sessionVersion: 1,
    deviceBindingStatus: 'UNBOUND',
    maxAllowedDevices: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SAMPLE_REQUESTS: RequestItem[] = [];
export const ZERO_INVENTORY_FIELDS: RequestField[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_RECORDS: RecordItem[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_DEVICE_BINDINGS: DeviceBinding[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_TEMPLATES: RequestTemplate[] = [];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultLanguage: 'ar',
  defaultPasswordPolicy: {
    minLength: 6,
    preventImmediateReuse: true,
    initialPin: '1234',
  },
  maxLoginAttempts: 5,
  lockoutMinutes: 15,
  maxDevicesPerUser: 1,
  googleDriveSyncEnabled: false,
  googleDriveFolder: 'Archive',
  supportContact: {
    phone: '920001234',
    email: 'support@salescollection.sa',
    whatsapp: '+966501112233',
  },
};
