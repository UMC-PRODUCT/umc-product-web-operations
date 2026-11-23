import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/activity/withdrawal")({
  staticData: { hideTitleBlock: true },
  component: WithdrawalLayout,
})

function WithdrawalLayout() {
  return <Outlet />
}
