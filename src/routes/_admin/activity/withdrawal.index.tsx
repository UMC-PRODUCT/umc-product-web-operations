import { createFileRoute } from "@tanstack/react-router"

import { WithdrawalPage } from "@/features/withdrawal"

export const Route = createFileRoute("/_admin/activity/withdrawal/")({
  component: WithdrawalIndexPage,
})

function WithdrawalIndexPage() {
  return <WithdrawalPage />
}
