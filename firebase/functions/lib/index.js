"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.wipeDemoData = exports.saveDraftResponse = exports.submitResponse = exports.exportReport = exports.sendBroadcastNotification = exports.exportDataToExternalSystem = exports.commitImport = exports.importDataPreview = exports.reassignRecords = exports.saveRequestFields = exports.deleteRequest = exports.cloneRequest = exports.reopenRequest = exports.archiveRequest = exports.closeRequest = exports.publishRequest = exports.updateDraftRequest = exports.createRequest = exports.importBranchesAndRegions = exports.deleteRegion = exports.updateRegion = exports.createRegion = exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.forceLogoutUser = exports.rejectDeviceReplacement = exports.replaceDevice = exports.releaseDeviceBinding = exports.releaseDevice = exports.importUsersBatch = exports.deactivateUser = exports.updateUser = exports.createUser = exports.adminUnlockAccount = exports.adminResetPassword = exports.requestPasswordReset = exports.changePassword = exports.auditPrivilegedUsers = exports.createAdminSupervisorUser = exports.authenticateWithRegionPassword = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Authentication
var auth_1 = require("./auth");
Object.defineProperty(exports, "authenticateWithRegionPassword", { enumerable: true, get: function () { return auth_1.authenticateWithRegionPassword; } });
var adminAuth_1 = require("./adminAuth");
Object.defineProperty(exports, "createAdminSupervisorUser", { enumerable: true, get: function () { return adminAuth_1.createAdminSupervisorUser; } });
Object.defineProperty(exports, "auditPrivilegedUsers", { enumerable: true, get: function () { return adminAuth_1.auditPrivilegedUsers; } });
// Password Management
var passwordManagement_1 = require("./passwordManagement");
Object.defineProperty(exports, "changePassword", { enumerable: true, get: function () { return passwordManagement_1.changePassword; } });
Object.defineProperty(exports, "requestPasswordReset", { enumerable: true, get: function () { return passwordManagement_1.requestPasswordReset; } });
Object.defineProperty(exports, "adminResetPassword", { enumerable: true, get: function () { return passwordManagement_1.adminResetPassword; } });
Object.defineProperty(exports, "adminUnlockAccount", { enumerable: true, get: function () { return passwordManagement_1.adminUnlockAccount; } });
// User Management
var userManagement_1 = require("./userManagement");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return userManagement_1.createUser; } });
Object.defineProperty(exports, "updateUser", { enumerable: true, get: function () { return userManagement_1.updateUser; } });
Object.defineProperty(exports, "deactivateUser", { enumerable: true, get: function () { return userManagement_1.deactivateUser; } });
Object.defineProperty(exports, "importUsersBatch", { enumerable: true, get: function () { return userManagement_1.importUsersBatch; } });
// Device Binding
var deviceBinding_1 = require("./deviceBinding");
Object.defineProperty(exports, "releaseDevice", { enumerable: true, get: function () { return deviceBinding_1.releaseDevice; } });
Object.defineProperty(exports, "releaseDeviceBinding", { enumerable: true, get: function () { return deviceBinding_1.releaseDevice; } });
Object.defineProperty(exports, "replaceDevice", { enumerable: true, get: function () { return deviceBinding_1.replaceDevice; } });
Object.defineProperty(exports, "rejectDeviceReplacement", { enumerable: true, get: function () { return deviceBinding_1.rejectDeviceReplacement; } });
Object.defineProperty(exports, "forceLogoutUser", { enumerable: true, get: function () { return deviceBinding_1.forceLogoutUser; } });
// Branch & Region Management
var branchRegionManagement_1 = require("./branchRegionManagement");
Object.defineProperty(exports, "createBranch", { enumerable: true, get: function () { return branchRegionManagement_1.createBranch; } });
Object.defineProperty(exports, "updateBranch", { enumerable: true, get: function () { return branchRegionManagement_1.updateBranch; } });
Object.defineProperty(exports, "deleteBranch", { enumerable: true, get: function () { return branchRegionManagement_1.deleteBranch; } });
Object.defineProperty(exports, "createRegion", { enumerable: true, get: function () { return branchRegionManagement_1.createRegion; } });
Object.defineProperty(exports, "updateRegion", { enumerable: true, get: function () { return branchRegionManagement_1.updateRegion; } });
Object.defineProperty(exports, "deleteRegion", { enumerable: true, get: function () { return branchRegionManagement_1.deleteRegion; } });
Object.defineProperty(exports, "importBranchesAndRegions", { enumerable: true, get: function () { return branchRegionManagement_1.importBranchesAndRegions; } });
// Request Management
var requestManagement_1 = require("./requestManagement");
Object.defineProperty(exports, "createRequest", { enumerable: true, get: function () { return requestManagement_1.createRequest; } });
Object.defineProperty(exports, "updateDraftRequest", { enumerable: true, get: function () { return requestManagement_1.updateDraftRequest; } });
Object.defineProperty(exports, "publishRequest", { enumerable: true, get: function () { return requestManagement_1.publishRequest; } });
Object.defineProperty(exports, "closeRequest", { enumerable: true, get: function () { return requestManagement_1.closeRequest; } });
Object.defineProperty(exports, "archiveRequest", { enumerable: true, get: function () { return requestManagement_1.archiveRequest; } });
Object.defineProperty(exports, "reopenRequest", { enumerable: true, get: function () { return requestManagement_1.reopenRequest; } });
Object.defineProperty(exports, "cloneRequest", { enumerable: true, get: function () { return requestManagement_1.cloneRequest; } });
Object.defineProperty(exports, "deleteRequest", { enumerable: true, get: function () { return requestManagement_1.deleteRequest; } });
// Form Management
var formManagement_1 = require("./formManagement");
Object.defineProperty(exports, "saveRequestFields", { enumerable: true, get: function () { return formManagement_1.saveRequestFields; } });
// Assignment Management
var assignmentManagement_1 = require("./assignmentManagement");
Object.defineProperty(exports, "reassignRecords", { enumerable: true, get: function () { return assignmentManagement_1.reassignRecords; } });
// Import Wizard
var importWizard_1 = require("./importWizard");
Object.defineProperty(exports, "importDataPreview", { enumerable: true, get: function () { return importWizard_1.importDataPreview; } });
Object.defineProperty(exports, "commitImport", { enumerable: true, get: function () { return importWizard_1.commitImport; } });
// External Integration Adapter
var externalIntegrationAdapter_1 = require("./externalIntegrationAdapter");
Object.defineProperty(exports, "exportDataToExternalSystem", { enumerable: true, get: function () { return externalIntegrationAdapter_1.exportDataToExternalSystem; } });
// Notification Service
var notificationService_1 = require("./notificationService");
Object.defineProperty(exports, "sendBroadcastNotification", { enumerable: true, get: function () { return notificationService_1.sendBroadcastNotification; } });
// Report Export
var reportExport_1 = require("./reportExport");
Object.defineProperty(exports, "exportReport", { enumerable: true, get: function () { return reportExport_1.exportReport; } });
// Response submission
var responseManagement_1 = require("./responseManagement");
Object.defineProperty(exports, "submitResponse", { enumerable: true, get: function () { return responseManagement_1.submitResponse; } });
Object.defineProperty(exports, "saveDraftResponse", { enumerable: true, get: function () { return responseManagement_1.saveDraftResponse; } });
// System Maintenance
var systemMaintenance_1 = require("./systemMaintenance");
Object.defineProperty(exports, "wipeDemoData", { enumerable: true, get: function () { return systemMaintenance_1.wipeDemoData; } });
// Monitoring
var monitoring_1 = require("./monitoring");
Object.defineProperty(exports, "getSystemHealth", { enumerable: true, get: function () { return monitoring_1.getSystemHealth; } });
//# sourceMappingURL=index.js.map