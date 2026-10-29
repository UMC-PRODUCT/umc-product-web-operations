import type { AuthClientConfig, LoginMode } from "@/lib/auth-client"

export type SsoRuntimeEnv = {
  alphaApiBaseUrl?: string
  authAppUrl?: string
  loginMode?: string
}

const LOCAL_ORIGIN = "http://localhost:5173"
const DEV_ADMIN_ORIGIN = "https://dev.admin.university.neordinary.com"
const PROD_ADMIN_ORIGIN = "https://admin.university.neordinary.com"

export function resolveSsoEnv(
  origin: string,
  runtime: SsoRuntimeEnv = {},
): AuthClientConfig {
  const redirectUri = `${origin}/auth/callback`

  if (origin === LOCAL_ORIGIN) {
    return {
      apiBaseUrl: "",
      authAppUrl: present(runtime.authAppUrl) ?? "http://localhost:5174",
      clientId: "local",
      loginMode: localLoginMode(runtime.loginMode),
      redirectUri,
    }
  }

  if (origin === DEV_ADMIN_ORIGIN) {
    const apiBaseUrl = present(runtime.alphaApiBaseUrl)
    const authAppUrl = present(runtime.authAppUrl)
    // TODO: alpha api 호스트와 개발 배포 인증 앱 주소는 아직 확정되지 않았다.
    if (!apiBaseUrl) {
      throw new Error(
        "dev admin SSO api 주소가 없습니다. VITE_ALPHA_API_BASE_URL을 설정하세요. TODO: alpha api 호스트는 미확정입니다.",
      )
    }
    if (!authAppUrl) {
      throw new Error(
        "개발 배포 인증 앱 주소가 없습니다. VITE_AUTH_APP_URL을 설정하세요. TODO: 개발 인증 앱 호스트는 미확정입니다.",
      )
    }
    return {
      apiBaseUrl,
      authAppUrl,
      clientId: "backoffice",
      loginMode: "auth-app",
      redirectUri,
    }
  }

  if (origin === PROD_ADMIN_ORIGIN) {
    return {
      apiBaseUrl: "https://api.university.neordinary.com",
      authAppUrl: "https://auth.university.neordinary.com",
      clientId: "backoffice",
      loginMode: "auth-app",
      redirectUri,
    }
  }

  throw new Error(`SSO를 시작할 수 없는 origin입니다: ${origin}`)
}

export function readSsoRuntimeEnv(): SsoRuntimeEnv {
  return {
    alphaApiBaseUrl: import.meta.env.VITE_ALPHA_API_BASE_URL,
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
