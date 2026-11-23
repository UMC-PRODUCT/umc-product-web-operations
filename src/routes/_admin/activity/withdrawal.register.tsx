import { createFileRoute } from "@tanstack/react-router"

import { WithdrawalRegisterPage } from "@/features/withdrawal"

export const Route = createFileRoute("/_admin/activity/withdrawal/register")({
  component: WithdrawalRegisterRoute,
})

function WithdrawalRegisterRoute() {
  return <WithdrawalRegisterPage />
}
