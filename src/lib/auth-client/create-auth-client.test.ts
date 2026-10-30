import { afterEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "./api-error"
import { createAuthClient } from "./create-auth-client"
import { SSO_STORAGE } from "./storage-keys"

import type { AuthClientConfig, AuthLocation } from "./types"

const LOCAL: AuthClientConfig = {
  apiBaseUrl: "",
  authAppUrl: "http://localhost:5174",
  clientId: "local",
  loginMode: "direct",
  redirectUri: "http://localhost:5173/auth/callback",
}

function location(origin: string, href = `${origin}/`): AuthLocation {
  return {
    assign: vi.fn(),
    href,
    origin,
    replace: vi.fn(),
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  })
}

function envelope(result: unknown, status = 200, code = "OK") {
  return jsonResponse(
    {
      code,
      message: code,
      result,
      success: status < 400,
    },
    status,
  )
}

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe("startLogin", () => {
  it("sends the browser to the api authorize url in direct mode", async () => {
    const browser = location("http://localhost:5173")
    const client = createAuthClient(
      LOCAL,
      { onUnauthenticated: "ignore" },
      {
        location: browser,
      },
    )

    await client.startLogin("/notices")

    const target = String(vi.mocked(browser.replace).mock.calls[0]?.[0])
    const url = new URL(target, browser.origin)
    expect(url.pathname).toBe("/api/v1/auth/sso/oauth/authorize")
    expect(url.searchParams.get("client_id")).toBe("local")
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:5173/auth/callback",
    )
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("code_verifier")).toBeNull()
    expect(sessionStorage.getItem(SSO_STORAGE.returnTo)).toBe("/notices")
    expect(sessionStorage.getItem(SSO_STORAGE.codeVerifier)).toBeTruthy()
  })

  it("sends the browser to the auth app in auth-app mode", async () => {
    const browser = location("https://admin.university.neordinary.com")
    const client = createAuthClient(
      {
        apiBaseUrl: "https://api.university.neordinary.com",
        authAppUrl: "https://auth.university.neordinary.com",
        clientId: "backoffice",
        loginMode: "auth-app",
        redirectUri: "https://admin.university.neordinary.com/auth/callback",
      },
      { onUnauthenticated: "login" },
      { location: browser },
    )

    await client.startLogin()

    const target = String(vi.mocked(browser.replace).mock.calls[0]?.[0])
    const url = new URL(target)
    expect(url.origin).toBe("https://auth.university.neordinary.com")
    expect(url.pathname).toBe("/authorize")
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://admin.university.neordinary.com/auth/callback",
    )
    expect(url.searchParams.get("client_id")).toBe("backoffice")
  })
})

describe("handleCallback", () => {
  it("does not call the token api when state does not match", async () => {
    const fetchMock = vi.fn()
    const browser = location("http://localhost:5173")
    const client = createAuthClient(
      LOCAL,
      { onUnauthenticated: "ignore" },
      {
        fetch: fetchMock,
        location: browser,
      },
    )
    sessionStorage.setItem(SSO_STORAGE.state, "expected")
    sessionStorage.setItem(SSO_STORAGE.codeVerifier, "verifier")
    sessionStorage.setItem(SSO_STORAGE.returnTo, "/notices")

    await expect(
      client.handleCallback(
        "http://localhost:5173/auth/callback?code=abc&state=other",
      ),
    ).rejects.toMatchObject({ code: "SSO_STATE_MISMATCH" })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(SSO_STORAGE.state)).toBeNull()
    expect(sessionStorage.getItem(SSO_STORAGE.codeVerifier)).toBeNull()
    expect(sessionStorage.getItem(SSO_STORAGE.returnTo)).toBeNull()
  })

  it.each(["AUTHENTICATION-0034", "AUTHENTICATION-0035"])(
    "restarts login when the token api returns %s",
    async (code) => {
      const browser = location("http://localhost:5173")
      const fetchMock = vi.fn(async () => envelope(null, 401, code))
      const client = createAuthClient(
        LOCAL,
        { onUnauthenticated: "ignore" },
        {
          fetch: fetchMock,
          location: browser,
        },
      )
      sessionStorage.setItem(SSO_STORAGE.state, "state-1")
      sessionStorage.setItem(SSO_STORAGE.codeVerifier, "verifier-1")
      sessionStorage.setItem(SSO_STORAGE.returnTo, "/notices")

      await expect(
        client.handleCallback(
          "http://localhost:5173/auth/callback?code=once&state=state-1",
        ),
      ).rejects.toMatchObject({ code })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(browser.replace).toHaveBeenCalledTimes(1)
      expect(sessionStorage.getItem(SSO_STORAGE.state)).not.toBe("state-1")
      expect(sessionStorage.getItem(SSO_STORAGE.codeVerifier)).not.toBe(
        "verifier-1",
      )
      expect(sessionStorage.getItem(SSO_STORAGE.codeVerifier)).toBeTruthy()
    },
  )

  it("stores tokens and clears the oauth transaction", async () => {
    const browser = location("http://localhost:5173")
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.headers).toMatchObject({
          "Content-Type": "application/x-www-form-urlencoded",
        })
        const body = String(init?.body)
        expect(body).toContain("grant_type=authorization_code")
        expect(body).toContain("code=once")
        expect(body).toContain("code_verifier=verifier-1")
        return envelope({
          accessToken: "access-1",
          member: { id: 7 },
          refreshToken: "refresh-1",
        })
      },
    )
    const client = createAuthClient(
      LOCAL,
      { onUnauthenticated: "ignore" },
      {
        fetch: fetchMock,
        location: browser,
      },
    )
    sessionStorage.setItem(SSO_STORAGE.state, "state-1")
    sessionStorage.setItem(SSO_STORAGE.codeVerifier, "verifier-1")
    sessionStorage.setItem(SSO_STORAGE.returnTo, "/notices")

    await expect(
      client.handleCallback(
        "http://localhost:5173/auth/callback?code=once&state=state-1",
      ),
    ).resolves.toBe("/notices")

    expect(client.getAccessToken()).toBe("access-1")
    expect(client.getRefreshToken()).toBe("refresh-1")
    expect(localStorage.getItem(SSO_STORAGE.refreshToken)).toBe("refresh-1")
    expect(sessionStorage.getItem(SSO_STORAGE.refreshToken)).toBeNull()
    expect(sessionStorage.getItem(SSO_STORAGE.state)).toBeNull()
    expect(sessionStorage.getItem(SSO_STORAGE.codeVerifier)).toBeNull()
    expect(sessionStorage.getItem(SSO_STORAGE.returnTo)).toBeNull()
  })
})

