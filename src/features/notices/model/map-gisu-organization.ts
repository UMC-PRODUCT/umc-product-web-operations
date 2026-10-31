export type NoticeListChapterOption = {
  id: number
  name: string
}

export type NoticeListSchoolOption = {
  schoolId: number
  schoolName: string
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeChapterOption(
  raw: unknown,
): NoticeListChapterOption | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const item = raw as Record<string, unknown>
  const id = readNumber(item.id ?? item.chapterId)
  if (id == null) {
    return null
  }

  const name =
    readString(item.name) ?? readString(item.chapterName) ?? `지부 #${id}`

  return { id, name }
}

export function normalizeSchoolOption(
  raw: unknown,
): NoticeListSchoolOption | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const item = raw as Record<string, unknown>
  const schoolId = readNumber(item.schoolId ?? item.id)
  if (schoolId == null) {
    return null
  }

  const schoolName =
    readString(item.schoolName) ?? readString(item.name) ?? `학교 #${schoolId}`

  return { schoolId, schoolName }
}

export function normalizeGisuOrganizationLists(input: {
  chapters?: unknown
  schools?: unknown
}): {
  chapters: NoticeListChapterOption[]
  schools: NoticeListSchoolOption[]
} {
  const chapterList = Array.isArray(input.chapters) ? input.chapters : []
  const schoolList = Array.isArray(input.schools) ? input.schools : []

  const chapters: NoticeListChapterOption[] = []
  const schools: NoticeListSchoolOption[] = []

  for (const rawChapter of chapterList) {
    const chapter = normalizeChapterOption(rawChapter)
    if (chapter) {
      chapters.push(chapter)
    }

    if (rawChapter && typeof rawChapter === "object") {
      const nestedSchools = (rawChapter as Record<string, unknown>).schools
      if (Array.isArray(nestedSchools)) {
        for (const rawSchool of nestedSchools) {
          const school = normalizeSchoolOption(rawSchool)
          if (school) {
            schools.push(school)
          }
        }
      }
    }
  }

  for (const rawSchool of schoolList) {
    const school = normalizeSchoolOption(rawSchool)
    if (school) {
      schools.push(school)
    }
  }

  const uniqueChapters = new Map(
    chapters.map((chapter) => [chapter.id, chapter]),
  )
  const uniqueSchools = new Map(
    schools.map((school) => [school.schoolId, school]),
  )

  return {
    chapters: [...uniqueChapters.values()],
    schools: [...uniqueSchools.values()],
  }
}

export function buildNoticeOrganizationNameLookup(input: {
  chapters: NoticeListChapterOption[]
  schools: NoticeListSchoolOption[]
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
