export type ChapterItem = {
  id: number
  name: string
}

export type SchoolItem = {
  schoolId: number
  schoolName: string
}

export type GisuItem = {
  chapters?: ChapterItem[]
  endAt?: string
  generation: number
  gisuId: number
  isActive: boolean
  schools?: SchoolItem[]
  startAt?: string
}

export type GisuOrganizationV2Response = {
  gisus: GisuItem[]
}

export type ChapterListResponse = {
  chapters: ChapterItem[]
}

export type SchoolNameItem = {
  schoolId: number
  schoolName: string
}

export type SchoolNameListResponse = {
  schools: SchoolNameItem[]
}
