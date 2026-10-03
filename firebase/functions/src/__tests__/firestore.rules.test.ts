import fs from "node:fs";
import path from "node:path";
import {
  RulesTestEnvironment,
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

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

  it("allows a representative to read only requests targeted to an authorized region", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, "requests/REQ-1"), {
        requestId: "REQ-1",
        status: "Published",
        branchId: "branch-1",
        targetRegions: ["101"],
      });
      await setDoc(doc(firestore, "requests/REQ-2"), {
        requestId: "REQ-2",
        status: "Published",
        branchId: "branch-1",
        targetRegions: ["202"],
      });
      await setDoc(doc(firestore, "requests/REQ-ALL"), {
        requestId: "REQ-ALL",
        status: "Published",
        branchId: "branch-1",
        targetRegions: [],
      });
    });

    const rep = testEnv.authenticatedContext("rep-1", {
      role: "REP",
      branchId: "branch-1",
      allowedRegionNos: ["101"],
    });
    const otherRep = testEnv.authenticatedContext("rep-2", {
      role: "REP",
      branchId: "branch-2",
      allowedRegionNos: ["202"],
    });
    const repFirestore = rep.firestore();
    const otherRepFirestore = otherRep.firestore();

    const repTargetedRequests = query(
      collection(repFirestore, "requests"),
      where("targetRegions", "array-contains-any", ["101"]),
      where("status", "in", ["Published", "Closed", "Archived"]),
    );
    const targetedSnapshot = await assertSucceeds(getDocs(repTargetedRequests));
    expect(targetedSnapshot.docs.map((request) => request.id)).toEqual([
      "REQ-1",
    ]);
    const repGlobalRequests = query(
      collection(repFirestore, "requests"),
      where("targetRegions", "==", []),
      where("status", "in", ["Published", "Closed", "Archived"]),
    );
    const globalSnapshot = await assertSucceeds(getDocs(repGlobalRequests));
    expect(globalSnapshot.docs.map((request) => request.id)).toEqual([
      "REQ-ALL",
    ]);
    await assertSucceeds(getDoc(doc(repFirestore, "requests/REQ-1")));
    await assertFails(getDoc(doc(otherRepFirestore, "requests/REQ-1")));
  });

  it("allows supervisors to query requests in their branch scope only", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, "requests/REQ-BRANCH-1"), {
        requestId: "REQ-BRANCH-1",
        status: "Draft",
        branchId: "branch-1",
        targetBranches: ["branch-1"],
      });
      await setDoc(doc(firestore, "requests/REQ-TARGET-BRANCH-1"), {
        requestId: "REQ-TARGET-BRANCH-1",
        status: "Published",
        branchId: "branch-2",
        targetBranches: ["branch-1"],
      });
      await setDoc(doc(firestore, "requests/REQ-BRANCH-2"), {
        requestId: "REQ-BRANCH-2",
        status: "Published",
        branchId: "branch-2",
        targetBranches: ["branch-2"],
      });
    });

    const sameBranchSupervisor = testEnv.authenticatedContext("supervisor-1", {
      role: "SUPERVISOR",
      branchId: "branch-1",
    });
    const otherBranchSupervisor = testEnv.authenticatedContext("supervisor-2", {
      role: "SUPERVISOR",
      branchId: "branch-2",
    });
    const supervisorFirestore = sameBranchSupervisor.firestore();
    const otherSupervisorFirestore = otherBranchSupervisor.firestore();

    const branchRequests = query(
      collection(supervisorFirestore, "requests"),
      where("branchId", "==", "branch-1"),
    );
    const branchSnapshot = await assertSucceeds(getDocs(branchRequests));
    expect(branchSnapshot.docs.map((request) => request.id)).toEqual([
      "REQ-BRANCH-1",
    ]);
    const targetBranchRequests = query(
      collection(supervisorFirestore, "requests"),
      where("targetBranches", "array-contains", "branch-1"),
    );
    const targetBranchSnapshot = await assertSucceeds(
      getDocs(targetBranchRequests),
    );
    expect(targetBranchSnapshot.docs.map((request) => request.id)).toEqual([
      "REQ-BRANCH-1",
      "REQ-TARGET-BRANCH-1",
    ]);
    await assertFails(
      getDoc(doc(otherSupervisorFirestore, "requests/REQ-BRANCH-1")),
    );
  });

  it("allows administrators to read requests in every status", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "requests/REQ-DRAFT"), {
        requestId: "REQ-DRAFT",
        status: "Draft",
      });
    });

    const admin = testEnv.authenticatedContext("admin-1", { role: "ADMIN" });
    await assertSucceeds(getDoc(doc(admin.firestore(), "requests/REQ-DRAFT")));
  });

  it("allows supervisors to query responses from their branch only", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, "responses/REC-BRANCH-1"), {
        responseId: "REC-BRANCH-1",
        branchId: "branch-1",
        submittedBy: "rep-1",
      });
      await setDoc(doc(firestore, "responses/REC-BRANCH-2"), {
        responseId: "REC-BRANCH-2",
        branchId: "branch-2",
        submittedBy: "rep-2",
      });
    });

    const supervisorFirestore = testEnv
      .authenticatedContext("supervisor-1", {
        role: "SUPERVISOR",
        branchId: "branch-1",
      })
      .firestore();
    const branchResponses = query(
      collection(supervisorFirestore, "responses"),
      where("branchId", "==", "branch-1"),
    );
    const snapshot = await assertSucceeds(getDocs(branchResponses));
    expect(snapshot.docs.map((response) => response.id)).toEqual([
      "REC-BRANCH-1",
    ]);
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
