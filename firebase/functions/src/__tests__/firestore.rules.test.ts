import fs from "node:fs";
import path from "node:path";
import {
  RulesTestEnvironment,
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc } from "firebase/firestore";

describe("Firestore access rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "data-collection-portal-rules-test",
      firestore: {
        rules: fs.readFileSync(
          path.resolve(__dirname, "../../../firestore.rules"),
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
      await setDoc(doc(context.firestore(), "requests/REQ-1"), {
        requestId: "REQ-1",
        status: "Published",
        assignedUserId: "rep-1",
      });
    });

    const rep = testEnv.authenticatedContext("rep-1", {
      role: "REP",
      allowedRegionNos: ["101"],
    });
    const otherRep = testEnv.authenticatedContext("rep-2", {
      role: "REP",
      allowedRegionNos: ["101"],
    });

    await assertSucceeds(getDoc(doc(rep.firestore(), "requests/REQ-1")));
    await assertFails(getDoc(doc(otherRep.firestore(), "requests/REQ-1")));
  });

  it("rejects direct workflow writes by administrators", async () => {
    const admin = testEnv.authenticatedContext("admin-1", { role: "ADMIN" });
    await assertFails(
      setDoc(doc(admin.firestore(), "requests/REQ-2"), {
        requestId: "REQ-2",
        status: "Draft",
      }),
    );
  });
});
