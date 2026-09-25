import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestApi } from "../../services";
import { RequestItem, RequestField } from "../../types";

export const requestQueryKeys = {
  all: ["requests"] as const,
  detail: (requestId: string) => ["requests", requestId] as const,
};

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      newReq,
      newFields,
    }: {
      newReq: Partial<RequestItem>;
      newFields: RequestField[];
    }) => requestApi.createRequest(newReq, newFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
    },
  });
}

export function useUpdateRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      updates,
    }: {
      requestId: string;
      updates: Partial<RequestItem>;
    }) => requestApi.updateDraftRequest(requestId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: requestQueryKeys.detail(variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
    },
  });
}

export function usePublishRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => requestApi.publishRequest(requestId),
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({
        queryKey: requestQueryKeys.detail(requestId),
      });
      queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
    },
  });
}

export function useDeleteRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => requestApi.deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
    },
  });
}
