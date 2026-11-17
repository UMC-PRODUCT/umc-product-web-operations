import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/activity/points")({
  staticData: { hideTitleBlock: true },
  component: PointsLayout,
})

function PointsLayout() {
  return <Outlet />
}
