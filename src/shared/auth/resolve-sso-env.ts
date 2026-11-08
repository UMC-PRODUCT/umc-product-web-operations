import { resolveAuthConfig } from "@umc-product/auth-client"

import type {
  AuthClientConfig,
  ResolveAuthConfigInput,
  SsoStage,
} from "@umc-product/auth-client"

export type SsoRuntimeEnv = {
  /** localhost에서만 의미 있음. 기본 http://localhost:5174 */
  authAppUrl?: string
  /** localhost에서만 의미 있음. 기본 auth-app */
  loginMode?: string
  /**
   * 유사시 stage별 API·인증 앱 URL 덮어쓰기.
   * 평소에는 쓰지 않고, 패키지 `SSO_STAGES` 배포 전 임시 대응용.
   */
  stageUrls?: ResolveAuthConfigInput["stageUrls"]
}

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

export function resolveSsoEnv(
  origin: string,
  runtime: SsoRuntimeEnv = {},
): AuthClientConfig {
  return resolveAuthConfig({
    clientIds: CLIENT_ID,
    local: {
      authAppUrl: runtime.authAppUrl,
      loginMode: runtime.loginMode,
    },
    origin,
    origins: ADMIN_ORIGINS,
    stageUrls: runtime.stageUrls,
  })
}

export function readSsoRuntimeEnv(): SsoRuntimeEnv {
  return {
    authAppUrl: import.meta.env.VITE_AUTH_APP_URL,
    loginMode: import.meta.env.VITE_SSO_LOGIN_MODE,
  }
}
