import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useFormBuilder } from "../hooks/useFormBuilder";
import { RequestField } from "../types";

const mockInitialFields: RequestField[] = [
  {
    fieldId: "f1",
    requestId: "req_1",
    fieldKey: "field_1",
    fieldType: "text",
    fieldLabelAr: "حقل 1",
    fieldLabelEn: "Field 1",
    isRequired: true,
    sortOrder: 1,
    schemaVersion: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    fieldId: "f2",
    requestId: "req_1",
    fieldKey: "field_2",
    fieldType: "select",
    fieldLabelAr: "حقل 2",
    fieldLabelEn: "Field 2",
    isRequired: false,
    sortOrder: 2,
    options: [
      { id: "opt_1", value: "opt_1", labelAr: "خيار 1", labelEn: "Option 1" },
    ],
    schemaVersion: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("useFormBuilder Hook", () => {
  it("initializes with initial fields and selects the first field", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    expect(result.current.formFields).toHaveLength(2);
    expect(result.current.selectedFieldId).toBe("f1");
    expect(result.current.selectedField?.fieldKey).toBe("field_1");
  });

  it("adds a new field and selects it", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.handleAddField("select");
    });

    expect(result.current.formFields).toHaveLength(3);
    const added = result.current.formFields[2];
    expect(added.fieldType).toBe("select");
    expect(added.options).toHaveLength(2);
    expect(result.current.selectedFieldId).toBe(added.fieldId);
  });

  it("duplicates an existing field", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.handleDuplicateField(mockInitialFields[0]);
    });

    expect(result.current.formFields).toHaveLength(3);
    const duplicated = result.current.formFields[2];
    expect(duplicated.fieldKey).toBe("field_1_copy");
    expect(duplicated.fieldLabelAr).toContain("(نسخة)");
  });

  it("deletes a field and updates selection", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.handleDeleteField("f1");
    });

    expect(result.current.formFields).toHaveLength(1);
    expect(result.current.selectedFieldId).toBe("f2");
  });

  it("reorders fields up and down", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.handleMove(1, "up");
    });

    expect(result.current.formFields[0].fieldId).toBe("f2");
    expect(result.current.formFields[1].fieldId).toBe("f1");
    expect(result.current.formFields[0].sortOrder).toBe(1);
    expect(result.current.formFields[1].sortOrder).toBe(2);
  });

  it("updates selected field attributes and options", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.updateSelectedField({
        fieldLabelAr: "تسمية معدلة",
        options: [
          {
            id: "opt_new",
            value: "val_new",
            labelAr: "خيار جديد",
            labelEn: "New Option",
          },
        ],
      });
    });

    expect(result.current.selectedField?.fieldLabelAr).toBe("تسمية معدلة");
    expect(result.current.selectedField?.options).toHaveLength(1);
  });

  it("saves fields via handleSaveAll", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.handleSaveAll();
    });

    expect(mockUpdate).toHaveBeenCalledWith("req_1", expect.any(Array));
    expect(result.current.saveSuccess).toBe(true);
  });

  it("loads inactive customers preset template", () => {
    const mockUpdate = vi.fn();
    const { result } = renderHook(() =>
      useFormBuilder(mockInitialFields, "req_1", mockUpdate),
    );

    act(() => {
      result.current.handleLoadInactiveCustomersPreset();
    });

    expect(result.current.formFields.length).toBeGreaterThan(5);
  });
});
