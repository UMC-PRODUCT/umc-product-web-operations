import { queryOptions } from "@tanstack/react-query"

import { fetchAllGisuSummaries } from "../api/gisu-list.api"

export const gisuListQueryKey = ["auth", "gisu-list"] as const

export function gisuListQueryOptions() {
  return queryOptions({
    queryKey: gisuListQueryKey,
    queryFn: () =>
      fetchAllGisuSummaries({
        size: 50,
        sort: ["generation,desc"],
      }),
    staleTime: 5 * 60_000,
  })
}
