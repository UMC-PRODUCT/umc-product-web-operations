import type { GisuOrganizationItem } from "../api/gisu-organization"
import type {
  ChallengerSearchRoleType,
  MemberSearchPart,
  SearchMemberItem,
} from "../api/member-search"
import type {
  MemberPartFilter,
  MemberSchool,
  PointsMember,
  PointsMemberRole,
} from "./types"

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
      if (seen.has(chapter.chapterId) || !chapter.chapterName) {
        continue
      }
      seen.add(chapter.chapterId)
      options.push({
        value: String(chapter.chapterId),
        label: chapter.chapterName,
      })
    }
  }

  return options
}

export function toSchoolOptions(
  gisus: readonly GisuOrganizationItem[],
  chapterId?: number,
): OrganizationFilterOption[] {
  const seen = new Set<number>()
  const options: OrganizationFilterOption[] = []

  const pushSchool = (schoolId: number, schoolName: string) => {
    if (seen.has(schoolId) || !schoolName) {
      return
    }
    seen.add(schoolId)
    options.push({
      value: String(schoolId),
      label: schoolName,
    })
  }

  for (const gisu of gisus) {
    if (chapterId != null) {
      for (const chapter of gisu.chapters ?? []) {
        if (chapter.chapterId !== chapterId) {
          continue
        }
        for (const school of chapter.schools ?? []) {
          pushSchool(school.schoolId, school.schoolName)
        }
      }
      continue
    }

    for (const school of gisu.schools ?? []) {
      pushSchool(school.schoolId, school.schoolName)
    }
    for (const chapter of gisu.chapters ?? []) {
      for (const school of chapter.schools ?? []) {
        pushSchool(school.schoolId, school.schoolName)
      }
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

const CHALLENGER_ROLE: PointsMemberRole = {
  color: "challenger-super-admin",
  label: "챌린저",
}

function mapRoleType(roleType: ChallengerSearchRoleType): PointsMemberRole {
  switch (roleType) {
    case "CHAPTER_PRESIDENT":
      return { color: "chapter", label: "지부장" }
    case "CENTRAL_PRESIDENT":
    case "CENTRAL_VICE_PRESIDENT":
    case "CENTRAL_OPERATING_TEAM_MEMBER":
    case "CENTRAL_EDUCATION_TEAM_MEMBER":
      return { color: "central", label: "중앙 운영진" }
    case "SCHOOL_PRESIDENT":
      return { color: "product", label: "회장" }
    case "SCHOOL_VICE_PRESIDENT":
      return { color: "product", label: "부회장" }
    case "SCHOOL_PART_LEADER":
      return { color: "campus", label: "파트장" }
    case "SCHOOL_ETC_ADMIN":
      return { color: "campus", label: "기타 운영진" }
  }
}

export function mapMemberRoles(item: SearchMemberItem): PointsMemberRole[] {
  if (!item.isAdminInActiveGisu) {
    return [CHALLENGER_ROLE]
  }

  const roleTypes = item.roleTypes?.filter(Boolean) ?? []
  if (roleTypes.length === 0) {
    return [CHALLENGER_ROLE]
  }

  return roleTypes.map(mapRoleType)
}

/** 11기부터 PE 체계. 그 이전은 API 파트명을 그대로 표시한다. */
export const PE_PART_GENERATION = 11

export function usesLegacyPartLabel(
  generationNumber: number | null | undefined,
): boolean {
  return generationNumber != null && generationNumber < PE_PART_GENERATION
}

export function toPointsMember(item: SearchMemberItem): PointsMember {
  const apiPart = item.part ?? null
  const rawGeneration = item.generation
  const generationNumber =
    typeof rawGeneration === "number"
      ? rawGeneration
      : typeof rawGeneration === "string"
        ? Number(rawGeneration)
        : null
  const normalizedGeneration =
    generationNumber != null &&
    Number.isInteger(generationNumber) &&
    generationNumber > 0
      ? generationNumber
      : null
  const roles = mapMemberRoles(item)
  const primaryRole = roles[0] ?? CHALLENGER_ROLE

  return {
    id: String(item.memberId ?? item.challengerId ?? ""),
    name: item.name ?? "",
    nickname: item.nickname ?? "",
    school: guessSchool(item.schoolName),
    schoolLabel: item.schoolName ?? "",
    region: "seoul",
    regionLabel: undefined,
    part: apiPart ? (PART_TAG[apiPart] ?? "pm") : "pm",
    sourcePart: apiPart,
    partLabel: apiPart ? PART_LABEL[apiPart] : undefined,
    generation: normalizedGeneration != null ? `${normalizedGeneration}기` : "",
    generationNumber: normalizedGeneration,
    role: primaryRole.color,
    roleLabel: primaryRole.label,
    roles,
    status: "active",
    challengerId: item.challengerId ?? null,
  }
}
