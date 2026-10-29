import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { ApiError } from "@/lib/auth-client"
import { getSsoClient } from "@/shared/auth/sso-client"

const callbackTasks = new Map<string, Promise<string>>()

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
})

function CallbackPage() {
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const currentUrl = window.location.href
    const code = new URL(currentUrl).searchParams.get("code") ?? ""
    const existing = callbackTasks.get(code)
    const task = existing ?? getSsoClient().handleCallback(currentUrl)
    if (!existing) {
      callbackTasks.set(code, task)
    }

    let cancelled = false
    void task.then(
      (path) => {
        if (cancelled) {
          return
        }
        router.history.replace(path)
      },
      (error: unknown) => {
        if (
          error instanceof ApiError &&
          (error.code === "AUTHENTICATION-0034" ||
            error.code === "AUTHENTICATION-0035")
        ) {
          return
        }
        if (!cancelled) {
          setFailed(true)
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p>
        {failed ? "로그인에 실패했습니다. 다시 시도해 주세요." : "로그인 중"}
      </p>
    </div>
  )
}
