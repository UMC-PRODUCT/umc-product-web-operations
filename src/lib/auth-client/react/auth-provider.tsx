import { createContext, useContext, useEffect, useMemo, useState } from "react"

import type { ReactNode } from "react"

import type { AuthClient, SsoMember } from "../types"

type AuthStatus = "anonymous" | "authenticated" | "loading"

type AuthContextValue = {
  login: (returnTo?: string) => Promise<void>
  logout: () => Promise<void>
  member: SsoMember | null
  status: AuthStatus
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthClientProvider({
  children,
  client,
}: {
  children: ReactNode
  client: AuthClient
}) {
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [member, setMember] = useState<SsoMember | null>(null)

  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!client.getRefreshToken()) {
        if (!cancelled) {
          setMember(null)
          setStatus("anonymous")
        }
        return
      }

      try {
        await client.renewAccessToken()
        if (!cancelled) {
          setMember(client.getMember())
          setStatus("authenticated")
        }
      } catch {
        if (!cancelled) {
          setMember(null)
          setStatus("anonymous")
        }
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [client])

  const value = useMemo<AuthContextValue>(
    () => ({
      login: (returnTo) => client.startLogin(returnTo),
      logout: () => client.logout({ global: true }),
      member,
      status,
    }),
    [client, member, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("AuthClientProvider가 필요합니다.")
  }
  return value
}
