export type LoginMode = "auth-app" | "direct"

export type UnauthenticatedPolicy = "ignore" | "login"

export type AuthClientConfig = {
  apiBaseUrl: string
  authAppUrl: string
  clientId: string
  redirectUri: string
  loginMode: LoginMode
}

export type SsoMember = {
  id?: number
  [key: string]: unknown
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type TokenResponse = TokenPair & {
  expiresIn?: number
  linkedOAuthProviders?: string[]
  member?: SsoMember
  tokenType?: string
}

export type AuthLocation = {
  origin: string
  href: string
  assign: (url: string) => void
}

export type AuthClientDeps = {
  fetch?: typeof fetch
  location?: AuthLocation
}

export type ApiFetch = <T>(path: string, init?: RequestInit) => Promise<T>

export type AuthClient = {
  config: AuthClientConfig
  clearSession: () => void
  createApiFetch: () => ApiFetch
  devLogin: (
    email: string,
    password: string,
    returnTo?: string,
  ) => Promise<void>
  getAccessToken: () => string | null
  getMember: () => SsoMember | null
  getRefreshToken: () => string | null
  handleCallback: (currentUrl?: string) => Promise<string>
  hasSsoSession: () => Promise<boolean>
  logout: (options?: {
    global?: boolean
    /** global 로그아웃 후 인증 앱이 돌아올 주소. 없으면 현재 origin. */
    returnTo?: string
  }) => Promise<void>
  recoverFromUnauthorized: () => Promise<string>
  renewAccessToken: () => Promise<string>
  setTokens: (
    tokens: TokenPair & {
      member?: SsoMember | null
    },
  ) => void
  startLogin: (returnTo?: string) => Promise<void>
}
