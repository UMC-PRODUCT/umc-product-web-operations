import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { NoticeCreatePage } from "@/features/notices"
import { canCreateNotice } from "@/features/notices/model/notice-session"
import { useSelectedGisu } from "@/shared/model/selected-gisu"

import { toNoticeOperatorSession } from "./-notice-session"

export const Route = createFileRoute("/_admin/notices/new")({
  component: NoticeCreateRoute,
})

const adminRouteApi = getRouteApi("/_admin")

function NoticeCreateRoute() {
  const { session } = adminRouteApi.useRouteContext()
  const { gisuId: selectedGisuId } = useSelectedGisu()
  const noticeSession = toNoticeOperatorSession(session, {
    gisuId: selectedGisuId,
  })

  if (!canCreateNotice(noticeSession)) {
    return null
  }

  return <NoticeCreatePage session={noticeSession} />
}
