import { createFileRoute } from "@tanstack/react-router"

import { NoticeListPage } from "@/features/notices"

import type {
  NoticeDeleteOutcome,
  NoticeListLoadOutcome,
  NoticePublishOutcome,
} from "@/features/notices/model/notice-outcomes"

type NoticesSearch = {
  /** TODO: API 연동 시 제거. 삭제 성공 Toast 시뮬레이션용 */
  deleteOutcome?: NoticeDeleteOutcome
  /** TODO: API 연동 시 제거. 목록 조회 결과 시뮬레이션용 */
  listOutcome?: NoticeListLoadOutcome
  /** TODO: API 연동 시 제거. 등록 성공 Toast 시뮬레이션용 */
  publishOutcome?: NoticePublishOutcome
}

export const Route = createFileRoute("/_admin/notices/")({
  validateSearch: (search: Record<string, unknown>): NoticesSearch => ({
    deleteOutcome:
      search.deleteOutcome === "success" ? search.deleteOutcome : undefined,
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

function NoticesPage() {
  const { deleteOutcome, listOutcome, publishOutcome } = Route.useSearch()

  return (
    <NoticeListPage
      deleteOutcome={deleteOutcome}
      listOutcome={listOutcome}
      publishOutcome={publishOutcome}
    />
  )
}
