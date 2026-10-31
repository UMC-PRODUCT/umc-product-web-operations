import { queryOptions } from "@tanstack/react-query"

import { fetchActiveGisuOrganization } from "../api/gisu-organization.api"
import { normalizeGisuOrganizationLists } from "./map-gisu-organization"

import type {
  NoticeListChapterOption,
  NoticeListSchoolOption,
} from "./map-gisu-organization"

export type NoticeListOrganizationOptions = {
  chapters: NoticeListChapterOption[]
  schools: NoticeListSchoolOption[]
}

export function noticeListOrganizationQueryKey(gisuId: number | null) {
  return ["notices", "organization", gisuId] as const
}

export async function fetchNoticeListOrganizationOptions(
  gisuId: number | null,
): Promise<NoticeListOrganizationOptions> {
  if (gisuId == null) {
    return { chapters: [], schools: [] }
  }

  const gisu = await fetchActiveGisuOrganization(gisuId)
  if (!gisu) {
    return { chapters: [], schools: [] }
  }

  return normalizeGisuOrganizationLists({
    chapters: gisu.chapters,
    schools: gisu.schools,
  })
}

export function noticeListOrganizationQueryOptions(gisuId: number | null) {
  return queryOptions({
    queryKey: noticeListOrganizationQueryKey(gisuId),
    queryFn: () => fetchNoticeListOrganizationOptions(gisuId),
    enabled: gisuId != null,
    staleTime: 60_000,
  })
}
