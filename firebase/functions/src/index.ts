import * as admin from "firebase-admin";

admin.initializeApp();

// Authentication
export { authenticateWithRegionPassword } from "./auth";

// Password Management
export {
  changePassword,
  requestPasswordReset,
  adminResetPassword,
  adminUnlockAccount,
} from "./passwordManagement";

// User Management
export {
  createUser,
  updateUser,
  deactivateUser,
  importUsersBatch,
} from "./userManagement";

// Device Binding
export {
  releaseDevice,
  replaceDevice,
  forceLogoutUser,
} from "./deviceBinding";

// Request Management
export {
  createRequest,
  publishRequest,
  archiveRequest,
} from "./requestManagement";

// Form Management
export {
  saveRequestFields,
} from "./formManagement";

// Assignment Management
export {
  reassignRecords,
} from "./assignmentManagement";

// Import Wizard
export {
  importDataPreview,
  commitImport,
} from "./importWizard";

// External Integration Adapter
export {
  exportDataToExternalSystem,
} from "./externalIntegrationAdapter";

// Notification Service
export {
  sendBroadcastNotification,
} from "./notificationService";

// Report Export
export {
  exportReport,
} from "./reportExport";

// Monitoring
export {
  getSystemHealth,
} from "./monitoring";
