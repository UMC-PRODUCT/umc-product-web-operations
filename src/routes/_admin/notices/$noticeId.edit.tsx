import { createFileRoute } from "@tanstack/react-router"

import { NoticeEditPage } from "@/features/notices"
import { loadNoticeEdit } from "@/features/notices"
import { NoticeDetailStatusView } from "@/features/notices"
import { NoticeEditForbiddenStatusView } from "@/features/notices"

export const Route = createFileRoute("/_admin/notices/$noticeId/edit")({
  // 상세와 같은 캐시를 쓰며, preload로 불필요 GET(조회수 증가)이 나지 않게 한다.
  staticData: { shellLayout: "compose" },
  preload: false,
  loader: async ({ context, params }) =>
    loadNoticeEdit(params.noticeId, context.queryClient),
  component: NoticeEditRoute,
})

function NoticeEditRoute() {
  const loaderData = Route.useLoaderData()

  if (loaderData.kind === "forbidden") {
    return <NoticeEditForbiddenStatusView />
  }

  if (loaderData.kind === "deleted") {
    return <NoticeDetailStatusView variant="deleted" />
  }

  return (
    <NoticeEditPage
      initialAttachedVotePoll={loaderData.attachedVotePoll}
      initialForm={loaderData.initialForm}
      noticeId={loaderData.noticeId}
    />
  )
}
