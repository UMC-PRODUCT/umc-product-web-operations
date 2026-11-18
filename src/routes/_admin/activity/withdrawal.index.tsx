import { createFileRoute } from "@tanstack/react-router"

import { type WithdrawalListMock, WithdrawalPage } from "@/features/withdrawal"
import { onlyInDev } from "@/shared/lib/dev-only"

function parseWithdrawalMock(value: unknown): WithdrawalListMock | undefined {
  if (value === "loading" || value === "error" || value === "empty") {
    return value
  }
  return undefined
}

export const Route = createFileRoute("/_admin/activity/withdrawal/")({
  validateSearch: (search: Record<string, unknown>) => ({
    mock: onlyInDev(parseWithdrawalMock(search.mock)),
  }),
  component: WithdrawalIndexPage,
})

function WithdrawalIndexPage() {
  const { mock } = Route.useSearch()
  return <WithdrawalPage mock={mock} />
}
