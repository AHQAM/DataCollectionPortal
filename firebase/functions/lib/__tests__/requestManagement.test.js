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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const testEnv = (0, firebase_functions_test_1.default)();
// Mock firebase-admin completely
jest.mock("firebase-admin", () => {
    const firestoreMock = {
        collection: jest.fn(),
    };
    return {
        firestore: jest.fn(() => firestoreMock),
    };
});
const requestManagement_1 = require("../requestManagement");
describe("Request Management - publishRequest", () => {
    let dbMock;
    let wrappedPublishRequest;
    beforeEach(() => {
        jest.clearAllMocks();
        dbMock = admin.firestore();
        wrappedPublishRequest = testEnv.wrap(requestManagement_1.publishRequest);
    });
    afterAll(() => {
        testEnv.cleanup();
    });
    it("should snapshot schema if it does not exist", async () => {
        const requestId = "REQ-123";
        // Setup mocks
        const requestDocMock = {
            exists: true,
            data: () => ({ formSchemaVersion: 1 }),
        };
        const requestRefMock = {
            get: jest.fn().mockResolvedValue(requestDocMock),
            update: jest.fn().mockResolvedValue(true),
        };
        const fieldDocMock1 = { data: () => ({ id: "field1", orderIndex: 1 }) };
        const fieldDocMock2 = { data: () => ({ id: "field2", orderIndex: 2 }) };
        const fieldsSnapshotMock = {
            docs: [fieldDocMock1, fieldDocMock2],
        };
        const requestFieldsQueryMock = {
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue(fieldsSnapshotMock),
        };
        dbMock.collection.mockImplementation((path) => {
            if (path === "requests") {
                return {
                    doc: jest.fn().mockReturnValue(requestRefMock),
                };
            }
            if (path === "request_fields") {
                return requestFieldsQueryMock;
            }
            return {};
        });
        // Mock callable context
        const context = {
            auth: {
                uid: "admin-uid",
                token: { role: "admin" },
            },
        };
        // Execute
        const data = { requestId };
        await wrappedPublishRequest(data, context);
        // Assertions
        expect(requestRefMock.update).toHaveBeenCalledWith(expect.objectContaining({
            status: "Published",
            publishedBy: "admin-uid",
            formSchemaVersion: 2,
            schemaSnapshot: [
                { id: "field1", orderIndex: 1 },
                { id: "field2", orderIndex: 2 },
            ],
        }));
    });
    it("should NOT snapshot schema if it already exists", async () => {
        const requestId = "REQ-456";
        // Setup mocks: this time schemaSnapshot exists
        const requestDocMock = {
            exists: true,
            data: () => ({
                formSchemaVersion: 1,
                schemaSnapshot: [{ id: "existing_field" }]
            }),
        };
        const requestRefMock = {
            get: jest.fn().mockResolvedValue(requestDocMock),
            update: jest.fn().mockResolvedValue(true),
        };
        const requestFieldsQueryMock = {
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            get: jest.fn(),
        };
        dbMock.collection.mockImplementation((path) => {
            if (path === "requests") {
                return {
                    doc: jest.fn().mockReturnValue(requestRefMock),
                };
            }
            if (path === "request_fields") {
                return requestFieldsQueryMock;
            }
            return {};
        });
        const context = {
            auth: { uid: "admin-uid", token: { role: "admin" } },
        };
        const data = { requestId };
        await wrappedPublishRequest(data, context);
        // Assertions
        // query should not be called
        expect(requestFieldsQueryMock.get).not.toHaveBeenCalled();
        // schemaSnapshot should not be in updates
        expect(requestRefMock.update).toHaveBeenCalledWith(expect.objectContaining({
            status: "Published",
        }));
        // Verify it doesn't overwrite schemaSnapshot
        const updateCallArg = requestRefMock.update.mock.calls[0][0];
        expect(updateCallArg.schemaSnapshot).toBeUndefined();
        expect(updateCallArg.formSchemaVersion).toBeUndefined();
    });
});
//# sourceMappingURL=requestManagement.test.js.map