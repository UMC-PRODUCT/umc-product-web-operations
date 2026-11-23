import { mapNoticeDetailToEditForm } from "./map-notice-detail-to-edit-form"
import { mapNoticeVoteInfoToPoll } from "./map-notice-from-api"
import {
  isNoticeForbiddenError,
  isNoticeNotFoundError,
} from "./notice-api-error"
import { noticeDetailQueryOptions } from "./notice-detail-query"

import type { QueryClient } from "@tanstack/react-query"

import type { NoticeCreateFormState } from "./notice-create-form"
import type { NoticePoll } from "./notice-detail.types"

export type NoticeEditLoaderData =
  | {
      kind: "success"
      attachedVotePoll: NoticePoll | null
      formRevision: string
      initialForm: NoticeCreateFormState
      noticeId: number
      title: string
    }
  | { kind: "forbidden" }
  | { kind: "deleted" }

export async function loadNoticeEdit(
  noticeId: string,
  queryClient: QueryClient,
): Promise<NoticeEditLoaderData> {
  const parsedId = Number(noticeId)
  if (!Number.isFinite(parsedId)) {
    return { kind: "deleted" }
  }

  try {
    const detail = await queryClient.ensureQueryData(
      noticeDetailQueryOptions(parsedId),
    )
    return {
      kind: "success",
      attachedVotePoll: detail.vote
        ? mapNoticeVoteInfoToPoll(detail.vote)
        : null,
      formRevision: detail.updatedAt,
      initialForm: mapNoticeDetailToEditForm(detail),
      noticeId: parsedId,
      title: detail.title,
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
