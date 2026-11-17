import { createFileRoute } from "@tanstack/react-router"

import { ActivityComingSoonPage } from "@/features/activity"

export const Route = createFileRoute("/_admin/activity/bulk-award")({
  staticData: { hideTitleBlock: true },
  component: BulkAwardPage,
})

function BulkAwardPage() {
  return <ActivityComingSoonPage title="일관 부여" />
}
