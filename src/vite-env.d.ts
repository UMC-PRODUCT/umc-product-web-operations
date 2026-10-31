/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_APP_URL?: string
  readonly VITE_DEV_API_PROXY_TARGET?: string
  readonly VITE_SSO_LOGIN_MODE?: "auth-app" | "direct"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
