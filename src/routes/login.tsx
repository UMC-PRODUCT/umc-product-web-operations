import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense, useEffect, useState } from "react"

import { getSsoClient } from "@/shared/auth/sso-client"

const DevLoginForm = import.meta.env.DEV
  ? lazy(() =>
      import("@/lib/auth-client/react").then((module) => ({
        default: module.DevLoginForm,
      })),
    )
  : null

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const redirectTo = search.redirect
    if (
      typeof redirectTo === "string" &&
      redirectTo.startsWith("/") &&
      !redirectTo.startsWith("//")
    ) {
      return { redirect: redirectTo }
    }
    return {}
  },
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const returnTo = redirectTo ?? "/notices"
  const [phase, setPhase] = useState<"checking" | "form" | "error">("checking")

  useEffect(() => {
    const client = getSsoClient()
    if (client.config.loginMode === "auth-app") {
      void client.startLogin(returnTo)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const signedIn = await client.hasSsoSession()
        if (cancelled) {
          return
        }
        if (signedIn) {
          await client.startLogin(returnTo)
          return
        }
        setPhase("form")
      } catch {
        if (!cancelled) {
          setPhase("error")
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [returnTo])

  if (phase === "form" && import.meta.env.DEV && DevLoginForm) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Suspense fallback={<p>로그인 중</p>}>
          <DevLoginForm
            onSubmit={({ email, password }) =>
              getSsoClient().devLogin(email, password, returnTo)
            }
          />
        </Suspense>
      </div>
    )
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p role="alert">로그인 상태를 확인하지 못했습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p>로그인 중</p>
    </div>
  )
}
