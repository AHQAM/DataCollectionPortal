import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordApi } from "../../services";

export const recordQueryKeys = {
  all: ["records"] as const,
  detail: (recordId: string) => ["records", recordId] as const,
};

export function useSubmitRecordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      recordId,
      formData,
      activityId,
      clientUpdatedAt,
    }: {
      requestId: string;
      recordId: string;
      formData: Record<string, any>;
      activityId?: string;
      clientUpdatedAt?: string;
    }) =>
      recordApi.submitRecord(
        requestId,
        recordId,
        formData,
        activityId,
        clientUpdatedAt,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recordQueryKeys.detail(variables.recordId),
      });
      queryClient.invalidateQueries({ queryKey: recordQueryKeys.all });
    },
  });
}

export function useSaveDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      recordId,
      formData,
      activityId,
      clientUpdatedAt,
    }: {
      requestId: string;
      recordId: string;
      formData: Record<string, any>;
      activityId?: string;
      clientUpdatedAt?: string;
    }) =>
      recordApi.saveDraftRecord(
        requestId,
        recordId,
        formData,
        activityId,
        clientUpdatedAt,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recordQueryKeys.detail(variables.recordId),
      });
    },
  });
}

export function useReassignRecordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recordId,
      newUserId,
    }: {
      recordId: string;
      newUserId: string;
    }) => recordApi.reassignRecord(recordId, newUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordQueryKeys.all });
    },
  });
}
