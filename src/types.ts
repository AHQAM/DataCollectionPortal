export type UserRole = "ADMIN" | "SUPERVISOR" | "REP";

export interface UserPermissions {
  canManageUsers: boolean;
  canManageRequests: boolean;
  canManageRegions: boolean;
  canViewAllBranches: boolean;
}

export type RequestStatus =
  | "Draft"
  | "ReadyForReview"
  | "Published"
  | "Closed"
  | "Archived"
  | "Cancelled";
export type RequestPriority = "Low" | "Normal" | "High" | "Urgent";
export type RequestType =
  "per_record" | "per_rep" | "per_region" | "per_branch";

export type RecordStatus =
  | "Pending"
  | "InProgress"
  | "DraftSaved"
  | "Submitted"
  | "Completed"
  | "Rejected"
  | "Reopened";
export type AssignmentStatus =
  "Active" | "Completed" | "Pending" | "Reassigned";

export type DynamicFieldType =
  | "text"
  | "textarea"
  | "integer"
  | "decimal"
  | "currency"
  | "percentage"
  | "date"
  | "time"
  | "datetime"
  | "yes_no"
  | "select"
  | "multi_select"
  | "searchable_dropdown"
  | "radio"
  | "single_choice"
  | "checkbox"
  | "multi_choice"
  | "rating"
  | "photo"
  | "multi_photo"
  | "barcode_scan"
  | "qr_scan"
  | "file"
  | "file_attachment"
  | "gps"
  | "signature"
  | "readonly_imported"
  | "readonly_calculated"
  | "calculated_field"
  | "hidden_system"
  | "static_heading"
  | "static_instruction"
  | "divider";

export type FieldType = DynamicFieldType;

export interface FieldOption {
  id: string;
  labelAr: string;
  labelEn: string;
  value: string;
}

export interface ConditionalRule {
  targetFieldKey: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "is_empty"
    | "is_not_empty";
  value: string;
}

export interface RequestField {
  fieldId: string;
  requestId: string;
  schemaVersion: number;
  fieldKey: string;
  fieldLabelAr: string;
  fieldLabelEn: string;
  helpTextAr?: string;
  helpTextEn?: string;
  placeholderAr?: string;
  placeholderEn?: string;
  fieldType: DynamicFieldType;
  isRequired: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validationRule?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    regex?: string;
    allowedExtensions?: string[];
  };
  visibilityRule?: ConditionalRule;
  requiredRule?: ConditionalRule;
  readOnlyRule?: boolean;
  isReadOnly?: boolean;
  calculationExpression?: string;
  sectionNameAr?: string;
  sectionNameEn?: string;
  sortOrder: number;
  isActive: boolean;
  importedSourceKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: string;
  username: string; // Region number (e.g., '101') or 'ADMIN'
  regionNo: string;
  allowedRegionNos: string[];
  userNo: string;
  userNameAr: string;
  userNameEn?: string;
  email?: string;
  mobile?: string;
  mobileNo?: string;
  branchId: string;
  branchNameAr?: string;
  branchNameEn?: string;
  role: UserRole;
  permissions?: UserPermissions;
  mustChangePassword: boolean;
  isActive: boolean;
  failedLoginCount: number;
  failedLoginAttempts?: number;
  passwordHash?: string;
  lockedUntil?: string | null;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  sessionVersion: number;
  deviceBindingStatus: "UNBOUND" | "BOUND" | "RELEASE_REQUESTED";
  boundDeviceId?: string;
  boundDevicePlatform?: "Android" | "iOS" | "Web";
  boundDeviceLabel?: string;
  maxAllowedDevices: number;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  regionId: string;
  regionNo: string;
  regionNameAr: string;
  regionNameEn: string;
  branchId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestItem {
  requestId: string;
  requestCode: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  requestType: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  category: string;
  tags: string[];
  startAt: string;
  dueAt: string;
  dueDate?: string;
  allowEditAfterSubmit: boolean;
  allowEditAfterDueDate: boolean;
  requireSupervisorApproval: boolean;
  completionRule: string;
  formSchemaVersion: number;
  coverImagePath?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
  archivedAt?: string;
  cancelledAt?: string;
  totalRecords: number;
  totalAssignments: number;
  targetBranches?: string[];
  targetRegions?: string[];
  activityId?: string;
  targetEntityLabelAr?: string;
  targetEntityLabelEn?: string;
}

