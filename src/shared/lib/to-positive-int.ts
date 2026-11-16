/** 양의 정수만 통과. 그 외는 null. */
export function toPositiveInt(
  value: number | string | null | undefined,
): number | null {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}
