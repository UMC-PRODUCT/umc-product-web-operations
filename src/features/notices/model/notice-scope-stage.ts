export type NoticeScopeStage = "chapter" | "school" | "part"

/** 운영진 목록 범위 — API scopeStage 외 목록 전용 값 (Figma 2808-42174) */
export type NoticeListScopeStage = NoticeScopeStage | "allSchools"

export const NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS = "allSchools" as const

export function isNoticeApiScopeStage(
  scopeStage: NoticeListScopeStage | null,
): scopeStage is NoticeScopeStage {
  return (
    scopeStage === "chapter" || scopeStage === "school" || scopeStage === "part"
  )
}

export const NOTICE_SCOPE_STAGE_SELECT_OPTIONS: {
  label: string
  value: NoticeScopeStage
}[] = [
  { label: "지부별", value: "chapter" },
  { label: "학교별", value: "school" },
  { label: "파트별", value: "part" },
]
