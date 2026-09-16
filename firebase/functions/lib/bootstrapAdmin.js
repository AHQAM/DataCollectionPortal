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
exports.bootstrapAdmin = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("./auth");
exports.bootstrapAdmin = functions.https.onRequest(async (req, res) => {
    const db = (0, firestore_1.getFirestore)('datacollectionportal');
    try {
        const userId = "ADMIN-0001";
        const username = "admin@landsurvey.com";
        const passwordHash = await (0, auth_1.hashPassword)("admin123");
        // 1. Create or update user in Firestore
        const newUser = {
            userId,
            username,
            regionNo: "000",
            allowedRegionNos: ["000"],
            repNo: "ADMIN-0001",
            repNameAr: "مدير النظام",
            repNameEn: "System Admin",
            email: username,
            mobile: null,
            branchId: "MAIN-BRANCH",
            role: "ADMIN",
            passwordHash,
            mustChangePassword: true,
            isActive: true,
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: null,
            passwordChangedAt: null,
            sessionVersion: 1,
            deviceBindingStatus: "UNBOUND",
            boundDeviceIdHash: null,
            boundDevicePlatform: null,
            boundDeviceLabel: null,
            maxAllowedDevices: 5,
            fcmToken: null,
            fcmTokenUpdatedAt: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            deletedAt: null,
            deletedBy: null,
        };
        await db.collection("users").doc(userId).set(newUser);
        // 2. Setup Firebase Auth and Custom Claims
        const customClaims = {
            role: "ADMIN",
            branchId: "MAIN-BRANCH",
            allowedRegionNos: ["000"],
            sessionVersion: 1,
            mustChangePassword: true,
        };
        try {
            await admin.auth().getUser(userId);
            await admin.auth().setCustomUserClaims(userId, customClaims);
        }
        catch (e) {
            if (e.code === "auth/user-not-found") {
                await admin.auth().createUser({
                    uid: userId,
                    email: username,
                    password: "admin123", // They can log in via signInWithEmailAndPassword too if needed
                    displayName: "System Admin",
                });
                await admin.auth().setCustomUserClaims(userId, customClaims);
            }
            else {
                throw e;
            }
        }
        res.status(200).send(`Admin user created/updated successfully with ID: ${userId}`);
    }
    catch (error) {
        console.error(error);
        res.status(500).send(`Error: ${error.message}`);
    }
});
//# sourceMappingURL=bootstrapAdmin.js.map