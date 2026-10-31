import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"

import type { AwardPointOutcome } from "@/features/points/model/mock-award-point"
import type { DeletePointHistoryOutcome } from "@/features/points/model/mock-delete-point-history"

type MemberDetailSearch = {
  state?: "error" | "forbidden"
  challengerId?: number
  /** 쿼리로 삭제 결과를 흉내 낼 때만 사용한다. */
  deleteOutcome?: DeletePointHistoryOutcome
  /** 쿼리로 부여 결과를 흉내 낼 때만 사용한다. */
  awardOutcome?: AwardPointOutcome
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
    state:
      search.state === "error" || search.state === "forbidden"
        ? search.state
        : undefined,
    challengerId: readChallengerId(search.challengerId),
    deleteOutcome:
      search.deleteOutcome === "network_error" ||
      search.deleteOutcome === "already_deleted" ||
      search.deleteOutcome === "success"
        ? search.deleteOutcome
        : undefined,
    awardOutcome:
      search.awardOutcome === "network_error" ||
      search.awardOutcome === "forbidden" ||
      search.awardOutcome === "success"
        ? search.awardOutcome
        : undefined,
  }),
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()
  const { state, deleteOutcome, awardOutcome, challengerId } = Route.useSearch()

  return (
    <MemberDetailPage
      awardOutcome={awardOutcome}
      challengerId={challengerId}
      deleteOutcome={deleteOutcome}
      isError={state === "error"}
      isForbidden={state === "forbidden"}
      memberId={memberId}
    />
  )
}
