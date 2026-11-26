import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  canAccessWithdrawalManagement,
  resolveWithdrawalExportFieldAccess,
  WithdrawalAccessDenied,
  type WithdrawalListMock,
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

export const Route = createFileRoute("/_admin/activity/withdrawal/")({
  validateSearch: (search: Record<string, unknown>) => ({
    mock: onlyInDev(parseWithdrawalMock(search.mock)),
  }),
  component: WithdrawalIndexPage,
})

function WithdrawalIndexPage() {
  const { session } = Route.useRouteContext()
  const { mock } = Route.useSearch()
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

  if (!canAccess) {
    return <WithdrawalAccessDenied />
  }

  return <WithdrawalPage exportFieldAccess={exportFieldAccess} mock={mock} />
}
