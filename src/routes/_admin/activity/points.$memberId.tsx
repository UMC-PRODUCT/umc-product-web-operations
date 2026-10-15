import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"

type MemberDetailSearch = {
  state?: "error" | "forbidden"
}

export const Route = createFileRoute("/_admin/activity/points/$memberId")({
  validateSearch: (search: Record<string, unknown>): MemberDetailSearch => ({
    state:
      search.state === "error" || search.state === "forbidden"
        ? search.state
        : undefined,
  }),
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()
  const { state } = Route.useSearch()

  return (
    <MemberDetailPage
      isError={state === "error"}
      isForbidden={state === "forbidden"}
      memberId={memberId}
    />
  )
}
