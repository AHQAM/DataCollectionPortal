import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBranchesExcelImport } from "../hooks/useBranchesExcelImport";
import * as excelUtil from "../utils/excel";

vi.mock("../utils/excel", () => ({
  getXLSX: vi.fn(),
}));

describe("useBranchesExcelImport Hook", () => {
  const mockImportFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockImportFn.mockResolvedValue({
      success: true,
      data: { branchesCount: 2, regionsCount: 2 },
    });
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() =>
      useBranchesExcelImport("ar", mockImportFn),
    );

    expect(result.current.showExcelModal).toBe(false);
    expect(result.current.parsedBranches).toEqual([]);
    expect(result.current.parsedRegions).toEqual([]);
    expect(result.current.importMode).toBe("append");
    expect(result.current.excelFileName).toBe("");
    expect(result.current.excelParseError).toBeNull();
    expect(result.current.successMessage).toBeNull();
  });

  it("updates import mode and modal visibility", () => {
    const { result } = renderHook(() =>
      useBranchesExcelImport("ar", mockImportFn),
    );

    act(() => {
      result.current.setShowExcelModal(true);
      result.current.setImportMode("replace");
    });

    expect(result.current.showExcelModal).toBe(true);
    expect(result.current.importMode).toBe("replace");
  });

  it("downloads template using XLSX utility", async () => {
    const mockJsonToSheet = vi.fn().mockReturnValue({});
    const mockBookNew = vi.fn().mockReturnValue({});
    const mockBookAppendSheet = vi.fn();
    const mockWriteFile = vi.fn();

    (excelUtil.getXLSX as any).mockResolvedValue({
      utils: {
        json_to_sheet: mockJsonToSheet,
        book_new: mockBookNew,
        book_append_sheet: mockBookAppendSheet,
      },
      writeFile: mockWriteFile,
    });

    const { result } = renderHook(() =>
      useBranchesExcelImport("ar", mockImportFn),
    );

    await act(async () => {
      await result.current.handleDownloadTemplate();
    });

    expect(mockJsonToSheet).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining(".xlsx"),
    );
  });

  it("confirms import successfully when data exists", async () => {
    const { result } = renderHook(() =>
      useBranchesExcelImport("ar", mockImportFn),
    );

    act(() => {
      result.current.setParsedBranches([
        { branchId: "B1", branchNameAr: "فرع 1" },
      ]);
    });

    await act(async () => {
      await result.current.handleConfirmImport();
    });

    expect(mockImportFn).toHaveBeenCalledWith(
      [{ branchId: "B1", branchNameAr: "فرع 1" }],
      [],
      "append",
    );
    expect(result.current.successMessage).toContain("تم استيراد");
  });

  it("does nothing in handleConfirmImport if parsed lists are empty", async () => {
    const { result } = renderHook(() =>
      useBranchesExcelImport("ar", mockImportFn),
    );

    await act(async () => {
      await result.current.handleConfirmImport();
    });

    expect(mockImportFn).not.toHaveBeenCalled();
  });
});
