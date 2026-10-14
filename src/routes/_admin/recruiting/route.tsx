import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/recruiting")({
  component: RecruitingLayout,
})

function RecruitingLayout() {
  return <Outlet />
}
