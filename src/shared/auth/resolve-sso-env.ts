import type { AuthClientConfig, LoginMode } from "@/lib/auth-client"

export type SsoStage = "local" | "dev" | "prod"

export type SsoRuntimeEnv = {
  /** localhost에서만 의미 있음. 기본 http://localhost:5174 */
  authAppUrl?: string
  /** localhost에서만 의미 있음. 기본 direct */
  loginMode?: string
}

const LOCAL_AUTH_APP_URL = "http://localhost:5174"

const STAGE_URLS = {
  local: {
    apiBaseUrl: "",
    authAppUrl: LOCAL_AUTH_APP_URL,
  },
  dev: {
    apiBaseUrl: "https://api-dev.university.neordinary.com",
    authAppUrl: "https://dev.auth.university.neordinary.com",
  },
  prod: {
    apiBaseUrl: "https://api.university.neordinary.com",
    authAppUrl: "https://auth.university.neordinary.com",
  },
} as const satisfies Record<
  SsoStage,
  { apiBaseUrl: string; authAppUrl: string }
>

/** 이 백오피스가 SSO를 허용하는 origin (scheme + host + port). */
const ADMIN_ORIGINS: Record<string, SsoStage> = {
  "http://localhost:5173": "local",
  "https://dev.admin.university.neordinary.com": "dev",
  "https://admin.university.neordinary.com": "prod",
}

const CLIENT_ID: Record<SsoStage, string> = {
  local: "local",
  dev: "backoffice",
  prod: "backoffice",
}

export function resolveSsoStage(origin: string): SsoStage {
  const stage = ADMIN_ORIGINS[origin]
  if (!stage) {
    throw new Error(`SSO를 시작할 수 없는 origin입니다: ${origin}`)
  }
  return stage
}

export function resolveSsoEnv(
  origin: string,
  runtime: SsoRuntimeEnv = {},
): AuthClientConfig {
  const stage = resolveSsoStage(origin)
  const urls = STAGE_URLS[stage]
  const redirectUri = `${origin}/auth/callback`

  if (stage === "local") {
    return {
      apiBaseUrl: urls.apiBaseUrl,
      authAppUrl: present(runtime.authAppUrl) ?? urls.authAppUrl,
      clientId: CLIENT_ID.local,
      loginMode: localLoginMode(runtime.loginMode),
      redirectUri,
    }
  }

  return {
    apiBaseUrl: urls.apiBaseUrl,
    authAppUrl: urls.authAppUrl,
    clientId: CLIENT_ID[stage],
    loginMode: "auth-app",
    redirectUri,
  }
}

export function readSsoRuntimeEnv(): SsoRuntimeEnv {
  return {
    authAppUrl: import.meta.env.VITE_AUTH_APP_URL,
    loginMode: import.meta.env.VITE_SSO_LOGIN_MODE,
  }
}

function localLoginMode(value: string | undefined): LoginMode {
  const mode = present(value)
  if (mode == null || mode === "direct") {
    return "direct"
  }
  if (mode === "auth-app") {
    return "auth-app"
  }
  throw new Error(`VITE_SSO_LOGIN_MODE 값이 올바르지 않습니다: ${mode}`)
}

function present(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
