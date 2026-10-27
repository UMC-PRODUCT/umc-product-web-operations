import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

export type GisuSchool = {
  schoolId: number
  schoolName: string
}

export type GisuChapter = {
  chapterId: number
  chapterName: string
  schools?: GisuSchool[] | null
}

export type GisuOrganizationItem = {
  gisuId: number
  chapters?: GisuChapter[] | null
  schools?: GisuSchool[] | null
}

type RawSchool = {
  schoolId?: number | string | null
  schoolName?: string | null
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
  chapters?: RawChapter[] | null
  schools?: RawSchool[] | null
}

type RawGisuOrganizationResult = {
  gisus?: RawGisu[] | null
}

function toId(value: number | string | null | undefined) {
  if (value == null || value === "") {
    return null
  }
  const id = Number(value)
  return Number.isFinite(id) ? id : null
}

function normalizeSchool(school: RawSchool): GisuSchool | null {
  const schoolId = toId(school.schoolId)
  const schoolName = school.schoolName?.trim() ?? ""
  if (schoolId == null || schoolName === "") {
    return null
  }
  return { schoolId, schoolName }
}

function normalizeChapter(chapter: RawChapter): GisuChapter | null {
  const chapterId = toId(chapter.chapterId ?? chapter.id)
  const chapterName = (chapter.chapterName ?? chapter.name)?.trim() ?? ""
  if (chapterId == null || chapterName === "") {
    return null
  }
  return {
    chapterId,
    chapterName,
    schools: (chapter.schools ?? [])
      .map(normalizeSchool)
      .filter((school): school is GisuSchool => school != null),
  }
}

function normalizeGisu(gisu: RawGisu): GisuOrganizationItem | null {
  const gisuId = toId(gisu.gisuId)
  if (gisuId == null) {
    return null
  }
  return {
    gisuId,
    chapters: (gisu.chapters ?? [])
      .map(normalizeChapter)
      .filter((chapter): chapter is GisuChapter => chapter != null),
    schools: (gisu.schools ?? [])
      .map(normalizeSchool)
      .filter((school): school is GisuSchool => school != null),
  }
}

/**
 * 기수 조직 조회.
 * - 기수 id가 있으면 해당 기수
 * - 없으면 활성 기수 (`active=true`)
 * 지부 목록은 `includeChapter=true`로 받는다.
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
    .filter((gisu): gisu is GisuOrganizationItem => gisu != null)
}
