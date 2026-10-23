export type DeleteNoticeOutcome = "success" | "network_error"

export async function mockDeleteNotice(
  outcome: DeleteNoticeOutcome = "success",
): Promise<DeleteNoticeOutcome> {
  await new Promise((resolve) => {
    setTimeout(resolve, 400)
  })
  return outcome
}
