export type DeletePointHistoryOutcome =
  "success" | "network_error" | "already_deleted"

const DELETE_DELAY_MS = 900

export async function mockDeletePointHistory(
  _historyId: string,
  outcome: DeletePointHistoryOutcome = "success",
): Promise<DeletePointHistoryOutcome> {
  await new Promise((resolve) => {
    setTimeout(resolve, DELETE_DELAY_MS)
  })
  return outcome
}
