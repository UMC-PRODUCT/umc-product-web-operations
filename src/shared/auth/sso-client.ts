import { createAuthClient } from "@/lib/auth-client"

import { readSsoRuntimeEnv, resolveSsoEnv } from "./resolve-sso-env"

import type { AuthClient } from "@/lib/auth-client"

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
