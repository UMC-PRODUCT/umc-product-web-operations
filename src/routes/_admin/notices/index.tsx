import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { useOperatorGisu } from "@/features/auth"
import { NoticeListPage } from "@/features/notices"
import { parseNoticeListAudienceOptional } from "@/features/notices/model/notice-list-route-search"

import { toNoticeOperatorSession } from "./-notice-session"

import type {
  NoticeDeleteOutcome,
  NoticeImageRegisterOutcome,
  NoticeListLoadOutcome,
  NoticePublishOutcome,
} from "@/features/notices/model/notice-outcomes"
import type { NoticeAudience } from "@/features/notices/model/types"

type NoticesSearch = {
  audience?: NoticeAudience
  /** TODO: API 연동 시 제거. 삭제 성공 Toast 시뮬레이션용 */
  deleteOutcome?: NoticeDeleteOutcome
  /** TODO: API 연동 시 제거. 이미지 등록 성공 Toast 시뮬레이션용 */
  imageRegisterOutcome?: NoticeImageRegisterOutcome
  /** TODO: API 연동 시 제거. 목록 조회 결과 시뮬레이션용 */
  listOutcome?: NoticeListLoadOutcome
  /** TODO: API 연동 시 제거. 등록 성공 Toast 시뮬레이션용 */
  publishOutcome?: NoticePublishOutcome
}

export const Route = createFileRoute("/_admin/notices/")({
  validateSearch: (search: Record<string, unknown>): NoticesSearch => ({
    audience: parseNoticeListAudienceOptional(search.audience),
    deleteOutcome:
      search.deleteOutcome === "success" ? search.deleteOutcome : undefined,
    imageRegisterOutcome:
      search.imageRegisterOutcome === "success"
        ? search.imageRegisterOutcome
        : undefined,
    listOutcome:
      search.listOutcome === "network_error" ||
      search.listOutcome === "forbidden"
        ? search.listOutcome
        : undefined,
    publishOutcome:
      search.publishOutcome === "success" ? search.publishOutcome : undefined,
  }),
  component: NoticesPage,
})

const adminRouteApi = getRouteApi("/_admin")

function NoticesPage() {
  const {
    audience,
    deleteOutcome,
    imageRegisterOutcome,
    listOutcome,
    publishOutcome,
  } = Route.useSearch()
  const { session } = adminRouteApi.useRouteContext()
  const { selectedGisuId } = useOperatorGisu()

  return (
    <NoticeListPage
      audience={audience}
      deleteOutcome={deleteOutcome}
      imageRegisterOutcome={imageRegisterOutcome}
      listOutcome={listOutcome}
      publishOutcome={publishOutcome}
      session={toNoticeOperatorSession(session, { gisuId: selectedGisuId })}
    />
  )
}
