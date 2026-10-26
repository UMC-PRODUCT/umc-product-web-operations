import { NOTICE_PART_LABELS } from "./notice-part-options"

import type { Notice, NoticeListFilters } from "./types"

export function filterNotices(
  notices: Notice[],
  filters: NoticeListFilters,
): Notice[] {
  const query = filters.query.trim().toLowerCase()

  return notices.filter((notice) => {
    if (notice.audience !== filters.audience) {
      return false
    }

    if (filters.part != null) {
      const keyword = NOTICE_PART_LABELS[filters.part]
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
