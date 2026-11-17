import { queryOptions } from "@tanstack/react-query"

import { fetchGisuList } from "../api/gisu-list"
import { gisuKeys } from "./gisu-keys"

export function gisuListQueryOptions() {
  return queryOptions({
    queryKey: gisuKeys.list(),
    queryFn: fetchGisuList,
    staleTime: 60_000,
  })
}
