import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRequestOps } from "../hooks/useRequestOps";
import { requestApi } from "../services";
import * as auditUtils from "../utils/audit";

vi.mock("../services", () => ({
  requestApi: {
    createRequest: vi.fn(),
    updateDraftRequest: vi.fn(),
    publishRequest: vi.fn(),
    closeRequest: vi.fn(),
    archiveRequest: vi.fn(),
    reopenRequest: vi.fn(),
    cloneRequest: vi.fn(),
    deleteRequest: vi.fn(),
    saveRequestFields: vi.fn(),
  },
}));

vi.mock("../utils/audit", () => ({
  logAudit: vi.fn(),
}));

describe("useRequestOps Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- createRequest ---
  it("createRequest calls API and returns success", async () => {
    vi.mocked(requestApi.createRequest).mockResolvedValue("new_req_id");
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.createRequest(
        { requestCode: "REQ-123", titleAr: "Test Request" },
        [],
      );
    });
    expect(res?.success).toBe(true);
    expect(res?.data).toBe("new_req_id");
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_CREATED_VIA_CF",
      "Request",
      "new_req_id",
      expect.any(Object),
    );
  });

  it("createRequest returns failure on error", async () => {
    vi.mocked(requestApi.createRequest).mockRejectedValue(
      new Error("API Error"),
    );
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.createRequest({ requestCode: "REQ-123" }, []);
    });
    expect(res?.success).toBe(false);
    expect(res?.error).toBeDefined();
  });

  // --- updateRequest ---
  it("updateRequest calls API and returns success", async () => {
    vi.mocked(requestApi.updateDraftRequest).mockResolvedValue(
      undefined as any,
    );
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.updateRequest("req_1", {
        titleAr: "New Title",
      });
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_UPDATED",
      "Request",
      "req_1",
      expect.any(Object),
    );
  });

  it("updateRequest returns failure on error", async () => {
    vi.mocked(requestApi.updateDraftRequest).mockRejectedValue(
      new Error("API Error"),
    );
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.updateRequest("req_1", {
        titleAr: "New Title",
      });
    });
    expect(res?.success).toBe(false);
  });

  // --- publishRequest ---
  it("publishRequest calls API and returns success", async () => {
    vi.mocked(requestApi.publishRequest).mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.publishRequest("req_1");
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_PUBLISHED",
      "Request",
      "req_1",
      {},
    );
  });

  it("publishRequest returns failure on error", async () => {
    vi.mocked(requestApi.publishRequest).mockRejectedValue(
      new Error("API Error"),
    );
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.publishRequest("req_1");
    });
    expect(res?.success).toBe(false);
  });

  // --- closeRequest ---
  it("closeRequest calls API and returns success", async () => {
    vi.mocked(requestApi.closeRequest).mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.closeRequest("req_1");
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_CLOSED",
      "Request",
      "req_1",
      {},
    );
  });

  // --- archiveRequest ---
  it("archiveRequest calls API and returns success", async () => {
    vi.mocked(requestApi.archiveRequest).mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.archiveRequest("req_1");
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_ARCHIVED",
      "Request",
      "req_1",
      {},
    );
  });

  // --- reopenRequest ---
  it("reopenRequest calls API and returns success", async () => {
    vi.mocked(requestApi.reopenRequest).mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.reopenRequest("req_1");
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_REOPENED",
      "Request",
      "req_1",
      {},
    );
  });

  // --- cloneRequest ---
  it("cloneRequest calls API and returns success", async () => {
    vi.mocked(requestApi.cloneRequest).mockResolvedValue("cloned_id");
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.cloneRequest("req_1");
    });
    expect(res?.success).toBe(true);
    expect(res?.data).toBe("cloned_id");
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_CLONED",
      "Request",
      "cloned_id",
      { sourceRequestId: "req_1" },
    );
  });

  // --- deleteRequest ---
  it("deleteRequest calls API and returns success", async () => {
    vi.mocked(requestApi.deleteRequest).mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.deleteRequest("req_1");
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_DELETED",
      "Request",
      "req_1",
      {},
    );
  });

  // --- updateRequestFields ---
  it("updateRequestFields calls API and returns success", async () => {
    vi.mocked(requestApi.saveRequestFields).mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.updateRequestFields("req_1", []);
    });
    expect(res?.success).toBe(true);
    expect(auditUtils.logAudit).toHaveBeenCalledWith(
      "REQUEST_FIELDS_UPDATED",
      "Request",
      "req_1",
      { fieldsCount: 0 },
    );
  });

  it("updateRequestFields returns failure on error", async () => {
    vi.mocked(requestApi.saveRequestFields).mockRejectedValue(
      new Error("API Error"),
    );
    const { result } = renderHook(() => useRequestOps());
    let res;
    await act(async () => {
      res = await result.current.updateRequestFields("req_1", []);
    });
    expect(res?.success).toBe(false);
  });
});
