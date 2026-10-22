import type { Notice, NoticeListFilters, NoticeTargetFilter } from "./types"

const TARGET_KEYWORDS: Record<Exclude<NoticeTargetFilter, "all">, string> = {
  design: "Design",
  server: "Server",
  web: "Web",
}

export function filterNotices(
  notices: Notice[],
  filters: NoticeListFilters,
): Notice[] {
  const query = filters.query.trim().toLowerCase()

  return notices.filter((notice) => {
    if (notice.audience !== filters.audience) {
      return false
    }

    if (filters.target !== "all") {
      const keyword = TARGET_KEYWORDS[filters.target]
      if (!notice.target.includes(keyword)) {
        return false
      }
    }

    if (query.length > 0 && !notice.title.toLowerCase().includes(query)) {
      return false
    }

    return true
  })
}
