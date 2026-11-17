import { createFileRoute } from "@tanstack/react-router"

import { ActivityComingSoonPage } from "@/features/activity"

export const Route = createFileRoute("/_admin/activity/study")({
  staticData: { hideTitleBlock: true },
  component: StudyPage,
})

function StudyPage() {
  return <ActivityComingSoonPage title="스터디" />
}
