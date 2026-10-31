import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

import { activateActiveGisu } from "./gisu-command.api"

describe("activateActiveGisu", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("posts GISU-003 active gisu command", async () => {
    let method = ""
    let url = ""
    api.defaults.adapter = async (config) => {
      method = config.method ?? ""
      url = config.url ?? ""
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: null,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await activateActiveGisu(9)

    expect(method).toBe("post")
    expect(url).toContain("/v1/gisu/9/active")
  })
})
