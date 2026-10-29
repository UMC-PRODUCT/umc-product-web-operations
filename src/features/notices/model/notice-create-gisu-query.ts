import { queryOptions } from "@tanstack/react-query"

import { fetchGisuList } from "@/shared/api/gisu-list"

export const noticeCreateGisuListQueryKey = ["gisu", "list"] as const

export function noticeCreateGisuListQueryOptions() {
  return queryOptions({
    queryKey: noticeCreateGisuListQueryKey,
    queryFn: fetchGisuList,
    staleTime: 60_000,
  })
}
