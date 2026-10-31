import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

import { listGisus } from "./gisu-list.api"

describe("listGisus", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("requests GISU-101 with generation desc sort", async () => {
    let url = ""
    api.defaults.adapter = async (config) => {
      url = config.url ?? ""
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: {
            content: [
              {
                gisuId: "9",
                generation: "11",
                isActive: true,
              },
            ],
            page: 0,
            size: 50,
            totalElements: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    const page = await listGisus()

    expect(url).toContain("/v1/gisu?")
    expect(url).toContain("page=0")
    expect(url).toContain("size=50")
    expect(url).toContain("sort=generation%2Cdesc")
    expect(page.content).toEqual([
      { gisuId: 9, generation: 11, isActive: true, gisu: undefined },
    ])
  })
})
