import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useSubmitRecordMutation,
  useSaveDraftMutation,
  useReassignRecordMutation,
  useUpdateUserMutation,
  useCreateUserMutation,
  useDeactivateUserMutation,
  useUnlockUserMutation,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  usePublishRequestMutation,
  useDeleteRequestMutation,
} from "../hooks/queries";
import { recordApi, userApi, requestApi } from "../services";

vi.mock("../services", () => ({
  recordApi: {
    submitRecord: vi.fn(),
    saveDraftRecord: vi.fn(),
    reassignRecord: vi.fn(),
  },
  userApi: {
    updateUser: vi.fn(),
    createUser: vi.fn(),
    deactivateUser: vi.fn(),
    adminUnlockAccount: vi.fn(),
  },
  requestApi: {
    createRequest: vi.fn(),
    updateDraftRequest: vi.fn(),
    publishRequest: vi.fn(),
    deleteRequest: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("React Query Mutation Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Record Mutations", () => {
    it("useSubmitRecordMutation executes successfully", async () => {
      vi.mocked(recordApi.submitRecord).mockResolvedValueOnce({
        success: true,
        responseId: "resp-100",
      });
      const { result } = renderHook(() => useSubmitRecordMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          requestId: "req-1",
          recordId: "rec-1",
          formData: { q1: "test" },
        });
      });

      expect(mutationResult.success).toBe(true);
      expect(recordApi.submitRecord).toHaveBeenCalledWith(
        "req-1",
        "rec-1",
        { q1: "test" },
        undefined,
        undefined,
      );
    });

    it("useSaveDraftMutation executes successfully", async () => {
      vi.mocked(recordApi.saveDraftRecord).mockResolvedValueOnce({
        success: true,
      });
      const { result } = renderHook(() => useSaveDraftMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          requestId: "req-1",
          recordId: "rec-1",
          formData: { draft: true },
        });
      });

      expect(mutationResult.success).toBe(true);
      expect(recordApi.saveDraftRecord).toHaveBeenCalledWith(
        "req-1",
        "rec-1",
        { draft: true },
        undefined,
        undefined,
      );
    });

    it("useReassignRecordMutation executes successfully", async () => {
      vi.mocked(recordApi.reassignRecord).mockResolvedValueOnce({
        success: true,
      });
      const { result } = renderHook(() => useReassignRecordMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          recordId: "rec-1",
          newUserId: "usr-2",
        });
      });

      expect(mutationResult.success).toBe(true);
      expect(recordApi.reassignRecord).toHaveBeenCalledWith("rec-1", "usr-2");
    });
  });

  describe("User Mutations", () => {
    it("useUpdateUserMutation executes successfully", async () => {
      vi.mocked(userApi.updateUser).mockResolvedValueOnce({ success: true });
      const { result } = renderHook(() => useUpdateUserMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          userId: "usr-1",
          data: { userNameAr: "مستخدم محدث" },
        });
      });

      expect(mutationResult.success).toBe(true);
      expect(userApi.updateUser).toHaveBeenCalledWith("usr-1", {
        userNameAr: "مستخدم محدث",
      });
    });

    it("useCreateUserMutation executes successfully", async () => {
      vi.mocked(userApi.createUser).mockResolvedValueOnce({
        success: true,
        userId: "new-user-1",
      });
      const { result } = renderHook(() => useCreateUserMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          username: "rep1",
        });
      });

      expect(mutationResult.success).toBe(true);
      expect(userApi.createUser).toHaveBeenCalledWith({ username: "rep1" });
    });

    it("useDeactivateUserMutation executes successfully", async () => {
      vi.mocked(userApi.deactivateUser).mockResolvedValueOnce({
        success: true,
      });
      const { result } = renderHook(() => useDeactivateUserMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync("usr-1");
      });

      expect(mutationResult.success).toBe(true);
      expect(userApi.deactivateUser).toHaveBeenCalledWith("usr-1");
    });

    it("useUnlockUserMutation executes successfully", async () => {
      vi.mocked(userApi.adminUnlockAccount).mockResolvedValueOnce({
        success: true,
      });
      const { result } = renderHook(() => useUnlockUserMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync("usr-1");
      });

      expect(mutationResult.success).toBe(true);
      expect(userApi.adminUnlockAccount).toHaveBeenCalledWith("usr-1");
    });
  });

  describe("Request Mutations", () => {
    it("useCreateRequestMutation executes successfully", async () => {
      vi.mocked(requestApi.createRequest).mockResolvedValueOnce("req-new");
      const { result } = renderHook(() => useCreateRequestMutation(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          newReq: { titleAr: "طلب تجريبي" },
          newFields: [],
        });
      });

      expect(mutationResult).toBe("req-new");
      expect(requestApi.createRequest).toHaveBeenCalledWith(
        { titleAr: "طلب تجريبي" },
        [],
      );
    });

    it("useUpdateRequestMutation executes successfully", async () => {
      vi.mocked(requestApi.updateDraftRequest).mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useUpdateRequestMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          requestId: "req-1",
          updates: { titleAr: "تحديث" },
        });
      });

      expect(requestApi.updateDraftRequest).toHaveBeenCalledWith("req-1", {
        titleAr: "تحديث",
      });
    });

    it("usePublishRequestMutation executes successfully", async () => {
      vi.mocked(requestApi.publishRequest).mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => usePublishRequestMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("req-1");
      });

      expect(requestApi.publishRequest).toHaveBeenCalledWith("req-1");
    });

    it("useDeleteRequestMutation executes successfully", async () => {
      vi.mocked(requestApi.deleteRequest).mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useDeleteRequestMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("req-1");
      });

      expect(requestApi.deleteRequest).toHaveBeenCalledWith("req-1");
    });
  });
});
