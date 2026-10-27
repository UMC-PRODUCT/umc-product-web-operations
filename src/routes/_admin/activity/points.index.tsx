import { createFileRoute } from "@tanstack/react-router"

import { schoolExecutiveLock } from "@/features/auth"
import { PointsPage } from "@/features/points"

export const Route = createFileRoute("/_admin/activity/points/")({
  component: PointsIndexPage,
})

function PointsIndexPage() {
  const { session } = Route.useRouteContext()
  return <PointsPage lockedSchool={schoolExecutiveLock(session)} />
}
