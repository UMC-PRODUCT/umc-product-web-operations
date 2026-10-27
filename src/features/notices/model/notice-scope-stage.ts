export type NoticeScopeStage = "chapter" | "school" | "part"

export const NOTICE_SCOPE_STAGE_SELECT_OPTIONS: {
  label: string
  value: NoticeScopeStage
}[] = [
  { label: "지부별", value: "chapter" },
  { label: "학교별", value: "school" },
  { label: "파트별", value: "part" },
]
