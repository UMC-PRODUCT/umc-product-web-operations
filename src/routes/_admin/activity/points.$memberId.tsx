import { createFileRoute } from "@tanstack/react-router"

import { MemberDetailPage } from "@/features/points"

import type { AwardPointOutcome } from "@/features/points/model/mock-award-point"
import type { DeletePointHistoryOutcome } from "@/features/points/model/mock-delete-point-history"

type MemberDetailSearch = {
  state?: "error" | "forbidden"
  /** TODO: API 연동 시 제거. 삭제 결과 시뮬레이션용 */
  deleteOutcome?: DeletePointHistoryOutcome
  /** TODO: API 연동 시 제거. 부여 결과 시뮬레이션용 */
  awardOutcome?: AwardPointOutcome
}

export const Route = createFileRoute("/_admin/activity/points/$memberId")({
  validateSearch: (search: Record<string, unknown>): MemberDetailSearch => ({
    state:
      search.state === "error" || search.state === "forbidden"
        ? search.state
        : undefined,
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
  const { state, deleteOutcome, awardOutcome } = Route.useSearch()

  return (
    <MemberDetailPage
      awardOutcome={awardOutcome}
      deleteOutcome={deleteOutcome}
      isError={state === "error"}
      isForbidden={state === "forbidden"}
      memberId={memberId}
    />
  )
}
