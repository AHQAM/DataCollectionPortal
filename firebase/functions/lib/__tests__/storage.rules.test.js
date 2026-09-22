"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const rules_unit_testing_1 = require("@firebase/rules-unit-testing");
const storage_1 = require("firebase/storage");
const describeIfStorageRules = process.env.FIREBASE_STORAGE_RULES_TEST === "1" ? describe : describe.skip;
describeIfStorageRules("Storage access rules", () => {
    let testEnv;
    beforeAll(async () => {
        testEnv = await (0, rules_unit_testing_1.initializeTestEnvironment)({
            projectId: "data-collection-portal-storage-test",
            storage: {
                rules: node_fs_1.default.readFileSync(node_path_1.default.resolve(__dirname, "../../../storage.rules"), "utf8"),
            },
        });
    });
    afterAll(async () => {
        await testEnv.cleanup();
    });
    it("allows a representative to upload to their own upload path", async () => {
        const rep = testEnv.authenticatedContext("rep-1", { role: "REP" });
        const storage = rep.storage();
        await (0, rules_unit_testing_1.assertSucceeds)((0, storage_1.uploadBytes)((0, storage_1.ref)(storage, "uploads/REQ-1/REC-1/rep-1/report.csv"), new Blob(["id,name\n1,Test"], { type: "text/csv" })));
    });
    it("blocks uploads outside the owner's path and rejects invalid file types", async () => {
        const rep = testEnv.authenticatedContext("rep-1", { role: "REP" });
        const otherRep = testEnv.authenticatedContext("rep-2", { role: "REP" });
        await (0, rules_unit_testing_1.assertFails)((0, storage_1.uploadBytes)((0, storage_1.ref)(otherRep.storage(), "uploads/REQ-1/REC-1/rep-1/report.csv"), new Blob(["id,name\n1,Test"], { type: "text/csv" })));
        await (0, rules_unit_testing_1.assertFails)((0, storage_1.uploadBytes)((0, storage_1.ref)(rep.storage(), "uploads/REQ-1/REC-1/rep-1/report.json"), new Blob(["{}"], { type: "application/json" })));
    });
    it("allows admins to import files and blocks direct deletes or updates", async () => {
        const admin = testEnv.authenticatedContext("admin-1", { role: "ADMIN" });
        const rep = testEnv.authenticatedContext("rep-1", { role: "REP" });
        await (0, rules_unit_testing_1.assertSucceeds)((0, storage_1.uploadBytes)((0, storage_1.ref)(admin.storage(), "imports/REQ-1/IMP-1/users.csv"), new Blob(["name\nAlice"], { type: "text/csv" })));
        await (0, rules_unit_testing_1.assertFails)((0, storage_1.uploadBytes)((0, storage_1.ref)(rep.storage(), "imports/REQ-1/IMP-2/users.csv"), new Blob(["name\nAlice"], { type: "text/csv" })));
        const importRef = (0, storage_1.ref)(admin.storage(), "imports/REQ-1/IMP-1/users.csv");
        await (0, rules_unit_testing_1.assertFails)((0, storage_1.deleteObject)(importRef));
    });
});
//# sourceMappingURL=storage.rules.test.js.map