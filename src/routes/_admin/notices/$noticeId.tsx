import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { NoticeDetailPage } from "@/features/notices"
import { loadNoticeDetail } from "@/features/notices/model/load-notice-detail"
import { parseNoticeListAudienceOptional } from "@/features/notices/model/notice-list-route-search"
import { isNoticeAuthor } from "@/features/notices/model/notice-viewer"
import { NoticeDetailStatusView } from "@/features/notices/ui/notice-detail-status-view"
import { useSelectedGisu } from "@/shared/model/selected-gisu"

import { toNoticeOperatorSession } from "./-notice-session"

import type { DeleteNoticeOutcome } from "@/features/notices/model/mock-delete-notice"
import type { NoticeImageLoadState } from "@/features/notices/model/notice-detail.types"
import type { NoticeAudience } from "@/features/notices/model/types"

type NoticeDetailSearch = {
  /** 목록으로 돌아갈 때 복원할 탭(챌린저/운영진) */
  listAudience?: NoticeAudience
  /** TODO: API 연동 시 제거. 삭제 결과 시뮬레이션용 */
  deleteOutcome?: DeleteNoticeOutcome
  /** TODO: API 연동 시 제거. `pending` | `loading` | `success` */
  imageLoadState?: NoticeImageLoadState
  /** QA: `loading`에서 mock success 자동 전환 끔 */
  imageLoadPause?: boolean
  /** TODO: API 연동 시 제거. mock 조회자 작성자명 */
  viewerAuthor?: string
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
    listAudience: parseNoticeListAudienceOptional(search.listAudience),
    deleteOutcome:
      search.deleteOutcome === "network_error" ||
      search.deleteOutcome === "success"
        ? search.deleteOutcome
        : undefined,
    imageLoadState: parseImageLoadState(search),
    imageLoadPause:
      search.imageLoadPause === "1" || search.imageLoadPause === true,
    viewerAuthor:
      typeof search.viewerAuthor === "string" && search.viewerAuthor.length > 0
        ? search.viewerAuthor
        : undefined,
  }),
  loader: async ({ params }) => loadNoticeDetail(params.noticeId),
  component: NoticeDetailRoute,
})

const adminRouteApi = getRouteApi("/_admin")

function NoticeDetailRoute() {
  const loaderData = Route.useLoaderData()
  const { session: adminSession } = adminRouteApi.useRouteContext()
  const { gisuId: selectedGisuId } = useSelectedGisu()
  const session = toNoticeOperatorSession(adminSession, {
    gisuId: selectedGisuId,
  })
  const {
    deleteOutcome,
    imageLoadPause,
    imageLoadState,
    listAudience,
    viewerAuthor,
  } = Route.useSearch()

  if (loaderData.kind === "forbidden") {
    return <NoticeDetailStatusView variant="forbidden" />
  }

  if (loaderData.kind === "deleted") {
    return <NoticeDetailStatusView variant="deleted" />
  }

  const { notice } = loaderData
  const canManageNotice = isNoticeAuthor(notice, session, viewerAuthor)

  return (
    <NoticeDetailPage
      canManageNotice={canManageNotice}
      deleteOutcome={deleteOutcome}
      imageLoadPause={imageLoadPause}
      imageLoadState={imageLoadState}
      listAudience={listAudience}
      notice={notice}
    />
  )
}
