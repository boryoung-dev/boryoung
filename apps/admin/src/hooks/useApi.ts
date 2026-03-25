"use client";

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { useAdminAuth } from "./useAdminAuth";

/**
 * 인증된 GET 요청을 React Query로 래핑
 * - token이 없으면 쿼리 비활성화
 * - 401 응답 시 자동 로그아웃
 */
export function useApiQuery<T = any>(
  queryKey: string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
) {
  const { token, logout } = useAdminAuth();

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        throw new Error("인증 만료");
      }
      if (!res.ok) throw new Error(`API 오류: ${res.status}`);
      return res.json();
    },
    enabled: !!token,
    ...options,
  });
}

/**
 * 인증된 POST/PUT/PATCH/DELETE 요청을 React Query mutation으로 래핑
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables, token: string) => Promise<Response>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error) => void;
    invalidateKeys?: string[][];
  }
) {
  const { token, logout } = useAdminAuth();
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      if (!token) throw new Error("인증 필요");
      const res = await mutationFn(variables, token);
      if (res.status === 401) {
        logout();
        throw new Error("인증 만료");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      // 관련 쿼리 자동 무효화
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
      }
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}
