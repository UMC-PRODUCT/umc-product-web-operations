import { buildGisuGenerationLookup, fetchGisuList } from "@/entities/gisu"

import { buildNoticeOrganizationNameLookup } from "./map-gisu-organization"
import { mapNoticeDetailResponse } from "./map-notice-from-api"
import {
  isNoticeForbiddenError,
  isNoticeNotFoundError,
} from "./notice-api-error"
import { noticeDetailQueryOptions } from "./notice-detail-query"
import { fetchNoticeListOrganizationOptions } from "./notice-list-organization-query"

import type { QueryClient } from "@tanstack/react-query"

import type { NoticeDetail } from "./notice-detail.types"

export type NoticeDetailLoaderData =
  | { kind: "success"; notice: NoticeDetail }
  | { kind: "forbidden" }
  | { kind: "deleted" }

export async function loadNoticeDetail(
  noticeId: string,
  queryClient: QueryClient,
): Promise<NoticeDetailLoaderData> {
  const parsedId = Number(noticeId)
  if (!Number.isFinite(parsedId)) {
    return { kind: "deleted" }
  }

  try {
    const detail = await queryClient.ensureQueryData(
      noticeDetailQueryOptions(parsedId),
    )
    const targetGisuRaw = detail.targetInfo?.targetGisuId
    const targetGisuId = targetGisuRaw == null ? null : Number(targetGisuRaw)

    const [gisuList, organization] = await Promise.all([
      fetchGisuList().catch(
        () => [] as Awaited<ReturnType<typeof fetchGisuList>>,
      ),
      fetchNoticeListOrganizationOptions(
        Number.isFinite(targetGisuId) ? targetGisuId : null,
      ),
    ])
    const gisuGenerationById = buildGisuGenerationLookup(gisuList)
    const { chapterNameById, schoolNameById } =
      buildNoticeOrganizationNameLookup(organization)

    return {
      kind: "success",
      notice: mapNoticeDetailResponse(detail, {
        chapterNameById,
        gisuGenerationById,
        schoolNameById,
      }),
    }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden" }
    }
    if (isNoticeNotFoundError(error)) {
      return { kind: "deleted" }
    }
    throw error
  }
}