export interface RequestTemplate {
  templateId: string;
  templateNameAr: string;
  templateNameEn: string;
  category: string;
  tags: string[];
  requestSchemaSnapshot: {
    request: Partial<RequestItem>;
    fields: RequestField[];
  };
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface Assignment {
  assignmentId: string;
  requestId: string;
  userId: string;
  regionNo: string;
  branchId: string;
  assignmentStatus: AssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  totalRecords: number;
  completedRecords: number;
  pendingRecords: number;
  progressPercent: number;
  completedAt?: string;
  lastActivityAt?: string;
  reassignedFromUserId?: string;
  reassignmentReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordItem {
  recordId: string;
  requestId: string;
  assignmentId: string;
  assignedUserId: string;
  assignedRegionNo: string;
  targetId?: string;
  targetName?: string;
  branchId: string;
  branchName: string;
  regionNo: string;
  userNo: string;
  userName: string;
  area?: string;
  rawData: Record<string, any>;
  recordStatus: RecordStatus;
  completionPercent: number;
  startedAt?: string;
  draftSavedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  reopenedAt?: string;
  lastSavedAt?: string;
  lastSavedBy?: string;
  rejectionReasonAr?: string;
  rejectionReasonEn?: string;
  activityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseValue {
  responseId: string;
  requestId: string;
  recordId: string;
  fieldId: string;
  fieldKey: string;
  schemaVersion: number;
  value: any;
  storageFilePath?: string;
  downloadUrl?: string;
  latitude?: number;
  longitude?: number;
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
}

export interface ImportLog {
  importId: string;
  requestId: string;
  sourceFileName: string;
  sourceStoragePath?: string;
  importedBy: string;
  importedAt: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  unmatchedRows: number;
  mappingJson: Record<string, string>;
  errorReportPath?: string;
  importStatus: "SUCCESS" | "FAILED" | "PARTIAL";
  notes?: string;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  requestId?: string;
  assignmentId?: string;
  notificationType:
    | "NEW_REQUEST"
    | "DUE_REMINDER"
    | "COMPLETION"
    | "PASSWORD_RESET"
    | "DEVICE_BIND"
    | "RECORD_REOPENED";
  channel: "PUSH" | "IN_APP" | "SMS" | "WHATSAPP_PLACEHOLDER";
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  status: "PENDING" | "SENT" | "FAILED" | "READ";
  sentAt: string;
  readAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface DeviceBinding {
  bindingId: string;
  userId: string;
  userNameAr: string;
  userName?: string;
  regionNo: string;
  deviceIdHash: string;
  devicePlatform: "Android" | "iOS" | "Web";
  platform?: string;
  deviceLabel: string;
  appVersion: string;
  status: "ACTIVE" | "RELEASED" | "PENDING_REPLACEMENT";
  bindingStatus?: "Bound" | "Unbound" | "ReplacementPending" | string;
  installationDeviceId?: string;
  boundAt: string;
  releasedAt?: string;
  releasedBy?: string;
  releaseReason?: string;
  lastActiveAt: string;
  fcmTokenHash?: string;
  fcmTokenUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetRequest {
  resetRequestId: string;
  userId: string;
  regionNo: string;
  userNameAr?: string;
  requestNotes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resetAt?: string;
  resetMethod?: string;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  userId: string;
  userRole: UserRole;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  requestId?: string;
  recordId?: string;
  detailsJson?: string;
  details?: any;
  createdAt: string;
  sessionIdentifier?: string;
  deviceBindingId?: string;
  deviceId?: string;
}

export interface AppSettings {
  defaultLanguage: "ar" | "en";
  defaultPasswordPolicy: {
    minLength: number;
    preventImmediateReuse: boolean;
  };
  securityPolicy?: {
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
  };
  maxLoginAttempts: number;
  lockoutMinutes: number;
  maxDevicesPerUser: number;
  googleDriveSyncEnabled: boolean;
  googleDriveFolder: string;
  supportContact: {
    phone: string;
    email: string;
    whatsapp: string;
  };
}

export interface OfflineQueueItem {
  id: string;
  recordId: string;
  requestId: string;
  responses: Record<string, any>;
  isDraft: boolean;
  queuedAt: string;
  status: "QUEUED" | "SYNCING" | "SYNCED" | "FAILED";
  error?: string;
}
