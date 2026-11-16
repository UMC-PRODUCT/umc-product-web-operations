export const ROLE_TYPES = [
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
  "CHAPTER_PRESIDENT",
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
] as const

export type RoleType = (typeof ROLE_TYPES)[number]

export function isRoleType(value: string): value is RoleType {
  return (ROLE_TYPES as readonly string[]).includes(value)
}
