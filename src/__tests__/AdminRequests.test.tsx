import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminRequests } from "../components/admin/AdminRequests";
import * as AppContext from "../context/AppContext";
import { RequestItem } from "../types";

const mockRequests: RequestItem[] = [
  {
    requestId: "req_1",
    requestCode: "REQ-001",
    titleAr: "طلب تجريبي 1",
    titleEn: "Test Request 1",
    descriptionAr: "",
    descriptionEn: "",
    requestType: "per_record",
    status: "Published",
    priority: "Normal",
    category: "General",
    tags: [],
    startAt: "2026-01-01",
    dueAt: "2026-12-31",
    allowEditAfterSubmit: false,
    allowEditAfterDueDate: false,
    requireSupervisorApproval: false,
    completionRule: "",
    formSchemaVersion: 1,
    createdBy: "admin_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    totalRecords: 10,
    totalAssignments: 2,
  },
  {
    requestId: "req_2",
    requestCode: "REQ-002",
    titleAr: "طلب مغلق",
    titleEn: "Closed Request",
    descriptionAr: "",
    descriptionEn: "",
    requestType: "per_branch",
    status: "Closed",
    priority: "High",
    category: "General",
    tags: [],
    startAt: "2026-01-01",
    dueAt: "2026-06-30",
    allowEditAfterSubmit: false,
    allowEditAfterDueDate: false,
    requireSupervisorApproval: true,
    completionRule: "",
    formSchemaVersion: 1,
    createdBy: "admin_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    totalRecords: 50,
    totalAssignments: 5,
  },
];

describe("AdminRequests Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AppContext, "useApp").mockReturnValue({
      lang: "ar",
      dir: "rtl",
      requests: mockRequests,
      fields: [],
    } as any);
  });

  it("renders the requests module and lists requests", () => {
    render(
      <AdminRequests
        onOpenFormBuilder={vi.fn()}
        onOpenImportWizard={vi.fn()}
      />,
    );

    expect(screen.getByText(/إدارة حملات وطلبات/i)).toBeTruthy();
    expect(screen.getByText("طلب تجريبي 1")).toBeTruthy();
    expect(screen.getByText("طلب مغلق")).toBeTruthy();
  });

  it("filters requests when typing in the search box", async () => {
    const user = userEvent.setup();
    render(
      <AdminRequests
        onOpenFormBuilder={vi.fn()}
        onOpenImportWizard={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/بحث بالاسم، الرمز/i);
    await user.type(searchInput, "مغلق");

    expect(screen.getByText("طلب مغلق")).toBeTruthy();
    expect(screen.queryByText("طلب تجريبي 1")).toBeNull();
  });

  it("filters requests by status using the filter buttons", async () => {
    const user = userEvent.setup();
    render(
      <AdminRequests
        onOpenFormBuilder={vi.fn()}
        onOpenImportWizard={vi.fn()}
      />,
    );

    const publishBtn = screen.getByText("منشورة");
    await user.click(publishBtn);

    expect(screen.getByText("طلب تجريبي 1")).toBeTruthy();
    expect(screen.queryByText("طلب مغلق")).toBeNull();
  });

  it("opens create modal when clicking Create New Request", async () => {
    const user = userEvent.setup();
    render(
      <AdminRequests
        onOpenFormBuilder={vi.fn()}
        onOpenImportWizard={vi.fn()}
      />,
    );

    const createBtn = screen.getByText(/إنشاء طلب جديد/i);
    await user.click(createBtn);

    // After clicking, the modal for creating a new request should open, finding multiple elements with this title
    expect(screen.getAllByText(/إنشاء طلب جديد/i).length).toBeGreaterThan(1);
  });
});
