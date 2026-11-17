import { createFileRoute } from "@tanstack/react-router"

import { ActivityComingSoonPage } from "@/features/activity"

export const Route = createFileRoute("/_admin/activity/members")({
  staticData: { hideTitleBlock: true },
  component: MembersPage,
})

function MembersPage() {
  return <ActivityComingSoonPage title="멤버 관리" />
}
