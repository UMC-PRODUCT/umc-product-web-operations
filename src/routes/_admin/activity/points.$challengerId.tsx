import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"
import { onlyInDev } from "@/shared/lib/dev-only"

type MemberDetailSearch = {
  state?: "error" | "forbidden"
}

function parseChallengerId(value: string): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export const Route = createFileRoute("/_admin/activity/points/$challengerId")({
  validateSearch: (search: Record<string, unknown>): MemberDetailSearch => ({
    state: onlyInDev(
      search.state === "error" || search.state === "forbidden"
        ? search.state
        : undefined,
    ),
  }),
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { challengerId } = Route.useParams()
  const { state } = Route.useSearch()

  return (
    <MemberDetailPage
      challengerId={parseChallengerId(challengerId)}
      isError={state === "error"}
      isForbidden={state === "forbidden"}
    />
  )
}
