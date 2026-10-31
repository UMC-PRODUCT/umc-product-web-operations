/** 목록 필터 Select의 "전체" 옵션 값 (PointsToolbar와 동일 패턴) */
export const NOTICE_LIST_FILTER_ALL = "all"

export function isNoticeListFilterAllValue(
  value: string | null | undefined,
): boolean {
  return value == null || value === NOTICE_LIST_FILTER_ALL
}
