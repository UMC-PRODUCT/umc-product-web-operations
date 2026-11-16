import { createFileRoute } from "@tanstack/react-router"

import { schoolExecutiveLock } from "@/features/auth"
import { parsePointsListSearch, PointsPage } from "@/features/points"
import { onlyInDev } from "@/shared/lib/dev-only"

import type { PointsListSearch } from "@/features/points"

type PointsIndexSearch = PointsListSearch & {
  /** 운영 역할 +N UI 확인용. `?mock=roles` (개발 모드 전용) */
  mock?: "roles"
}

export const Route = createFileRoute("/_admin/activity/points/")({
  validateSearch: (search: Record<string, unknown>): PointsIndexSearch => ({
    ...parsePointsListSearch(search),
    mock: onlyInDev(search.mock === "roles" ? "roles" : undefined),
  }),
  component: PointsIndexPage,
})

function PointsIndexPage() {
  const { session } = Route.useRouteContext()
  const { mock, ...listSearch } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <PointsPage
      lockedSchool={schoolExecutiveLock(session)}
      mock={mock}
      onSearchChange={(patch) => {
        void navigate({
          replace: true,
          search: (previous) => ({ ...previous, ...patch }),
        })
      }}
      search={listSearch}
    />
  )
}
