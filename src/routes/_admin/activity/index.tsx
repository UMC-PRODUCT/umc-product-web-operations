import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/activity/")({
  beforeLoad: () => {
    throw redirect({ to: "/activity/points" })
  },
})
