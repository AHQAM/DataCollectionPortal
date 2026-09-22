"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const testEnv = (0, firebase_functions_test_1.default)();
jest.mock("../config/db", () => ({
    DATABASE_ID: "datacollectionportal",
    db: {
        collection: jest.fn(),
    },
}));
jest.mock("firebase-admin", () => ({
    apps: [{}],
    initializeApp: jest.fn(),
    firestore: jest.fn(),
}));
const db_1 = require("../config/db");
const requestManagement_1 = require("../requestManagement");
describe("Request Management - publishRequest", () => {
    let dbMock;
    let wrappedPublishRequest;
    beforeEach(() => {
        jest.clearAllMocks();
        dbMock = db_1.db;
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
            return {
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ docs: [] }),
                doc: jest
                    .fn()
                    .mockReturnValue({ set: jest.fn().mockResolvedValue(true) }),
            };
        });
        // Mock callable context
        const context = {
            auth: {
                uid: "admin-uid",
                token: { role: "ADMIN" },
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
                schemaSnapshot: [{ id: "existing_field" }],
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
            return {
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ docs: [] }),
                doc: jest
                    .fn()
                    .mockReturnValue({ set: jest.fn().mockResolvedValue(true) }),
            };
        });
        const context = {
            auth: { uid: "admin-uid", token: { role: "ADMIN" } },
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