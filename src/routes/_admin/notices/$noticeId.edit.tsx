import { createFileRoute } from "@tanstack/react-router"

import { NoticeEditPage } from "@/features/notices"
import { loadNoticeEdit } from "@/features/notices/model/load-notice-edit"
import { parseNoticeListAudienceOptional } from "@/features/notices/model/notice-list-route-search"
import { NoticeDetailStatusView } from "@/features/notices/ui/notice-detail-status-view"

type NoticeEditSearch = {
  listAudience?: ReturnType<typeof parseNoticeListAudienceOptional>
}

export const Route = createFileRoute("/_admin/notices/$noticeId/edit")({
  validateSearch: (search: Record<string, unknown>): NoticeEditSearch => ({
    listAudience: parseNoticeListAudienceOptional(search.listAudience),
  }),
  loader: async ({ params }) => loadNoticeEdit(params.noticeId),
  component: NoticeEditRoute,
})

function NoticeEditRoute() {
  const loaderData = Route.useLoaderData()
  const { listAudience } = Route.useSearch()

  if (loaderData.kind === "forbidden") {
    return <NoticeDetailStatusView variant="forbidden" />
  }

  if (loaderData.kind === "deleted") {
    return <NoticeDetailStatusView variant="deleted" />
  }

  return (
    <NoticeEditPage
      initialForm={loaderData.initialForm}
      listAudience={listAudience}
      noticeId={loaderData.noticeId}
    />
  )
}
