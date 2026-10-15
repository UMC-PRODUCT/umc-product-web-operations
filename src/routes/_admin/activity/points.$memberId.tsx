import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"

export const Route = createFileRoute("/_admin/activity/points/$memberId")({
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()

  return <MemberDetailPage memberId={memberId} />
}
