import { describe, expect, it } from "vitest"

import { UnregisteredOriginError } from "@/lib/auth-client"

import { resolveSsoEnv } from "./resolve-sso-env"

describe("resolveSsoEnv", () => {
  it("uses the local client and auth-app mode on localhost", () => {
    expect(resolveSsoEnv("http://localhost:5173")).toEqual({
      apiBaseUrl: "",
      authAppUrl: "http://localhost:5174",
      clientId: "local",
      loginMode: "auth-app",
    })
  })

  it("uses the backoffice client on dev and prod admin origins", () => {
    expect(
      resolveSsoEnv("https://dev.admin.university.neordinary.com"),
    ).toMatchObject({
      apiBaseUrl: "https://api-dev.university.neordinary.com",
      clientId: "backoffice",
      loginMode: "auth-app",
    })
    expect(
      resolveSsoEnv("https://admin.university.neordinary.com", {
        loginMode: "direct",
      }),
    ).toMatchObject({
      apiBaseUrl: "https://api.university.neordinary.com",
      clientId: "backoffice",
      loginMode: "auth-app",
    })
  })

  it("rejects an origin that is not in the admin table", () => {
    expect(() => resolveSsoEnv("https://evil.example")).toThrow(
      UnregisteredOriginError,
    )
  })
})
