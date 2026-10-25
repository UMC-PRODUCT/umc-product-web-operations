import { afterEach, describe, expect, it } from "vitest"

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./access-token"

describe("auth tokens", () => {
  afterEach(() => {
    clearAuthSession()
  })

  it("keeps the access token in memory and the refresh token in sessionStorage", () => {
    setAccessToken("access")
    setRefreshToken("refresh")

    expect(getAccessToken()).toBe("access")
    expect(getRefreshToken()).toBe("refresh")
    expect(sessionStorage.getItem("umc.operation.refreshToken")).toBe("refresh")
  })

  it("clears both tokens", () => {
    setAccessToken("access")
    setRefreshToken("refresh")

    clearAuthSession()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
