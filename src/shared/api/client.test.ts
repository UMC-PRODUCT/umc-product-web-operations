import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./access-token"
import { api } from "./client"

function unauthorized(config: InternalAxiosRequestConfig) {
  const error = new AxiosError("Unauthorized")
  error.config = config
  error.response = {
    data: { message: "만료" },
    status: 401,
    statusText: "Unauthorized",
    headers: {},
    config,
  }
  return error
}

describe("api 401 refresh", () => {
  afterEach(() => {
    clearAuthSession()
    api.defaults.adapter = undefined
  })

  it("renews the access token and retries the original request once", async () => {
    const urls: string[] = []
    setAccessToken("expired")
    setRefreshToken("refresh-1")
    api.defaults.adapter = async (config) => {
      urls.push(config.url ?? "")
      if (config.url?.includes("/v1/auth/token/renew")) {
        expect(config.headers.get("Authorization")).toBeUndefined()
        return {
          data: { accessToken: "next-access", refreshToken: "refresh-2" },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        }
      }
      if (!config._retry) {
        throw unauthorized(config)
      }
      return {
        data: { ok: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }
    }

    const { data } = await api.get("/v1/member/me")

    expect(data).toEqual({ ok: true })
    expect(urls).toEqual([
      "/v1/member/me",
      "/v1/auth/token/renew",
      "/v1/member/me",
    ])
    expect(getAccessToken()).toBe("next-access")
    expect(getRefreshToken()).toBe("refresh-2")
  })

  it("does not refresh when login itself returns 401", async () => {
    const urls: string[] = []
    setRefreshToken("refresh-1")
    api.defaults.adapter = async (config) => {
      urls.push(config.url ?? "")
      throw unauthorized(config)
    }

    await expect(api.post("/v1/auth/login/email", {})).rejects.toBeTruthy()

    expect(urls).toEqual(["/v1/auth/login/email"])
    expect(getRefreshToken()).toBe("refresh-1")
  })
})
