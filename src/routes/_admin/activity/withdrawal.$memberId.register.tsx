import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  canAccessWithdrawalManagement,
  WithdrawalAccessDenied,
  WithdrawalRegisterPage,
} from "@/features/withdrawal"

export const Route = createFileRoute(
  "/_admin/activity/withdrawal/$memberId/register",
)({
  component: WithdrawalRegisterRoute,
})

function WithdrawalRegisterRoute() {
  const { session } = Route.useRouteContext()
  const { memberId } = Route.useParams()
  const canAccess = useMemo(
    () =>
      canAccessWithdrawalManagement({
        scope: session.scope,
        roleTypes: session.roleTypes,
      }),
    [session.roleTypes, session.scope],
  )

  if (!canAccess) {
    return <WithdrawalAccessDenied />
  }

  return <WithdrawalRegisterPage memberId={memberId} />
}
