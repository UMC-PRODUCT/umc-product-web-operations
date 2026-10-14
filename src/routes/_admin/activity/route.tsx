import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/activity")({
  component: ActivityLayout,
})

function ActivityLayout() {
  return <Outlet />
}
