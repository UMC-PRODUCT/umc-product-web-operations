import type { RoleTagColor } from "@umc-product/react"

import type { GisuOrganizationItem } from "../api/gisu-organization"
import type { MemberSearchPart, SearchMemberItem } from "../api/member-search"
import type { MemberPartFilter, MemberSchool, PointsMember } from "./types"

const SCHOOL_KEYWORDS: Record<MemberSchool, readonly string[]> = {
  cau: ["중앙대학교", "중앙대"],
  snu: ["서울대학교", "서울대"],
  yonsei: ["연세대학교", "연세대"],
}

const PART_QUERY: Partial<Record<string, MemberSearchPart>> = {
  pm: "PLAN",
  design: "DESIGN",
  "web-pe": "WEB",
  "mobile-pe": "ANDROID",
}

const PART_TAG: Record<MemberSearchPart, MemberPartFilter> = {
  PLAN: "pm",
  DESIGN: "design",
  WEB: "web-pe",
  ANDROID: "mobile-pe",
  IOS: "mobile-pe",
  NODEJS: "web-pe",
  SPRINGBOOT: "web-pe",
  ADMIN: "pm",
}

const PART_LABEL: Record<MemberSearchPart, string> = {
  PLAN: "PM",
  DESIGN: "Design",
  WEB: "Web",
  ANDROID: "Android",
  IOS: "iOS",
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

function mapRole(item: SearchMemberItem): {
  role: RoleTagColor
  roleLabel: string
} {
  const roleType = item.isAdminInActiveGisu ? item.roleTypes?.[0] : undefined

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
  const role = mapRole(item)

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
    role: role.role,
    roleLabel: role.roleLabel,
    status: "active",
    challengerId: item.challengerId ?? null,
  }
}
