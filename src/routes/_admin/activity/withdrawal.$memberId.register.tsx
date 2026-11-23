import { createFileRoute } from "@tanstack/react-router"

import { WithdrawalRegisterPage } from "@/features/withdrawal"

export const Route = createFileRoute(
  "/_admin/activity/withdrawal/$memberId/register",
)({
  component: WithdrawalRegisterRoute,
})

function WithdrawalRegisterRoute() {
  const { memberId } = Route.useParams()
  return <WithdrawalRegisterPage memberId={memberId} />
}
