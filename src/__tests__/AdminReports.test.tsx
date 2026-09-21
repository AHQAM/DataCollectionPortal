import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReportFilters } from "../components/admin/reports/ReportFilters";
import { ReportAnalysisCharts } from "../components/admin/reports/ReportAnalysisCharts";

describe("AdminReports Components", () => {
  it("renders ReportFilters correctly", () => {
    const mockRequests = [
      {
        requestId: "req1",
        requestCode: "RQ-001",
        titleEn: "Test Request",
        titleAr: "طلب تجريبي",
      } as any,
    ];
    const mockBranches = [
      {
        branchId: "br1",
        branchNameEn: "Branch A",
        branchNameAr: "الفرع الأول",
      } as any,
    ];

    render(
      <ReportFilters
        lang="en"
        requests={mockRequests}
        branches={mockBranches}
        selectedReqId="req1"
        setSelectedReqId={vi.fn()}
        selectedBranchId="ALL"
        setSelectedBranchId={vi.fn()}
        selectedStatus="ALL"
        setSelectedStatus={vi.fn()}
        searchQuery=""
        setSearchQuery={vi.fn()}
        setSelectedAnalysisFieldKey={vi.fn()}
      />,
    );

    // Verify it renders the form elements
    expect(screen.getByText("Request Campaign")).toBeTruthy();
    expect(screen.getByText("Branch")).toBeTruthy();
    expect(screen.getByText("Record Status")).toBeTruthy();
  });

  it("renders ReportAnalysisCharts correctly and computes percentages", () => {
    const mockChoiceFields = [
      {
        fieldKey: "q1",
        fieldLabelEn: "Question 1",
        fieldType: "select",
      } as any,
    ];
    const mockCounts = { "Option A": 10, "Option B": 40 };

    render(
      <ReportAnalysisCharts
        lang="en"
        totalCount={100}
        submittedCount={30}
        completedCount={20}
        draftCount={50}
        pendingCount={0}
        responsesReceivedCount={50}
        completionRate={50}
        choiceFields={mockChoiceFields}
        activeAnalysisField={mockChoiceFields[0]}
        selectedAnalysisFieldKey="q1"
        setSelectedAnalysisFieldKey={vi.fn()}
        dynamicFieldCounts={mockCounts}
      />,
    );

    // Verify KPIs
    expect(screen.getByText("Total Records")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("Completion Rate")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy(); // 50% completion rate

    // Verify dynamic distributions
    expect(
      screen.getByText("Field Responses Distribution Analysis"),
    ).toBeTruthy();
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("20%")).toBeTruthy(); // 10 / 50 * 100 = 20%
    expect(screen.getByText("Option B")).toBeTruthy();
    expect(screen.getByText("80%")).toBeTruthy(); // 40 / 50 * 100 = 80%
  });
});
