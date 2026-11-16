/** 빈 본문(204 등)과 구분하기 위한 응답 data 존재 여부 */
export function hasResponseBody(
  data: unknown,
): data is Exclude<unknown, null | undefined | ""> {
  return data !== null && data !== undefined && data !== ""
}
