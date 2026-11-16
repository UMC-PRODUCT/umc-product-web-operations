import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

import { fetchGisuOrganizationById } from "./gisu-organization"

describe("fetchGisuOrganizationById", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("requests gisu by id without mixing active criteria", async () => {
    let url: string | undefined
    let params: unknown

    api.defaults.adapter = async (config) => {
      url = config.url
      params = config.params
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

    const gisu = await fetchGisuOrganizationById(9)

    expect(url).toContain("/v2/gisu")
    expect(params).toMatchObject({
      id: 9,
      includeChapter: true,
      includeSchool: true,
    })
    expect(params).not.toHaveProperty("active")
    expect(gisu?.chapters).toHaveLength(1)
    expect(gisu?.schools).toHaveLength(1)
  })
})
