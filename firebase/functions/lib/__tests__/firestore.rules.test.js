"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const rules_unit_testing_1 = require("@firebase/rules-unit-testing");
const firestore_1 = require("firebase/firestore");
describe("Firestore access rules", () => {
  let testEnv;
  beforeAll(async () => {
    testEnv = await (0, rules_unit_testing_1.initializeTestEnvironment)({
      projectId: "data-collection-portal-rules-test",
      firestore: {
        rules: node_fs_1.default.readFileSync(
          node_path_1.default.resolve(__dirname, "../../../firestore.rules"),
          "utf8",
        ),
      },
    });
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });
  afterEach(async () => {
    await testEnv.clearFirestore();
  });
  it("allows a representative to read only an assigned request", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await (0, firestore_1.setDoc)(
        (0, firestore_1.doc)(context.firestore(), "requests/REQ-1"),
        {
          requestId: "REQ-1",
          status: "Published",
          assignedUserId: "rep-1",
        },
      );
    });
    const rep = testEnv.authenticatedContext("rep-1", {
      role: "REP",
      allowedRegionNos: ["101"],
    });
    const otherRep = testEnv.authenticatedContext("rep-2", {
      role: "REP",
      allowedRegionNos: ["101"],
    });
    await (0, rules_unit_testing_1.assertSucceeds)(
      (0, firestore_1.getDoc)(
        (0, firestore_1.doc)(rep.firestore(), "requests/REQ-1"),
      ),
    );
    await (0, rules_unit_testing_1.assertFails)(
      (0, firestore_1.getDoc)(
        (0, firestore_1.doc)(otherRep.firestore(), "requests/REQ-1"),
      ),
    );
  });
  it("rejects direct workflow writes by administrators", async () => {
    const admin = testEnv.authenticatedContext("admin-1", { role: "ADMIN" });
    await (0, rules_unit_testing_1.assertFails)(
      (0, firestore_1.setDoc)(
        (0, firestore_1.doc)(admin.firestore(), "requests/REQ-2"),
        {
          requestId: "REQ-2",
          status: "Draft",
        },
      ),
    );
  });
});
//# sourceMappingURL=firestore.rules.test.js.map
