import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"
import { onlyInDev } from "@/shared/lib/dev-only"

type MemberDetailSearch = {
  state?: "error" | "forbidden"
  challengerId?: number
}

function readChallengerId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (
    typeof value === "string" &&
    value !== "" &&
    Number.isFinite(Number(value))
  ) {
    return Number(value)
  }
  return undefined
}

export const Route = createFileRoute("/_admin/activity/points/$memberId")({
  validateSearch: (search: Record<string, unknown>): MemberDetailSearch => ({
    state: onlyInDev(
      search.state === "error" || search.state === "forbidden"
        ? search.state
        : undefined,
    ),
    challengerId: readChallengerId(search.challengerId),
  }),
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()
  const { state, challengerId } = Route.useSearch()

  return (
    <MemberDetailPage
      challengerId={challengerId}
      isError={state === "error"}
      isForbidden={state === "forbidden"}
      memberId={memberId}
    />
  )
}
