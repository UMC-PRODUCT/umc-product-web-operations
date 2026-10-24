import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
} from "@/shared/api/access-token"
import { api } from "@/shared/api/client"

import { loginByEmail } from "./login"

describe("loginByEmail", () => {
  afterEach(() => {
    clearAuthSession()
    api.defaults.adapter = undefined
  })

  it("stores tokens from the login payload", async () => {
    let body: unknown
    api.defaults.adapter = async (config) => {
      body = config.data
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: {
            memberId: 1,
            accessToken: "access",
            refreshToken: "refresh",
          },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await loginByEmail({ email: "admin@umc.com", password: "secret" })

    expect(JSON.parse(String(body))).toMatchObject({
      email: "admin@umc.com",
      password: "secret",
      clientType: "WEB",
    })
    expect(getAccessToken()).toBe("access")
    expect(getRefreshToken()).toBe("refresh")
  })
})
