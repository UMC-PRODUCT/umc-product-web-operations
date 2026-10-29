import { describe, expect, it } from "vitest"

import { resolveSsoEnv } from "./resolve-sso-env"

describe("resolveSsoEnv", () => {
  it("uses the local client and an empty api base on localhost", () => {
    expect(resolveSsoEnv("http://localhost:5173")).toEqual({
      apiBaseUrl: "",
      authAppUrl: "http://localhost:5174",
      clientId: "local",
      loginMode: "direct",
      redirectUri: "http://localhost:5173/auth/callback",
    })
  })

  it("keeps direct mode off origins other than localhost", () => {
    expect(
      resolveSsoEnv("https://admin.university.neordinary.com", {
        loginMode: "direct",
      }),
    ).toMatchObject({
      apiBaseUrl: "https://api.university.neordinary.com",
      authAppUrl: "https://auth.university.neordinary.com",
      clientId: "backoffice",
      loginMode: "auth-app",
      redirectUri: "https://admin.university.neordinary.com/auth/callback",
    })
  })

  it("requires the unconfirmed alpha api and auth app urls for dev admin", () => {
    expect(() =>
      resolveSsoEnv("https://dev.admin.university.neordinary.com"),
    ).toThrow(/alpha api/)
    expect(
      resolveSsoEnv("https://dev.admin.university.neordinary.com", {
        alphaApiBaseUrl: "https://alpha.example.test",
        authAppUrl: "https://auth-dev.example.test",
      }),
    ).toMatchObject({
      apiBaseUrl: "https://alpha.example.test",
      authAppUrl: "https://auth-dev.example.test",
      clientId: "backoffice",
      loginMode: "auth-app",
    })
  })

  it("rejects an origin that is not in the sso table", () => {
    expect(() => resolveSsoEnv("https://evil.example")).toThrow(/origin/)
  })
})
