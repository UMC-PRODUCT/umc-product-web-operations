export type AwardPointOutcome = "success" | "network_error" | "forbidden"

const AWARD_DELAY_MS = 900

export async function mockAwardPoint(
  outcome: AwardPointOutcome = "success",
): Promise<AwardPointOutcome> {
  await new Promise((resolve) => {
    setTimeout(resolve, AWARD_DELAY_MS)
  })
  return outcome
}
