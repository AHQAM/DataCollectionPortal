import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../services";
import { User } from "../../types";

export const userQueryKeys = {
  all: ["users"] as const,
  detail: (userId: string) => ["users", userId] as const,
};

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      userApi.updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: any) => userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.deactivateUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(userId),
      });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useUnlockUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.adminUnlockAccount(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.detail(userId),
      });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}
