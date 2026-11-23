import { createFileRoute } from "@tanstack/react-router"

import { ActivityComingSoonPage } from "@/features/activity"

export const Route = createFileRoute("/_admin/activity/completion")({
  staticData: { hideTitleBlock: true },
  component: CompletionPage,
})

function CompletionPage() {
  return <ActivityComingSoonPage title="수료·수상" />
}
