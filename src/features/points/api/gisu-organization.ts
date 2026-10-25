import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

export type GisuChapter = {
  id: number
  name: string
}

export type GisuSchool = {
  schoolId: number
  schoolName: string
}

export type GisuOrganizationItem = {
  gisuId: number
  chapters?: GisuChapter[] | null
  schools?: GisuSchool[] | null
}

type GisuOrganizationResult = {
  gisus?: GisuOrganizationItem[] | null
}

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
  return unwrapApiResult<GisuOrganizationResult>(data).gisus ?? []
}
