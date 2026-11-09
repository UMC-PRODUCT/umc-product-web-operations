/** 라우트에서 주입하는 운영진 세션( auth 슬라이스 import 없이 FSD 경계 유지 ) */
export type NoticeAdminScope =
  "SUPER_ADMIN" | "CENTRAL" | "CHAPTER" | "SCHOOL" | "SCHOOL_PART" | null

export type NoticeAdminAccessContext = {
  isSuperAdmin: boolean
  scope: NoticeAdminScope
  roleTypes: readonly string[]
  schoolId: number | null
  schoolName?: string | null
}
