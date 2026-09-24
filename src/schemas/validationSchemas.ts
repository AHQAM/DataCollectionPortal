import { z } from "zod";

/**
 * Zod Schemas for Enterprise Runtime Data Validation
 */

export const UserRoleSchema = z.enum(["ADMIN", "SUPERVISOR", "REP"]);

export const CreateUserSchema = z.object({
  userNameAr: z.string().min(2, "Arabic name must be at least 2 characters"),
  userNameEn: z.string().optional().default(""),
  userNo: z.string().min(2, "User number or code is required"),
  role: UserRoleSchema,
  branchId: z.string().min(1, "Branch selection is required"),
  regionNo: z.string().min(1, "Primary region number is required"),
  allowedRegionNos: z.array(z.string()).default([]),
  mobile: z
    .string()
    .regex(/^05\d{8}$/, "Mobile must be in 05XXXXXXXX format")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export const BranchSchema = z.object({
  branchCode: z.string().min(2, "Branch code must be at least 2 characters"),
  branchNameAr: z.string().min(2, "Branch Arabic name is required"),
  branchNameEn: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export const RegionSchema = z.object({
  regionNo: z.string().min(1, "Region number is required"),
  regionNameAr: z.string().min(2, "Region Arabic name is required"),
  regionNameEn: z.string().optional().default(""),
  branchId: z.string().min(1, "Branch association is required"),
  isActive: z.boolean().default(true),
});

export const SurveyRequestSchema = z.object({
  titleAr: z.string().min(3, "Campaign Arabic title is required"),
  titleEn: z.string().optional().default(""),
  requestCode: z.string().optional(),
  targetBranches: z
    .array(z.string())
    .min(1, "At least one branch must be targeted"),
  targetRegions: z
    .array(z.string())
    .min(1, "At least one region must be targeted"),
  dueAt: z.string().datetime("Due date must be a valid ISO datetime string"),
  status: z.enum(["Draft", "Published", "Closed", "Archived"]).default("Draft"),
});

export const SubmissionAnswerSchema = z.object({
  fieldId: z.string().min(1),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.record(z.string(), z.unknown()),
  ]),
});

export const SubmitResponsePayloadSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  recordId: z.string().min(1, "Record ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  regionNo: z.string().min(1, "Region number is required"),
  answers: z.array(SubmissionAnswerSchema),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().optional(),
    })
    .optional(),
  isDraft: z.boolean().default(false),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type BranchInput = z.infer<typeof BranchSchema>;
export type RegionInput = z.infer<typeof RegionSchema>;
export type SurveyRequestInput = z.infer<typeof SurveyRequestSchema>;
export type SubmitResponsePayload = z.infer<typeof SubmitResponsePayloadSchema>;
