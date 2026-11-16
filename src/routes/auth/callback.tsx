import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { getSsoClient } from "@/shared/auth/sso-client"
import { FullPageError } from "@/shared/ui/full-page-error"
import { AuthBusyScreen } from "@/shared/ui/loading-spinner"

export const Route = createFileRoute("/auth/callback")({
  component: CallbackPage,
})

function CallbackPage() {
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    getSsoClient()
      .handleCallback(window.location.href)
      .then(
        (result) => {
          if (!cancelled && result.status === "success") {
            router.history.replace(result.returnTo)
          }
        },
        () => {
          if (!cancelled) {
            setFailed(true)
          }
        },
      )

    return () => {
      cancelled = true
    }
  }, [router])

  if (failed) {
    return (
      <FullPageError
        body="다시 시도해 주세요."
        title="로그인에 실패했습니다."
      />
    )
  }

  return <AuthBusyScreen label="로그인 중" />
}
