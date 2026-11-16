import { PE_PART_GENERATION, usesLegacyPartLabel } from "@/entities/member"

import type { RoleType } from "@/entities/member"
import type { GisuOrganization } from "@/entities/organization"

import type { MemberSearchPart, SearchMemberItem } from "../api/member-search"
import type {
  MemberPartFilter,
  MemberStatus,
  PointsMember,
  PointsMemberRole,
} from "./types"

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

const LEGACY_PART_FILTERS = new Set<MemberSearchPart>([
  "WEB",
  "NODEJS",
  "SPRINGBOOT",
  "ANDROID",
  "IOS",
])

export const PE_PART_FILTER_OPTIONS = [
  { value: "pm", label: "PM" },
  { value: "design", label: "Design" },
  { value: "web-pe", label: "Web PE" },
  { value: "mobile-pe", label: "Mobile PE" },
] as const

export const LEGACY_PART_FILTER_OPTIONS = [
  { value: "WEB", label: "Web" },
  { value: "NODEJS", label: "Node.js" },
  { value: "SPRINGBOOT", label: "Spring" },
  { value: "ANDROID", label: "Android" },
  { value: "IOS", label: "iOS" },
] as const

export function getPartFilterOptions(generation: number | null | undefined) {
  if (usesLegacyPartLabel(generation)) {
    return [...LEGACY_PART_FILTER_OPTIONS]
  }
  return [...PE_PART_FILTER_OPTIONS]
}

export function toMemberSearchPart(
  part: string | null,
  generation?: number | null,
): MemberSearchPart | undefined {
  if (!part) {
    return undefined
  }

  if (usesLegacyPartLabel(generation)) {
    return LEGACY_PART_FILTERS.has(part as MemberSearchPart)
      ? (part as MemberSearchPart)
      : undefined
  }

  return PART_QUERY[part]
}

export type OrganizationFilterOption = {
  value: string
  label: string
}

type GisuOrganizationLike = Pick<GisuOrganization, "chapters" | "schools">

function asGisuList(
  gisus:
    GisuOrganizationLike | readonly GisuOrganizationLike[] | null | undefined,
): readonly GisuOrganizationLike[] {
  if (gisus == null) {
    return []
  }
  if (Array.isArray(gisus)) {
    return gisus as readonly GisuOrganizationLike[]
  }
  return [gisus as GisuOrganizationLike]
}

export function toChapterOptions(
  gisus:
    GisuOrganizationLike | readonly GisuOrganizationLike[] | null | undefined,
): OrganizationFilterOption[] {
  const seen = new Set<number>()
  const options: OrganizationFilterOption[] = []

  for (const gisu of asGisuList(gisus)) {
    for (const chapter of gisu.chapters) {
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
  gisus:
    GisuOrganizationLike | readonly GisuOrganizationLike[] | null | undefined,
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

  for (const gisu of asGisuList(gisus)) {
    if (chapterId != null) {
      for (const chapter of gisu.chapters) {
        if (chapter.chapterId !== chapterId) {
          continue
        }
        for (const school of chapter.schools) {
          pushSchool(school.schoolId, school.schoolName)
        }
      }
      continue
    }

    for (const school of gisu.schools) {
      pushSchool(school.schoolId, school.schoolName)
    }
    for (const chapter of gisu.chapters) {
      for (const school of chapter.schools) {
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

const CHALLENGER_ROLE: PointsMemberRole = {
  color: "challenger-super-admin",
  label: "챌린저",
}

function mapRoleType(roleType: RoleType): PointsMemberRole {
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

export { PE_PART_GENERATION, usesLegacyPartLabel }

export function mapChallengerStatus(
  status: SearchMemberItem["challengerStatus"],
): MemberStatus {
  switch (status) {
    case "GRADUATED":
      return "graduated"
    case "EXPELLED":
      return "expelled"
    case "WITHDRAWN":
      return "withdrawn"
    case "ACTIVE":
    default:
      return "active"
  }
}

export function memberStatusLabel(status: MemberStatus): string {
  switch (status) {
    case "graduated":
      return "수료"
    case "expelled":
      return "제적"
    case "withdrawn":
      return "탈퇴"
    case "active":
    default:
      return "활동"
  }
}

export function memberStatusTagColor(
  status: MemberStatus,
): "brand" | "neutral" {
  return status === "active" ? "brand" : "neutral"
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
    schoolLabel: item.schoolName ?? "",
    regionLabel: undefined,
    part: apiPart ? (PART_TAG[apiPart] ?? "pm") : "pm",
    sourcePart: apiPart,
    partLabel: apiPart ? PART_LABEL[apiPart] : undefined,
    generation: normalizedGeneration != null ? `${normalizedGeneration}기` : "",
    generationNumber: normalizedGeneration,
    role: primaryRole.color,
    roleLabel: primaryRole.label,
    roles,
    status: mapChallengerStatus(item.challengerStatus),
    challengerId: item.challengerId ?? null,
  }
}
