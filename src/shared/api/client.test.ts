import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it, vi } from "vitest"

import { getSsoClient } from "@/shared/auth/sso-client"

import { api } from "./client"

function unauthorized(config: InternalAxiosRequestConfig) {
  const error = new AxiosError("Unauthorized")
  error.config = config
  error.response = {
    config,
    data: { message: "만료" },
    headers: {},
    status: 401,
    statusText: "Unauthorized",
  }
  return error
}

describe("api 401 refresh", () => {
  afterEach(() => {
    getSsoClient().clearSession()
    api.defaults.adapter = undefined
    vi.unstubAllGlobals()
  })

  it("renews the access token and retries the original request once", async () => {
    const urls: string[] = []
    getSsoClient().setTokens({
      accessToken: "expired",
      refreshToken: "refresh-1",
    })
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toContain("/v1/auth/token/renew")
        expect(new Headers(init?.headers).get("Authorization")).toBeNull()
        return new Response(
          JSON.stringify({
            result: { accessToken: "next-access", refreshToken: "refresh-2" },
            success: true,
          }),
          { status: 200 },
        )
      }),
    )
    api.defaults.adapter = async (config) => {
      urls.push(config.url ?? "")
      if (!config._retry) {
        throw unauthorized(config)
      }
      expect(config.headers.get("Authorization")).toBe("Bearer next-access")
      return {
        config,
        data: { ok: true },
        headers: {},
        status: 200,
        statusText: "OK",
      }
    }

    const { data } = await api.get("/v1/member/me")

    expect(data).toEqual({ ok: true })
    expect(urls).toEqual(["/v1/member/me", "/v1/member/me"])
    expect(getSsoClient().getAccessToken()).toBe("next-access")
    expect(getSsoClient().getRefreshToken()).toBe("refresh-2")
  })

  it("does not refresh when sso login itself returns 401", async () => {
    const urls: string[] = []
    getSsoClient().setTokens({
      accessToken: "access",
      refreshToken: "refresh-1",
    })
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    api.defaults.adapter = async (config) => {
      urls.push(config.url ?? "")
      throw unauthorized(config)
    }

    await expect(api.post("/v1/auth/sso/email", {})).rejects.toBeTruthy()

    expect(urls).toEqual(["/v1/auth/sso/email"])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(getSsoClient().getRefreshToken()).toBe("refresh-1")
  })
})
