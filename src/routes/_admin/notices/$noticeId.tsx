import { createFileRoute, notFound } from "@tanstack/react-router"

import { NoticeDetailPage } from "@/features/notices"
import { getNoticeDetail } from "@/features/notices/model/get-notice-detail"

import type { NoticeImageLoadState } from "@/features/notices/model/notice-detail.types"

type NoticeDetailSearch = {
  /** TODO: API 연동 시 제거. `pending` | `loading` | `success` */
  imageLoadState?: NoticeImageLoadState
}

function parseImageLoadState(
  search: Record<string, unknown>,
): NoticeImageLoadState | undefined {
  if (
    search.imageLoadState === "pending" ||
    search.imageLoadState === "loading" ||
    search.imageLoadState === "success"
  ) {
    return search.imageLoadState
  }

  if (search.imageLoadOutcome === "error") {
    return "pending"
  }

  if (search.imageLoadOutcome === "success") {
    return "success"
  }

  return undefined
}

export const Route = createFileRoute("/_admin/notices/$noticeId")({
  validateSearch: (search: Record<string, unknown>): NoticeDetailSearch => ({
    imageLoadState: parseImageLoadState(search),
  }),
  loader: ({ params }) => {
    const notice = getNoticeDetail(params.noticeId)
    if (!notice) {
      throw notFound()
    }
    return notice
  },
  component: NoticeDetailRoute,
})

function NoticeDetailRoute() {
  const notice = Route.useLoaderData()
  const { imageLoadState } = Route.useSearch()

  return <NoticeDetailPage imageLoadState={imageLoadState} notice={notice} />
}
