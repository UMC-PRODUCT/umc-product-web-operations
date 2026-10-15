import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"

type MemberDetailSearch = {
  state?: "error"
}

export const Route = createFileRoute("/_admin/activity/points/$memberId")({
  validateSearch: (search: Record<string, unknown>): MemberDetailSearch => ({
    state: search.state === "error" ? "error" : undefined,
  }),
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()
  const { state } = Route.useSearch()

  return <MemberDetailPage isError={state === "error"} memberId={memberId} />
}
