import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { useSelectedGisu } from "@/entities/gisu"
import { NoticeListPage } from "@/features/notices"

import { toNoticeOperatorSession } from "./-notice-session"

export const Route = createFileRoute("/_admin/notices/")({
  // 목록 필터·탭·페이지는 history state (URL search 미사용)
  validateSearch: (): Record<string, never> => ({}),
  component: NoticesPage,
})

const adminRouteApi = getRouteApi("/_admin")

function NoticesPage() {
  const { session } = adminRouteApi.useRouteContext()
  const { gisuId: selectedGisuId } = useSelectedGisu()

  return (
    <NoticeListPage
      adminSession={session}
      session={toNoticeOperatorSession(session, { gisuId: selectedGisuId })}
    />
  )
}
