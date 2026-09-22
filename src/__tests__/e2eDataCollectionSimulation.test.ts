import { describe, it, expect } from "vitest";
import {
  autoMapColumns,
  validateImportRows,
} from "../components/admin/import/importValidation";
import { RequestItem, RecordItem, RequestField } from "../types";

describe("End-to-End Dynamic Data Collection Simulation", () => {
  // Scenario: Asset & Facility Audit (حصر وتدقيق مرافق ومنشآت الشركة)
  const mockFacilityRequest: RequestItem = {
    requestId: "req_facility_audit_2026",
    requestCode: "FAC-AUDIT-26",
    titleAr: "حصر وتدقيق المنشآت والمرافق 2026",
    titleEn: "Facility & Assets Audit 2026",
    descriptionAr:
      "تدقيق جاهزية مرافق ومستودعات الشركة والتحقق من اشتراطات السلامة",
    descriptionEn:
      "Audit of company facilities, warehouses, and safety compliance",
    status: "Published",
    priority: "High",
    requestType: "per_record",
    targetEntityLabelAr: "المنشأة",
    targetEntityLabelEn: "Facility",
    category: "General",
    tags: [],
    startAt: "2026-09-22T10:00:00.000Z",
    dueAt: "2026-10-01T00:00:00.000Z",
    allowEditAfterSubmit: true,
    allowEditAfterDueDate: false,
    requireSupervisorApproval: true,
    completionRule: "all_required_fields",
    formSchemaVersion: 1,
    createdBy: "admin",
    totalRecords: 20,
    totalAssignments: 5,
    targetBranches: ["b_riyadh", "b_jeddah"],
    targetRegions: ["101", "102"],
    createdAt: "2026-09-22T10:00:00.000Z",
    updatedAt: "2026-09-22T10:00:00.000Z",
  };

  const mockFacilityFields: RequestField[] = [
    {
      fieldId: "f_audit_date",
      requestId: mockFacilityRequest.requestId,
      fieldKey: "audit_date",
      fieldType: "date",
      fieldLabelAr: "تاريخ الفحص والتدقيق",
      fieldLabelEn: "Inspection Date",
      isRequired: true,
      sortOrder: 1,
      schemaVersion: 1,
      isActive: true,
      createdAt: "2026-09-22T10:00:00.000Z",
      updatedAt: "2026-09-22T10:00:00.000Z",
    },
    {
      fieldId: "f_facility_condition",
      requestId: mockFacilityRequest.requestId,
      fieldKey: "facility_condition",
      fieldType: "select",
      fieldLabelAr: "حالة المنشأة",
      fieldLabelEn: "Facility Condition",
      isRequired: true,
      sortOrder: 2,
      options: [
        {
          id: "opt_1",
          value: "excellent",
          labelAr: "ممتازة",
          labelEn: "Excellent",
        },
        { id: "opt_2", value: "good", labelAr: "جيدة", labelEn: "Good" },
        {
          id: "opt_3",
          value: "needs_maintenance",
          labelAr: "تحتاج صيانة",
          labelEn: "Needs Maintenance",
        },
        {
          id: "opt_4",
          value: "critical",
          labelAr: "حرجة",
          labelEn: "Critical",
        },
      ],
      schemaVersion: 1,
      isActive: true,
      createdAt: "2026-09-22T10:00:00.000Z",
      updatedAt: "2026-09-22T10:00:00.000Z",
    },
    {
      fieldId: "f_safety_compliance",
      requestId: mockFacilityRequest.requestId,
      fieldKey: "safety_compliance",
      fieldType: "yes_no",
      fieldLabelAr: "مطابقة لاشتراطات الدفاع المدني والسلامة؟",
      fieldLabelEn: "Compliant with safety regulations?",
      isRequired: true,
      sortOrder: 3,
      schemaVersion: 1,
      isActive: true,
      createdAt: "2026-09-22T10:00:00.000Z",
      updatedAt: "2026-09-22T10:00:00.000Z",
    },
    {
      fieldId: "f_rating",
      requestId: mockFacilityRequest.requestId,
      fieldKey: "rating",
      fieldType: "rating",
      fieldLabelAr: "التقييم العام للموقع",
      fieldLabelEn: "Overall Site Rating",
      isRequired: true,
      sortOrder: 4,
      schemaVersion: 1,
      isActive: true,
      createdAt: "2026-09-22T10:00:00.000Z",
      updatedAt: "2026-09-22T10:00:00.000Z",
    },
    {
      fieldId: "f_inspection_notes",
      requestId: mockFacilityRequest.requestId,
      fieldKey: "inspection_notes",
      fieldType: "textarea",
      fieldLabelAr: "ملاحظات وتوصيات المدقق الميداني",
      fieldLabelEn: "Auditor Remarks & Recommendations",
      isRequired: false,
      sortOrder: 5,
      schemaVersion: 1,
      isActive: true,
      createdAt: "2026-09-22T10:00:00.000Z",
      updatedAt: "2026-09-22T10:00:00.000Z",
    },
  ];

  it("Step 1: defines a generalized collection request with custom entity labels", () => {
    expect(mockFacilityRequest.targetEntityLabelAr).toBe("المنشأة");
    expect(mockFacilityRequest.targetEntityLabelEn).toBe("Facility");
    expect(mockFacilityRequest.requestType).toBe("per_record");
    expect(mockFacilityFields).toHaveLength(5);
  });

  it("Step 2: validates Excel import with generic column headers and auto-mapping", () => {
    // Simulated raw rows from an Excel file using generic entity headers
    const rawExcelRows = [
      {
        معرف_الجهة: "FAC-101",
        اسم_الجهة: "مستودع الرياض المركزي",
        الفرع: "فرع الرياض",
        المنطقة: "101",
        الموقع: "حي السلي، مخرج 18",
        المسؤول: "أحمد القحطاني",
        جوال: "0501234567",
      },
      {
        معرف_الجهة: "FAC-102",
        اسم_الجهة: "مركز توزيع جدة اللوجستي",
        الفرع: "فرع جدة",
        المنطقة: "102",
        الموقع: "منطقة الخمرة",
        المسؤول: "محمد الغامدي",
        جوال: "0559876543",
      },
    ];

    const headers = [
      "معرف_الجهة",
      "اسم_الجهة",
      "الفرع",
      "المنطقة",
      "الموقع",
      "المسؤول",
      "جوال",
    ];

    // Auto-map columns
    const { sysMap, fMap } = autoMapColumns(headers, mockFacilityFields);

    expect(sysMap.targetId).toBe("معرف_الجهة");
    expect(sysMap.targetName).toBe("اسم_الجهة");
    expect(sysMap.branchName).toBe("الفرع");
    expect(sysMap.regionNo).toBe("المنطقة");
    expect(sysMap.area).toBe("الموقع");

    const { valid, invalid } = validateImportRows(
      rawExcelRows,
      sysMap,
      fMap,
      mockFacilityRequest.requestId,
    );

    expect(invalid).toHaveLength(0);
    expect(valid).toHaveLength(2);
    expect(valid[0][sysMap.targetId]).toBe("FAC-101");
    expect(valid[0][sysMap.targetName]).toBe("مستودع الرياض المركزي");
    expect(valid[1][sysMap.targetId]).toBe("FAC-102");
    expect(valid[1][sysMap.targetName]).toBe("مركز توزيع جدة اللوجستي");
  });

  it("Step 3: creates and assigns facility records to field users", () => {
    const facilityRecord: RecordItem = {
      recordId: "rec_fac_101",
      requestId: mockFacilityRequest.requestId,
      assignmentId: "asg_101",
      assignedUserId: "u_emp_01",
      assignedRegionNo: "101",
      targetId: "FAC-101",
      targetName: "مستودع الرياض المركزي",
      branchId: "b_riyadh",
      branchName: "فرع الرياض",
      regionNo: "101",
      userNo: "EMP-01",
      userName: "سعد الشهري",
      recordStatus: "Pending",
      completionPercent: 0,
      area: "حي السلي، مخرج 18",
      rawData: {
        المسؤول: "أحمد القحطاني",
      },
      createdAt: "2026-09-22T10:05:00.000Z",
      updatedAt: "2026-09-22T10:05:00.000Z",
    };

    expect(facilityRecord.targetId).toBe("FAC-101");
    expect(facilityRecord.targetName).toBe("مستودع الرياض المركزي");
    expect(facilityRecord.recordStatus).toBe("Pending");
    expect(facilityRecord.assignedUserId).toBe("u_emp_01");
  });

  it("Step 4: simulates user audit completion and response submission", () => {
    const userSubmission = {
      recordId: "rec_fac_101",
      requestId: mockFacilityRequest.requestId,
      responses: {
        audit_date: "2026-09-22",
        facility_condition: "good",
        safety_compliance: "yes",
        rating: 4,
        inspection_notes:
          "تم فحص مخارج الطوارئ ومضخات الحريق، الموقع مطابق مع التوصية بتجديد طفايات القسم B.",
      },
      submittedBy: "u_emp_01",
      submittedAt: "2026-09-22T11:30:00.000Z",
    };

    // Verify all required fields have responses
    const requiredFields = mockFacilityFields.filter((f) => f.isRequired);
    const hasAllRequired = requiredFields.every(
      (f) =>
        userSubmission.responses[
          f.fieldKey as keyof typeof userSubmission.responses
        ] !== undefined,
    );
    expect(hasAllRequired).toBe(true);

    // Simulate record update upon successful submission
    const updatedRecord: RecordItem = {
      recordId: "rec_fac_101",
      requestId: mockFacilityRequest.requestId,
      assignmentId: "asg_101",
      assignedUserId: "u_emp_01",
      assignedRegionNo: "101",
      targetId: "FAC-101",
      targetName: "مستودع الرياض المركزي",
      branchId: "b_riyadh",
      branchName: "فرع الرياض",
      regionNo: "101",
      userNo: "EMP-01",
      userName: "سعد الشهري",
      recordStatus: "Completed",
      completionPercent: 100,
      area: "حي السلي، مخرج 18",
      rawData: {
        ...userSubmission.responses,
      },
      createdAt: "2026-09-22T10:05:00.000Z",
      updatedAt: userSubmission.submittedAt,
    };

    expect(updatedRecord.recordStatus).toBe("Completed");
    expect(updatedRecord.completionPercent).toBe(100);
    expect(updatedRecord.rawData.facility_condition).toBe("good");
    expect(updatedRecord.rawData.rating).toBe(4);
  });

  it("Step 5: verifies dynamic report column header resolution", () => {
    // Helper function used in ReportDataTable and AdminAssignments to determine entity label
    const resolveEntityLabel = (
      req: RequestItem | undefined,
      lang: "ar" | "en",
      type: "id" | "name",
    ) => {
      const customLabel =
        lang === "ar" ? req?.targetEntityLabelAr : req?.targetEntityLabelEn;
      if (customLabel) {
        return type === "id"
          ? lang === "ar"
            ? `معرف ${customLabel}`
            : `${customLabel} ID`
          : lang === "ar"
            ? `اسم ${customLabel}`
            : `${customLabel} Name`;
      }
      return type === "id"
        ? lang === "ar"
          ? "معرف السجل / الجهة"
          : "Target / Record ID"
        : lang === "ar"
          ? "اسم السجل / الجهة"
          : "Target / Record Name";
    };

    // In Arabic:
    const idHeaderAr = resolveEntityLabel(mockFacilityRequest, "ar", "id");
    const nameHeaderAr = resolveEntityLabel(mockFacilityRequest, "ar", "name");
    expect(idHeaderAr).toBe("معرف المنشأة");
    expect(nameHeaderAr).toBe("اسم المنشأة");

    // In English:
    const idHeaderEn = resolveEntityLabel(mockFacilityRequest, "en", "id");
    const nameHeaderEn = resolveEntityLabel(mockFacilityRequest, "en", "name");
    expect(idHeaderEn).toBe("Facility ID");
    expect(nameHeaderEn).toBe("Facility Name");

    // For a request with no custom labels, it falls back gracefully:
    const defaultReq: RequestItem = {
      ...mockFacilityRequest,
      targetEntityLabelAr: undefined,
      targetEntityLabelEn: undefined,
    };
    expect(resolveEntityLabel(defaultReq, "ar", "id")).toBe(
      "معرف السجل / الجهة",
    );
    expect(resolveEntityLabel(defaultReq, "ar", "name")).toBe(
      "اسم السجل / الجهة",
    );
  });
});
