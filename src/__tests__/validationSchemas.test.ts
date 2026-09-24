import { describe, it, expect } from "vitest";
import {
  CreateUserSchema,
  BranchSchema,
  RegionSchema,
  SurveyRequestSchema,
  SubmitResponsePayloadSchema,
} from "../schemas/validationSchemas";

describe("Validation Schemas (Zod)", () => {
  describe("CreateUserSchema", () => {
    it("validates valid user creation input", () => {
      const valid = {
        userNameAr: "سالم الميداني",
        userNameEn: "Salem",
        userNo: "REP-101",
        role: "REP",
        branchId: "b-1",
        regionNo: "101",
        allowedRegionNos: ["101", "102"],
        mobile: "0512345678",
      };

      const result = CreateUserSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid mobile or short Arabic name", () => {
      const invalid = {
        userNameAr: "س",
        userNo: "R",
        role: "UNKNOWN_ROLE",
        branchId: "",
        regionNo: "",
        mobile: "012345",
      };

      const result = CreateUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.userNameAr).toBeDefined();
        expect(errors.role).toBeDefined();
        expect(errors.mobile).toBeDefined();
      }
    });
  });

  describe("BranchSchema & RegionSchema", () => {
    it("validates branch input correctly", () => {
      const validBranch = {
        branchCode: "RYD",
        branchNameAr: "فرع الرياض",
        branchNameEn: "Riyadh Branch",
        isActive: true,
      };

      expect(BranchSchema.safeParse(validBranch).success).toBe(true);
      expect(
        BranchSchema.safeParse({ branchCode: "R", branchNameAr: "" }).success,
      ).toBe(false);
    });

    it("validates region input correctly", () => {
      const validRegion = {
        regionNo: "101",
        regionNameAr: "شمال الرياض",
        branchId: "b-1",
      };

      const parsed = RegionSchema.safeParse(validRegion);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.isActive).toBe(true);
      }
    });
  });

  describe("SurveyRequestSchema", () => {
    it("validates campaign creation input", () => {
      const validRequest = {
        titleAr: "حملة مسح الأسواق",
        targetBranches: ["b-1"],
        targetRegions: ["101"],
        dueAt: new Date().toISOString(),
      };

      expect(SurveyRequestSchema.safeParse(validRequest).success).toBe(true);

      const invalidRequest = {
        titleAr: "ح",
        targetBranches: [],
        targetRegions: [],
        dueAt: "not-a-date",
      };
      expect(SurveyRequestSchema.safeParse(invalidRequest).success).toBe(false);
    });
  });

  describe("SubmitResponsePayloadSchema", () => {
    it("validates survey submission payload and coordinates", () => {
      const validPayload = {
        requestId: "req-1",
        recordId: "rec-1",
        branchId: "b-1",
        regionNo: "101",
        answers: [
          { fieldId: "f-1", value: "محل السلام" },
          { fieldId: "f-2", value: 450 },
          { fieldId: "f-3", value: true },
        ],
        location: {
          latitude: 24.7136,
          longitude: 46.6753,
          accuracy: 5,
        },
      };

      expect(SubmitResponsePayloadSchema.safeParse(validPayload).success).toBe(
        true,
      );

      const invalidCoords = {
        ...validPayload,
        location: {
          latitude: 95, // invalid latitude > 90
          longitude: 46.6753,
        },
      };
      expect(SubmitResponsePayloadSchema.safeParse(invalidCoords).success).toBe(
        false,
      );
    });
  });
});
