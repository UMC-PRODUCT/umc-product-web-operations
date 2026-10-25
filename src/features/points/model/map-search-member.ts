import type { RoleTagColor } from "@umc-product/react"

import type { GisuOrganizationItem } from "../api/gisu-organization"
import type { MemberSearchPart, SearchMemberItem } from "../api/member-search"
import type {
  MemberPartFilter,
  MemberRegion,
  MemberSchool,
  PointsMember,
} from "./types"

const REGION_KEYWORD: Record<MemberRegion, string> = {
  seoul: "서울",
  gyeonggi: "경기",
  chungcheong: "충청",
}

const SCHOOL_KEYWORDS: Record<MemberSchool, readonly string[]> = {
  cau: ["중앙대학교", "중앙대"],
  snu: ["서울대학교", "서울대"],
  yonsei: ["연세대학교", "연세대"],
}

const PART_QUERY: Partial<Record<string, MemberSearchPart>> = {
  pm: "PLAN",
  design: "DESIGN",
  "web-pe": "WEB_PRODUCT_ENGINEER",
  "mobile-pe": "MOBILE_PRODUCT_ENGINEER",
}

const PART_TAG: Record<MemberSearchPart, MemberPartFilter> = {
  PLAN: "pm",
  DESIGN: "design",
  WEB: "web-pe",
  WEB_PRODUCT_ENGINEER: "web-pe",
  ANDROID: "mobile-pe",
  IOS: "mobile-pe",
  MOBILE_PRODUCT_ENGINEER: "mobile-pe",
  NODEJS: "web-pe",
  SPRINGBOOT: "web-pe",
  ADMIN: "pm",
}

const PART_LABEL: Record<MemberSearchPart, string> = {
  PLAN: "PM",
  DESIGN: "Design",
  WEB: "Web",
  WEB_PRODUCT_ENGINEER: "Web PE",
  ANDROID: "Android",
  IOS: "iOS",
  MOBILE_PRODUCT_ENGINEER: "Mobile PE",
  NODEJS: "Node.js",
  SPRINGBOOT: "Spring",
  ADMIN: "Admin",
}

export function toMemberSearchPart(
  part: MemberPartFilter | null,
): MemberSearchPart | undefined {
  if (!part) {
    return undefined
  }
  return PART_QUERY[part]
}

export type OrganizationFilterOption = {
  value: string
  label: string
}

export function toChapterOptions(
  gisus: readonly GisuOrganizationItem[],
): OrganizationFilterOption[] {
  const seen = new Set<number>()
  const options: OrganizationFilterOption[] = []

  for (const gisu of gisus) {
    for (const chapter of gisu.chapters ?? []) {
      if (seen.has(chapter.id) || !chapter.name) {
        continue
      }
      seen.add(chapter.id)
      options.push({ value: String(chapter.id), label: chapter.name })
    }
  }

  return options
}

export function toSchoolOptions(
  gisus: readonly GisuOrganizationItem[],
): OrganizationFilterOption[] {
  const seen = new Set<number>()
  const options: OrganizationFilterOption[] = []

  for (const gisu of gisus) {
    for (const school of gisu.schools ?? []) {
      if (seen.has(school.schoolId) || !school.schoolName) {
        continue
      }
      seen.add(school.schoolId)
      options.push({
        value: String(school.schoolId),
        label: school.schoolName,
      })
    }
  }

  return options
}

export function toOrganizationId(value: string | null): number | undefined {
  if (value == null) {
    return undefined
  }
  const id = Number(value)
  return Number.isInteger(id) ? id : undefined
}

function guessSchool(schoolName: string | null | undefined): MemberSchool {
  if (!schoolName) {
    return "cau"
  }
  if (SCHOOL_KEYWORDS.snu.some((keyword) => schoolName.includes(keyword))) {
    return "snu"
  }
  if (SCHOOL_KEYWORDS.yonsei.some((keyword) => schoolName.includes(keyword))) {
    return "yonsei"
  }
  return "cau"
}

function guessRegion(chapterName: string | null | undefined): MemberRegion {
  if (!chapterName) {
    return "seoul"
  }
  if (chapterName.includes(REGION_KEYWORD.gyeonggi)) {
    return "gyeonggi"
  }
  if (chapterName.includes(REGION_KEYWORD.chungcheong)) {
    return "chungcheong"
  }
  return "seoul"
}

function mapRole(item: SearchMemberItem): {
  role: RoleTagColor
  roleLabel: string
} {
  const roleType = item.isAdminInActiveGisu
    ? item.challengerRecords?.find((record) => record.challengerRoleType)
        ?.challengerRoleType
    : undefined

  switch (roleType) {
    case "CHAPTER_PRESIDENT":
      return { role: "chapter", roleLabel: "지부장" }
    case "CENTRAL_PRESIDENT":
    case "CENTRAL_VICE_PRESIDENT":
    case "CENTRAL_OPERATING_TEAM_MEMBER":
    case "CENTRAL_EDUCATION_TEAM_MEMBER":
      return { role: "central", roleLabel: "중앙 운영진" }
    case "SCHOOL_PRESIDENT":
    case "SCHOOL_VICE_PRESIDENT":
      return { role: "product", roleLabel: "회장단" }
    case "SCHOOL_PART_LEADER":
    case "SCHOOL_ETC_ADMIN":
      return { role: "campus", roleLabel: "교내 운영진" }
    default:
      return { role: "challenger-super-admin", roleLabel: "챌린저" }
  }
}

export function toPointsMember(item: SearchMemberItem): PointsMember {
  const current = item.currentChallenger
  const record = item.challengerRecords?.[0]
  const apiPart = current?.part ?? record?.part ?? null
  const generationNumber = current?.generation ?? record?.gisu
  const role = mapRole(item)

  return {
    id: String(item.memberId),
    name: item.name ?? "",
    nickname: item.nickname ?? "",
    school: guessSchool(item.schoolName ?? record?.schoolName),
    schoolLabel: item.schoolName ?? record?.schoolName ?? "",
    region: guessRegion(record?.chapterName),
    regionLabel: record?.chapterName ?? undefined,
    part: apiPart ? PART_TAG[apiPart] : "pm",
    partLabel: apiPart ? PART_LABEL[apiPart] : undefined,
    generation: generationNumber != null ? `${generationNumber}기` : "",
    role: role.role,
    roleLabel: role.roleLabel,
    status: "active",
    challengerId: current?.challengerId ?? null,
  }
}
