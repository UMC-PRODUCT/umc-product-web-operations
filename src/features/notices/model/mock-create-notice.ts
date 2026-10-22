export type CreateNoticeOutcome = "success" | "network_error" | "forbidden"

export async function mockCreateNotice(
  outcome: CreateNoticeOutcome = "success",
): Promise<CreateNoticeOutcome> {
  await new Promise((resolve) => {
    setTimeout(resolve, 400)
  })
  return outcome
}
