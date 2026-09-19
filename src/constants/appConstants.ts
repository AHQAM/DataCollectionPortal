/**
 * Unified application constants
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  REP: 'REP',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const REQUEST_STATUS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
} as const;

export type RequestStatusType = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const RECORD_STATUS = {
  PENDING: 'Pending',
  DRAFT_SAVED: 'DraftSaved',
  SUBMITTED: 'Submitted',
  COMPLETED: 'Completed',
} as const;

export type RecordStatusType = (typeof RECORD_STATUS)[keyof typeof RECORD_STATUS];

export const DEVICE_BINDING_STATUS = {
  BOUND: 'BOUND',
  UNBOUND: 'UNBOUND',
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  REPLACED: 'REPLACED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
} as const;

export const BUSINESS_RULES = {
  DRAFT_COMPLETION_PERCENT: 50,
  COMPLETED_COMPLETION_PERCENT: 100,
  MAX_IMPORT_ROWS: 5000,
  DEFAULT_PASSWORD_MIN_LENGTH: 8,
} as const;
