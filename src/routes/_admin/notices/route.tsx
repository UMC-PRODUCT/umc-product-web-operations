import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/notices")({
  staticData: { hideTitleBlock: true },
  component: NoticesLayout,
})

function NoticesLayout() {
  return <Outlet />
}
