import { createFileRoute } from "@tanstack/react-router"

import { NoticeCreatePage } from "@/features/notices"

import type { CreateNoticeOutcome } from "@/features/notices/model/mock-create-notice"

type NoticeCreateSearch = {
  /** TODO: API 연동 시 제거. 등록 결과 시뮬레이션용 */
  createOutcome?: CreateNoticeOutcome
}

export const Route = createFileRoute("/_admin/notices/new")({
  validateSearch: (search: Record<string, unknown>): NoticeCreateSearch => ({
    createOutcome:
      search.createOutcome === "network_error" ||
      search.createOutcome === "forbidden" ||
      search.createOutcome === "success"
        ? search.createOutcome
        : undefined,
  }),
  component: NoticeCreateRoute,
})

function NoticeCreateRoute() {
  const { createOutcome } = Route.useSearch()

  return <NoticeCreatePage createOutcome={createOutcome} />
}
