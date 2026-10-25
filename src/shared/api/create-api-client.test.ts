import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { clearAccessToken, setAccessToken } from "./access-token"
import { api } from "./client"
import { createApiClient, resolveApiBaseURL } from "./create-api-client"

function jsonAdapter(body: unknown) {
  return async (config: InternalAxiosRequestConfig) => ({
    data: body,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  })
}

describe("resolveApiBaseURL", () => {
  it("appends /api when the base url is only the origin", () => {
    expect(resolveApiBaseURL("https://api-dev.university.neordinary.com")).toBe(
      "https://api-dev.university.neordinary.com/api",
    )
  })

  it("keeps a base url that already ends with /api", () => {
    expect(resolveApiBaseURL("/api")).toBe("/api")
    expect(resolveApiBaseURL("https://example.test/api/")).toBe(
      "https://example.test/api",
    )
  })
})

describe("createApiClient", () => {
  afterEach(() => {
    clearAccessToken()
    api.defaults.adapter = undefined
  })

  it("rejects when the response body has success: false", async () => {
    const client = createApiClient("https://example.test")
    client.defaults.adapter = jsonAdapter({
      success: false,
      code: "COMMON-0001",
      message: "요청에 실패했어요",
      result: null,
    })

    await expect(client.get("/v1/members")).rejects.toMatchObject({
      message: "요청에 실패했어요",
      code: AxiosError.ERR_BAD_RESPONSE,
    })
  })

  it("returns the response when success is true", async () => {
    const client = createApiClient("https://example.test")
    client.defaults.adapter = jsonAdapter({
      success: true,
      code: "COMMON-0000",
      message: "성공",
      result: { id: 1 },
    })

    const { data } = await client.get("/v1/members")

    expect(data.result).toEqual({ id: 1 })
  })

  it("attaches a bearer token when one is set", async () => {
    let authorization: unknown
    api.defaults.adapter = async (config) => {
      authorization = config.headers.get("Authorization")
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }
    setAccessToken("access-token")

    await api.get("/v1/members")

    expect(authorization).toBe("Bearer access-token")
  })
})