describe("createApiFetch", () => {
  it("renews once for three concurrent 401 responses", async () => {
    const browser = location(
      "http://localhost:5173",
      "http://localhost:5173/notices",
    )
    let renewCount = 0
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes("/token/renew")) {
          renewCount += 1
          const body = JSON.parse(String(init?.body)) as {
            refreshToken?: string
          }
          expect(body.refreshToken).toBe("refresh-1")
          return envelope({
            accessToken: "access-2",
            refreshToken: "refresh-2",
          })
        }
        const authorization = new Headers(init?.headers).get("Authorization")
        if (authorization === "Bearer access-2") {
          return envelope({ ok: true })
        }
        return envelope(null, 401, "AUTHENTICATION-0032")
      },
    )
    const client = createAuthClient(
      LOCAL,
      { onUnauthenticated: "login" },
      {
        fetch: fetchMock,
        location: browser,
      },
    )
    client.setTokens({ accessToken: "access-1", refreshToken: "refresh-1" })
    const apiFetch = client.createApiFetch()

    const results = await Promise.all([
      apiFetch("/api/v1/notices"),
      apiFetch("/api/v1/notices"),
      apiFetch("/api/v1/notices"),
    ])

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }])
    expect(renewCount).toBe(1)
    expect(client.getRefreshToken()).toBe("refresh-2")
    expect(browser.replace).not.toHaveBeenCalled()
  })

  it("starts login when renew fails and the policy is login", async () => {
    const browser = location(
      "http://localhost:5173",
      "http://localhost:5173/notices",
    )
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("/token/renew")) {
        return envelope(null, 401, "AUTHENTICATION-0032")
      }
      return envelope(null, 401, "AUTHENTICATION-0032")
    })
    const client = createAuthClient(
      LOCAL,
      { onUnauthenticated: "login" },
      {
        fetch: fetchMock,
        location: browser,
      },
    )
    client.setTokens({ accessToken: "access-1", refreshToken: "refresh-1" })

    await expect(
      client.createApiFetch()("/api/v1/notices"),
    ).rejects.toBeInstanceOf(ApiError)

    expect(browser.replace).toHaveBeenCalledTimes(1)
    expect(client.getRefreshToken()).toBeNull()
  })

  it("throws a 401 ApiError without starting login when the policy is ignore", async () => {
    const browser = location("http://localhost:5173")
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("/token/renew")) {
        return envelope(null, 401, "AUTHENTICATION-0032")
      }
      return envelope(null, 401, "AUTHENTICATION-0032")
    })
    const client = createAuthClient(
      LOCAL,
      { onUnauthenticated: "ignore" },
      {
        fetch: fetchMock,
        location: browser,
      },
    )
    client.setTokens({ accessToken: "access-1", refreshToken: "refresh-1" })

    await expect(
      client.createApiFetch()("/api/v1/notices"),
    ).rejects.toMatchObject({
      code: "AUTHENTICATION-0032",
      name: "ApiError",
      status: 401,
    })
    expect(browser.replace).not.toHaveBeenCalled()
  })
})
