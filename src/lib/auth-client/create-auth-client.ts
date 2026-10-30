import { ApiError, isAuthCodeRestart } from "./api-error"
import { apiUrl, readApiResult } from "./http"
import {
  createCodeChallenge,
  createCodeVerifier,
  createRandomString,
} from "./pkce"
import { SSO_STORAGE } from "./storage-keys"

import type {
  ApiFetch,
  AuthClient,
  AuthClientConfig,
  AuthClientDeps,
  AuthLocation,
  SsoMember,
  TokenPair,
  TokenResponse,
  UnauthenticatedPolicy,
} from "./types"

const CALLBACK_PATH = "/auth/callback"

export function createAuthClient(
  config: AuthClientConfig,
  options: { onUnauthenticated: UnauthenticatedPolicy },
  deps?: AuthClientDeps,
): AuthClient {
  const fetchImpl =
    deps?.fetch ??
    ((input: RequestInfo | URL, init?: RequestInit) =>
      globalThis.fetch(input, init))
  const location = deps?.location ?? browserLocation()

  let accessToken: string | null = null
  let member: SsoMember | null = null
  let renewFlight: Promise<string> | null = null
  let recoverFlight: Promise<string> | null = null

  function getAccessToken() {
    return accessToken
  }

  function getRefreshToken() {
    return localStorage.getItem(SSO_STORAGE.refreshToken)
  }

  function getMember() {
    return member
  }

  function setTokens(tokens: TokenPair & { member?: SsoMember | null }) {
    accessToken = tokens.accessToken
    localStorage.setItem(SSO_STORAGE.refreshToken, tokens.refreshToken)
    if (tokens.member !== undefined) {
      member = tokens.member
    }
  }

  function clearOauthTransaction() {
    sessionStorage.removeItem(SSO_STORAGE.codeVerifier)
    sessionStorage.removeItem(SSO_STORAGE.state)
    sessionStorage.removeItem(SSO_STORAGE.returnTo)
  }

  function clearSession() {
    accessToken = null
    member = null
    localStorage.removeItem(SSO_STORAGE.refreshToken)
    clearOauthTransaction()
  }

  async function startLogin(returnTo?: string) {
    const redirectUri = `${location.origin}${CALLBACK_PATH}`
    if (config.redirectUri !== redirectUri) {
      throw new ApiError(
        "redirect_uri가 현재 origin과 다릅니다.",
        400,
        "SSO_REDIRECT_MISMATCH",
      )
    }

    const codeVerifier = createCodeVerifier()
    const codeChallenge = await createCodeChallenge(codeVerifier)
    const state = createRandomString(32)
    const nextReturnTo = safeReturnTo(returnTo)

    sessionStorage.setItem(SSO_STORAGE.codeVerifier, codeVerifier)
    sessionStorage.setItem(SSO_STORAGE.state, state)
    sessionStorage.setItem(SSO_STORAGE.returnTo, nextReturnTo)

    const params = new URLSearchParams({
      client_id: config.clientId,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      redirect_uri: redirectUri,
      response_type: "code",
      state,
    })
    const target =
      config.loginMode === "auth-app"
        ? `${trimTrailingSlash(config.authAppUrl)}/authorize?${params.toString()}`
        : `${apiUrl(config.apiBaseUrl, "/api/v1/auth/sso/oauth/authorize")}?${params.toString()}`

    // 로그인 시작 전 화면이 히스토리에 남지 않도록 replace 한다.
    location.replace(target)
  }

  async function handleCallback(currentUrl?: string) {
    const url = new URL(currentUrl ?? location.href)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")
    const storedState = sessionStorage.getItem(SSO_STORAGE.state)
    const codeVerifier = sessionStorage.getItem(SSO_STORAGE.codeVerifier)
    const returnTo = safeReturnTo(sessionStorage.getItem(SSO_STORAGE.returnTo))
    clearOauthTransaction()

    if (
      !code ||
      !state ||
      !storedState ||
      storedState !== state ||
      !codeVerifier
    ) {
      throw new ApiError(
        "로그인 상태가 일치하지 않습니다.",
        400,
        "SSO_STATE_MISMATCH",
      )
    }

    try {
      const tokens = await readApiResult<TokenResponse>(
        await fetchImpl(
          apiUrl(config.apiBaseUrl, "/api/v1/auth/sso/oauth/token"),
          {
            body: new URLSearchParams({
              client_id: config.clientId,
              code,
              code_verifier: codeVerifier,
              grant_type: "authorization_code",
              redirect_uri: config.redirectUri,
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
          },
        ),
      )
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new ApiError("토큰 응답이 올바르지 않습니다.", 401)
      }
      setTokens({
        accessToken: tokens.accessToken,
        member: tokens.member ?? null,
        refreshToken: tokens.refreshToken,
      })
      return returnTo
    } catch (error) {
      if (error instanceof ApiError && isAuthCodeRestart(error.code)) {
        await startLogin(returnTo)
      }
      throw error
    }
  }

  async function hasSsoSession() {
    const response = await fetchImpl(
      apiUrl(config.apiBaseUrl, "/api/v1/auth/sso/me"),
      {
        credentials: "include",
        method: "GET",
      },
    )
    if (response.status === 401) {
      return false
    }
    await readApiResult(response)
    return true
  }

  async function devLogin(email: string, password: string, returnTo?: string) {
    if (config.loginMode !== "direct") {
      throw new ApiError(
        "direct 모드에서만 개발 로그인을 사용할 수 있습니다.",
        400,
        "SSO_DIRECT_ONLY",
      )
    }
    await readApiResult(
      await fetchImpl(apiUrl(config.apiBaseUrl, "/api/v1/auth/sso/email"), {
        body: JSON.stringify({ email, password }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    )
    await startLogin(returnTo)
  }

  async function logout(logoutOptions?: {
    global?: boolean
    returnTo?: string
  }) {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) {
        await readApiResult(
          await fetchImpl(apiUrl(config.apiBaseUrl, "/api/v1/auth/logout"), {
            body: JSON.stringify({ refreshToken }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          }),
        )
      }
    } catch {
      // 폐기 요청이 실패해도 로컬 세션은 끊는다.
    }
    clearSession()
    if (logoutOptions?.global) {
      const url = new URL("/logout", ensureOrigin(config.authAppUrl))
      url.searchParams.set(
        "return_to",
        logoutOptions.returnTo ?? location.origin,
      )
      // 로그아웃 전 보호 화면이 뒤로가기로 다시 열리지 않게 한다.
      location.replace(url.toString())
    }
  }

  async function requestRenew() {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearSession()
      throw new ApiError(
        "refresh token이 없습니다.",
        401,
        "AUTHENTICATION-0032",
      )
    }
    try {
      const tokens = await readApiResult<TokenPair>(
        await fetchImpl(apiUrl(config.apiBaseUrl, "/api/v1/auth/token/renew"), {
          body: JSON.stringify({ refreshToken }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      )
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new ApiError("토큰 응답이 올바르지 않습니다.", 401)
      }
      accessToken = tokens.accessToken
      localStorage.setItem(SSO_STORAGE.refreshToken, tokens.refreshToken)
      return tokens.accessToken
    } catch (error) {
      clearSession()
      throw error
    }
  }

  function renewAccessToken() {
    if (!renewFlight) {
      renewFlight = requestRenew().finally(() => {
        renewFlight = null
      })
    }
    return renewFlight
  }

  function recoverFromUnauthorized() {
    if (!recoverFlight) {
      recoverFlight = (async () => {
        try {
          return await renewAccessToken()
        } catch (error) {
          if (options.onUnauthenticated === "login") {
            await startLogin(currentAppPath(location.href))
          }
          if (error instanceof ApiError) {
            throw new ApiError(error.message, 401, error.code)
          }
          throw new ApiError("인증이 만료되었습니다.", 401)
        } finally {
          recoverFlight = null
        }
      })()
    }
    return recoverFlight
  }

  function createApiFetch(): ApiFetch {
    return async function apiFetch<T>(path: string, init?: RequestInit) {
      const url = resolveRequestUrl(config.apiBaseUrl, path)
      let response = await fetchImpl(url, withBearer(init, accessToken))
      if (response.status === 401 && !url.includes("/v1/auth/token/renew")) {
        const token = await recoverFromUnauthorized()
        response = await fetchImpl(url, withBearer(init, token))
      }
      return readApiResult<T>(response)
    }
  }

  return {
    clearSession,
    config,
    createApiFetch,
    devLogin,
    getAccessToken,
    getMember,
    getRefreshToken,
    handleCallback,
    hasSsoSession,
    logout,
    recoverFromUnauthorized,
    renewAccessToken,
    setTokens,
    startLogin,
  }
}

function browserLocation(): AuthLocation {
  return {
    assign(url: string) {
      window.location.assign(url)
    },
    get href() {
      return window.location.href
    },
    get origin() {
      return window.location.origin
    },
    replace(url: string) {
      window.location.replace(url)
    },
  }
}

function resolveRequestUrl(apiBaseUrl: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  return apiUrl(apiBaseUrl, path)
}

function withBearer(
  init: RequestInit | undefined,
  token: string | null,
): RequestInit {
  const headers = new Headers(init?.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  } else {
    headers.delete("Authorization")
  }
  return { ...init, headers }
}

function currentAppPath(href: string) {
  try {
    const url = new URL(href)
    return safeReturnTo(`${url.pathname}${url.search}`)
  } catch {
    return "/"
  }
}

function safeReturnTo(value: string | null | undefined) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value
  }
  return "/"
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

function ensureOrigin(authAppUrl: string) {
  return trimTrailingSlash(authAppUrl)
}
