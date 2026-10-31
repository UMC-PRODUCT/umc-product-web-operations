import { queryOptions } from "@tanstack/react-query"

import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"
import { getSsoClient } from "@/shared/auth/sso-client"

import { toAdminSession } from "../model/admin-session"

import type { QueryClient } from "@tanstack/react-query"

import type { MemberSummaryResponse } from "../model/admin-session"

export const adminSessionQueryKey = ["auth", "me"] as const

export function clearAdminSession(queryClient: QueryClient) {
  getSsoClient().clearSession()
  queryClient.removeQueries({ queryKey: adminSessionQueryKey })
}

export async function fetchAdminSession() {
  const { data } = await api.get<unknown>("/v2/member/me")
  return toAdminSession(unwrapApiResult<MemberSummaryResponse>(data))
}

export function adminSessionQueryOptions() {
  return queryOptions({
    queryKey: adminSessionQueryKey,
    queryFn: fetchAdminSession,
    retry: false,
    staleTime: 30_000,
  })
}
