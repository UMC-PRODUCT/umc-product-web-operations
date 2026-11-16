import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"
import { toPositiveInt } from "@/shared/lib/to-positive-int"

export type OrganizationSchool = {
  schoolId: number
  schoolName: string
}

export type OrganizationChapter = {
  chapterId: number
  chapterName: string
  schools: OrganizationSchool[]
}

export type GisuOrganization = {
  gisuId: number
  generation: number | null
  isActive: boolean
  chapters: OrganizationChapter[]
  schools: OrganizationSchool[]
}

type RawSchool = {
  schoolId?: number | string | null
  schoolName?: string | null
  id?: number | string | null
  name?: string | null
}

type RawChapter = {
  chapterId?: number | string | null
  chapterName?: string | null
  id?: number | string | null
  name?: string | null
  schools?: RawSchool[] | null
}

type RawGisu = {
  gisuId?: number | string | null
  generation?: number | string | null
  isActive?: boolean | null
  chapters?: RawChapter[] | null
  schools?: RawSchool[] | null
}

type RawGisuOrganizationResult = {
  gisus?: RawGisu[] | null
}

function normalizeSchool(school: RawSchool): OrganizationSchool | null {
  const schoolId = toPositiveInt(school.schoolId ?? school.id)
  const schoolName = (school.schoolName ?? school.name)?.trim() ?? ""
  if (schoolId == null || schoolName === "") {
    return null
  }
  return { schoolId, schoolName }
}

function normalizeChapter(chapter: RawChapter): OrganizationChapter | null {
  const chapterId = toPositiveInt(chapter.chapterId ?? chapter.id)
  const chapterName = (chapter.chapterName ?? chapter.name)?.trim() ?? ""
  if (chapterId == null || chapterName === "") {
    return null
  }
  return {
    chapterId,
    chapterName,
    schools: (chapter.schools ?? [])
      .map(normalizeSchool)
      .filter((item): item is OrganizationSchool => item != null),
  }
}

function normalizeGisu(gisu: RawGisu): GisuOrganization | null {
  const gisuId = toPositiveInt(gisu.gisuId)
  if (gisuId == null) {
    return null
  }
  return {
    gisuId,
    generation: toPositiveInt(gisu.generation),
    isActive: gisu.isActive === true,
    chapters: (gisu.chapters ?? [])
      .map(normalizeChapter)
      .filter((item): item is OrganizationChapter => item != null),
    schools: (gisu.schools ?? [])
      .map(normalizeSchool)
      .filter((item): item is OrganizationSchool => item != null),
  }
}

/**
 * 기수 조직 조회 (GISU-201).
 * - `gisuId`가 있으면 해당 기수
 * - 없으면 활성 기수 (`active=true`)
 */
export async function fetchGisuOrganization(gisuId?: number) {
  const { data } = await api.get<unknown>("/v2/gisu", {
    params:
      gisuId == null
        ? {
            active: true,
            includeChapter: true,
            includeSchool: true,
          }
        : {
            id: gisuId,
            includeChapter: true,
            includeSchool: true,
          },
  })
  const result = unwrapApiResult<RawGisuOrganizationResult>(data)
  return (result.gisus ?? [])
    .map(normalizeGisu)
    .filter((gisu): gisu is GisuOrganization => gisu != null)
}

/** 특정 기수 1건. 없으면 null. */
export async function fetchGisuOrganizationById(gisuId: number) {
  const gisus = await fetchGisuOrganization(gisuId)
  return gisus.find((gisu) => gisu.gisuId === gisuId) ?? gisus[0] ?? null
}
