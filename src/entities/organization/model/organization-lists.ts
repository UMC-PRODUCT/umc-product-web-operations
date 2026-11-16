import type {
  GisuOrganization,
  OrganizationChapter,
  OrganizationSchool,
} from "../api/gisu-organization"

export type OrganizationChapterOption = {
  id: number
  name: string
}

export type OrganizationSchoolOption = {
  schoolId: number
  schoolName: string
}

export type OrganizationLists = {
  chapters: OrganizationChapterOption[]
  schools: OrganizationSchoolOption[]
  schoolsByChapterId: Map<number, OrganizationSchoolOption[]>
}

function toChapterOption(
  chapter: OrganizationChapter,
): OrganizationChapterOption {
  return { id: chapter.chapterId, name: chapter.chapterName }
}

function toSchoolOption(school: OrganizationSchool): OrganizationSchoolOption {
  return { schoolId: school.schoolId, schoolName: school.schoolName }
}

/** 기수 조직 응답 → 필터/락용 챕터·학교 목록 */
export function toOrganizationLists(
  gisu: Pick<GisuOrganization, "chapters" | "schools"> | null | undefined,
): OrganizationLists {
  if (gisu == null) {
    return { chapters: [], schools: [], schoolsByChapterId: new Map() }
  }

  const chapters: OrganizationChapterOption[] = []
  const schools: OrganizationSchoolOption[] = []
  const schoolsByChapterId = new Map<number, OrganizationSchoolOption[]>()

  for (const chapter of gisu.chapters) {
    chapters.push(toChapterOption(chapter))
    if (chapter.schools.length > 0) {
      const chapterSchools = chapter.schools.map(toSchoolOption)
      schoolsByChapterId.set(chapter.chapterId, chapterSchools)
      schools.push(...chapterSchools)
    }
  }

  for (const school of gisu.schools) {
    schools.push(toSchoolOption(school))
  }

  const uniqueChapters = new Map(
    chapters.map((chapter) => [chapter.id, chapter]),
  )
  const uniqueSchools = new Map(
    schools.map((school) => [school.schoolId, school]),
  )

  const normalizedChapters = [...uniqueChapters.values()]
  const normalizedSchools = [...uniqueSchools.values()]

  if (
    normalizedChapters.length === 1 &&
    !schoolsByChapterId.has(normalizedChapters[0]!.id) &&
    normalizedSchools.length > 0
  ) {
    schoolsByChapterId.set(normalizedChapters[0]!.id, normalizedSchools)
  }

  return {
    chapters: normalizedChapters,
    schools: normalizedSchools,
    schoolsByChapterId,
  }
}

export function buildOrganizationNameLookup(input: {
  chapters: OrganizationChapterOption[]
  schools: OrganizationSchoolOption[]
}): {
  chapterNameById: ReadonlyMap<number, string>
  schoolNameById: ReadonlyMap<number, string>
} {
  return {
    chapterNameById: new Map(
      input.chapters.map((chapter) => [chapter.id, chapter.name]),
    ),
    schoolNameById: new Map(
      input.schools.map((school) => [school.schoolId, school.schoolName]),
    ),
  }
}
