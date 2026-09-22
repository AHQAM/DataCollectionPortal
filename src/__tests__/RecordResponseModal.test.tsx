import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecordResponseModal } from "../components/admin/RecordResponseModal";
import * as AppContext from "../context/AppContext";
import { RecordItem, RequestItem, RequestField } from "../types";

vi.mock("../components/admin/records/RecordResponseWidget", () => ({
  RecordResponseWidget: ({ field, val }: any) => (
    <div data-testid={`widget-${field.fieldKey}`}>
      {val !== undefined ? String(val) : "N/A"}
    </div>
  ),
}));

describe("RecordResponseModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AppContext, "useApp").mockReturnValue({
      lang: "en",
    } as any);
  });

  const mockRecord: RecordItem = {
    recordId: "rec_1",
    requestId: "req_1",
    targetId: "C-001",
    targetName: "Acme Corp",
    userName: "John Doe",
    assignedRegionNo: "REG-1",
    branchName: "Main Branch",
    branchId: "b_1",
    recordStatus: "Completed",
    rawData: {},
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  } as any;

  const mockRequest: RequestItem = {
    requestId: "req_1",
    requestCode: "REQ-001",
    titleEn: "Annual Survey",
  } as any;

  const mockFields: RequestField[] = [
    {
      fieldId: "f1",
      requestId: "req_1",
      fieldKey: "rating",
      fieldLabelEn: "Rating",
      fieldType: "number",
      isRequired: true,
    } as any,
    {
      fieldId: "f2",
      requestId: "req_1",
      fieldKey: "comments",
      fieldLabelEn: "Comments",
      fieldType: "textarea",
      isRequired: false,
    } as any,
  ];

  it("does not render if record is null", () => {
    const { container } = render(
      <RecordResponseModal
        record={null}
        request={undefined}
        fields={[]}
        response={{}}
        onClose={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal with basic details", () => {
    render(
      <RecordResponseModal
        record={mockRecord}
        request={mockRequest}
        fields={[]}
        response={{}}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Field Record Response Details")).toBeTruthy();
    expect(screen.getByText("Acme Corp")).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Completed")).toBeTruthy();
    expect(screen.getByText(/REQ-001 - Annual Survey/)).toBeTruthy();
  });

  it("shows no fields message if fields is empty", () => {
    render(
      <RecordResponseModal
        record={mockRecord}
        request={mockRequest}
        fields={[]}
        response={{}}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByText("No form fields defined for this campaign."),
    ).toBeTruthy();
  });

  it("renders field answers correctly", () => {
    const response = {
      rating: 5,
      comments: "Great service!",
    };

    render(
      <RecordResponseModal
        record={mockRecord}
        request={mockRequest}
        fields={mockFields}
        response={response}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Rating")).toBeTruthy();
    expect(screen.getByTestId("widget-rating").textContent).toBe("5");

    expect(screen.getByText("Comments")).toBeTruthy();
    expect(screen.getByTestId("widget-comments").textContent).toBe(
      "Great service!",
    );
  });

  it("displays additional response data for unmapped keys", () => {
    const response = {
      rating: 4,
      hiddenField: "secret_value",
      extraInfo: { ip: "127.0.0.1" },
    };

    render(
      <RecordResponseModal
        record={mockRecord}
        request={mockRequest}
        fields={mockFields}
        response={response}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Additional Response Data")).toBeTruthy();
    expect(screen.getByText("hiddenField")).toBeTruthy();
    expect(screen.getByText("secret_value")).toBeTruthy();
    expect(screen.getByText("extraInfo")).toBeTruthy();
    expect(screen.getByText(/127\.0\.0\.1/)).toBeTruthy();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <RecordResponseModal
        record={mockRecord}
        request={mockRequest}
        fields={[]}
        response={{}}
        onClose={handleClose}
      />,
    );

    const closeBtn = screen.getByText("Close");
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
