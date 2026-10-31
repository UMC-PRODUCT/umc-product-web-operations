import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

import { fetchActiveGisuOrganization } from "./gisu-organization.api"

describe("fetchActiveGisuOrganization", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("requests gisu by id without mixing active criteria", async () => {
    let url: string | undefined

    api.defaults.adapter = async (config) => {
      url = config.url
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: {
            gisus: [
              {
                gisuId: 9,
                generation: 11,
                isActive: true,
                chapters: [{ chapterId: 1, chapterName: "서울" }],
                schools: [{ schoolId: 2, schoolName: "중앙대학교" }],
              },
            ],
          },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    const gisu = await fetchActiveGisuOrganization(9)

    expect(url).toContain("/v2/gisu?")
    expect(url).not.toContain("active=")
    expect(url).toContain("includeChapter=true")
    expect(url).toContain("includeSchool=true")
    expect(url).toContain("id=9")
    expect(gisu?.chapters).toHaveLength(1)
    expect(gisu?.schools).toHaveLength(1)
  })
})
