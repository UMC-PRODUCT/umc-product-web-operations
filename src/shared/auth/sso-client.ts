import { createAuthClient } from "@umc-product/auth-client"

import { readSsoRuntimeEnv, resolveSsoEnv } from "./resolve-sso-env"

import type { AuthClient } from "@umc-product/auth-client"

let client: AuthClient | null = null

export function getSsoClient() {
  if (!client) {
    client = createAuthClient(
      resolveSsoEnv(window.location.origin, readSsoRuntimeEnv()),
      { onUnauthenticated: "login" },
    )
  }
  return client
}
