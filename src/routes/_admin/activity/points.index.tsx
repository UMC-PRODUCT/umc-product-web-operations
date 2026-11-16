import { createFileRoute } from "@tanstack/react-router"

import { schoolExecutiveLock } from "@/features/auth"
import { PointsPage } from "@/features/points"
import { onlyInDev } from "@/shared/lib/dev-only"

type PointsIndexSearch = {
  /** 운영 역할 +N UI 확인용. `?mock=roles` (개발 모드 전용) */
  mock?: "roles"
}

export const Route = createFileRoute("/_admin/activity/points/")({
  validateSearch: (search: Record<string, unknown>): PointsIndexSearch => ({
    mock: onlyInDev(search.mock === "roles" ? "roles" : undefined),
  }),
  component: PointsIndexPage,
})

function PointsIndexPage() {
  const { session } = Route.useRouteContext()
  const { mock } = Route.useSearch()
  return <PointsPage lockedSchool={schoolExecutiveLock(session)} mock={mock} />
}
