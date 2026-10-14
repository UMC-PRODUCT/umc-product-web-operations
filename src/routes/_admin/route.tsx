import { createFileRoute } from "@tanstack/react-router"

import { AdminShell } from "@/widgets/admin-shell/AdminShell"

export const Route = createFileRoute("/_admin")({
  component: AdminShell,
})
