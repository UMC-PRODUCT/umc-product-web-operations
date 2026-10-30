import { describe, expect, it } from "vitest"

import { resolveSsoEnv, resolveSsoStage } from "./resolve-sso-env"

describe("resolveSsoStage", () => {
  it("maps known admin origins", () => {
    expect(resolveSsoStage("http://localhost:5173")).toBe("local")
    expect(resolveSsoStage("https://dev.admin.university.neordinary.com")).toBe(
      "dev",
    )
    expect(resolveSsoStage("https://admin.university.neordinary.com")).toBe(
      "prod",
    )
  })

  it("rejects an origin that is not in the sso table", () => {
    expect(() => resolveSsoStage("https://evil.example")).toThrow(/origin/)
  })
})

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

  it("allows local auth app url and login mode overrides", () => {
    expect(
      resolveSsoEnv("http://localhost:5173", {
        authAppUrl: "http://localhost:4174",
        loginMode: "auth-app",
      }),
    ).toMatchObject({
      authAppUrl: "http://localhost:4174",
      loginMode: "auth-app",
    })
  })

  it("ignores loginMode override on deployed admin origins", () => {
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

  it("uses the fixed dev stage urls for dev admin", () => {
    expect(
      resolveSsoEnv("https://dev.admin.university.neordinary.com"),
    ).toEqual({
      apiBaseUrl: "https://api-dev.university.neordinary.com",
      authAppUrl: "https://dev.auth.university.neordinary.com",
      clientId: "backoffice",
      loginMode: "auth-app",
      redirectUri: "https://dev.admin.university.neordinary.com/auth/callback",
    })
  })

  it("rejects an origin that is not in the sso table", () => {
    expect(() => resolveSsoEnv("https://evil.example")).toThrow(/origin/)
  })
})
