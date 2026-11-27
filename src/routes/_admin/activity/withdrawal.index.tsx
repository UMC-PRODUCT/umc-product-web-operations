import { createFileRoute, useRouterState } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"

import {
  buildWithdrawalLocationState,
  canAccessWithdrawalManagement,
  mergeWithdrawalListSearch,
  rememberWithdrawalListView,
  resolveWithdrawalExportFieldAccess,
  resolveWithdrawalListViewState,
  WithdrawalAccessDenied,
  type WithdrawalListMock,
  type WithdrawalListSearch,
  WithdrawalPage,
} from "@/features/withdrawal"
import { onlyInDev } from "@/shared/lib/dev-only"

function parseWithdrawalMock(value: unknown): WithdrawalListMock | undefined {
  if (
    value === "loading" ||
    value === "error" ||
    value === "empty" ||
    value === "detail-loading" ||
    value === "detail-error" ||
    value === "export-error"
  ) {
    return value
  }
  return undefined
}

type WithdrawalIndexSearch = {
  mock?: WithdrawalListMock
}

export const Route = createFileRoute("/_admin/activity/withdrawal/")({
  validateSearch: (search: Record<string, unknown>): WithdrawalIndexSearch => ({
    mock: onlyInDev(parseWithdrawalMock(search.mock)),
  }),
  component: WithdrawalIndexPage,
})

function WithdrawalIndexPage() {
  const { session } = Route.useRouteContext()
  const { mock } = Route.useSearch()
  const navigate = Route.useNavigate()
  const locationState = useRouterState({
    select: (state) => state.location.state,
  })
  const listSearch = useMemo(
    () => resolveWithdrawalListViewState(locationState),
    [locationState],
  )
  const canAccess = useMemo(
    () =>
      canAccessWithdrawalManagement({
        scope: session.scope,
        roleTypes: session.roleTypes,
      }),
    [session.roleTypes, session.scope],
  )
  const exportFieldAccess = useMemo(
    () =>
      resolveWithdrawalExportFieldAccess({
        scope: session.scope,
        roleTypes: session.roleTypes,
        schoolId: session.schoolId,
        schoolName: session.schoolName,
      }),
    [session.roleTypes, session.schoolId, session.schoolName, session.scope],
  )

  const onSearchChange = useCallback(
    (patch: WithdrawalListSearch) => {
      const next = mergeWithdrawalListSearch(listSearch, patch)
      rememberWithdrawalListView(next)
      void navigate({
        replace: true,
        search: (previous) => ({ mock: previous.mock }),
        state: {
          ...locationState,
          ...buildWithdrawalLocationState({ withdrawalListSearch: next }),
        },
        to: "/activity/withdrawal",
      })
    },
    [listSearch, locationState, navigate],
  )

  if (!canAccess) {
    return <WithdrawalAccessDenied />
  }

  return (
    <WithdrawalPage
      exportFieldAccess={exportFieldAccess}
      mock={mock}
      onSearchChange={onSearchChange}
      search={listSearch}
    />
  )
}
