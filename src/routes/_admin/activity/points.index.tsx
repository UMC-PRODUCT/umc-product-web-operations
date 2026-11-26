import { createFileRoute, useRouterState } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"

import { schoolExecutiveLock } from "@/features/auth"
import {
  buildPointsLocationState,
  mergePointsListSearch,
  PointsPage,
  rememberPointsListView,
  resolvePointsListViewState,
} from "@/features/points"
import { onlyInDev } from "@/shared/lib/dev-only"

import type { PointsListSearch } from "@/features/points"

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
  const navigate = Route.useNavigate()
  const locationState = useRouterState({
    select: (state) => state.location.state,
  })
  const listSearch = useMemo(
    () => resolvePointsListViewState(locationState),
    [locationState],
  )

  const onSearchChange = useCallback(
    (patch: PointsListSearch) => {
      const next = mergePointsListSearch(listSearch, patch)
      rememberPointsListView(next)
      void navigate({
        replace: true,
        search: (previous) => ({ mock: previous.mock }),
        state: {
          ...locationState,
          ...buildPointsLocationState(next),
        },
        to: "/activity/points",
      })
    },
    [listSearch, locationState, navigate],
  )

  return (
    <PointsPage
      lockedSchool={schoolExecutiveLock(session)}
      mock={mock}
      onSearchChange={onSearchChange}
      search={listSearch}
    />
  )
}
