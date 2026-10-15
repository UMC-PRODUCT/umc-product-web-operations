import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/activity/points")({
  component: PointsLayout,
})

function PointsLayout() {
  return <Outlet />
}
