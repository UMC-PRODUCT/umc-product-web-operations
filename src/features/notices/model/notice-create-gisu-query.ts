import { gisuKeys, gisuListQueryOptions } from "@/entities/gisu"

export const noticeCreateGisuListQueryKey = gisuKeys.list()

export function noticeCreateGisuListQueryOptions() {
  return gisuListQueryOptions()
}
