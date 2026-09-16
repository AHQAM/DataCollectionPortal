import fs from "node:fs";
import path from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes, deleteObject } from "firebase/storage";

const describeIfStorageRules = process.env.FIREBASE_STORAGE_RULES_TEST === "1" ? describe : describe.skip;

describeIfStorageRules("Storage access rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "data-collection-portal-storage-test",
      storage: {
        rules: fs.readFileSync(
          path.resolve(__dirname, "../../../storage.rules"),
          "utf8",
        ),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("allows a representative to upload to their own upload path", async () => {
    const rep = testEnv.authenticatedContext("rep-1", { role: "REP" });
    const storage = rep.storage();

    await assertSucceeds(
      uploadBytes(
        ref(storage, "uploads/REQ-1/REC-1/rep-1/report.csv"),
        new Blob(["id,name\n1,Test"], { type: "text/csv" }),
      ),
    );
  });

  it("blocks uploads outside the owner's path and rejects invalid file types", async () => {
    const rep = testEnv.authenticatedContext("rep-1", { role: "REP" });
    const otherRep = testEnv.authenticatedContext("rep-2", { role: "REP" });

    await assertFails(
      uploadBytes(
        ref(otherRep.storage(), "uploads/REQ-1/REC-1/rep-1/report.csv"),
        new Blob(["id,name\n1,Test"], { type: "text/csv" }),
      ),
    );

    await assertFails(
      uploadBytes(
        ref(rep.storage(), "uploads/REQ-1/REC-1/rep-1/report.json"),
        new Blob(["{}"], { type: "application/json" }),
      ),
    );
  });

  it("allows admins to import files and blocks direct deletes or updates", async () => {
    const admin = testEnv.authenticatedContext("admin-1", { role: "ADMIN" });
    const rep = testEnv.authenticatedContext("rep-1", { role: "REP" });

    await assertSucceeds(
      uploadBytes(
        ref(admin.storage(), "imports/REQ-1/IMP-1/users.csv"),
        new Blob(["name\nAlice"], { type: "text/csv" }),
      ),
    );

    await assertFails(
      uploadBytes(
        ref(rep.storage(), "imports/REQ-1/IMP-2/users.csv"),
        new Blob(["name\nAlice"], { type: "text/csv" }),
      ),
    );

    const importRef = ref(admin.storage(), "imports/REQ-1/IMP-1/users.csv");
    await assertFails(deleteObject(importRef));
  });
});
