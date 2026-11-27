/** API `part`가 null일 때 표시 */
export const WITHDRAWAL_EMPTY_PART_LABEL = "파트 없음" as const

const PART_LABELS: Record<string, string> = {
  pm: "PM",
  design: "Design",
  "web-pe": "Web",
  "mobile-pe": "Mobile",
}

export function getWithdrawalPartLabel(part: string): string {
  return PART_LABELS[part] ?? part
}
