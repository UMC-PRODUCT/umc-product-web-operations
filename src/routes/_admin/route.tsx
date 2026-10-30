import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"
import { isAxiosError } from "axios"

import {
  AdminGateError,
  adminSessionQueryKey,
  adminSessionQueryOptions,
  clearAdminSession,
  ForbiddenNotice,
  isOperator,
  markOperatorOnlyLoginNotice,
} from "@/features/auth"
import { ApiError } from "@/lib/auth-client"
import { getSsoClient } from "@/shared/auth/sso-client"
import { AuthBusyScreen } from "@/shared/ui/loading-spinner"
import { AdminShell } from "@/widgets/admin-shell/AdminShell"

import type { ErrorComponentProps } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ context, location }) => {
    const client = getSsoClient()
    if (!client.getAccessToken() && !client.getRefreshToken()) {
      throw redirect({
        replace: true,
        search: { redirect: location.pathname },
        to: "/login",
      })
    }

    try {
      const session = await context.queryClient.ensureQueryData(
        adminSessionQueryOptions(),
      )
      if (!isOperator(session)) {
        context.queryClient.removeQueries({ queryKey: adminSessionQueryKey })
        markOperatorOnlyLoginNotice()
        const returnTo = `${window.location.origin}/login`
        if (client.config.loginMode === "auth-app") {
          // 인증 앱 로그아웃으로 이동한 뒤 return_to로 /login 에 돌아온다.
          // 여기서 로컬 redirect를 던지면 assign이 가로채질 수 있다.
          await client.logout({ global: true, returnTo })
          await new Promise<never>(() => {})
        }
        await client.logout()
        throw redirect({ replace: true, to: "/login" })
      }
      return { session }
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      if (isAxiosError(error) && error.response?.status === 403) {
        throw new AdminGateError("forbidden")
      }
      if (error instanceof ApiError) {
        throw new AdminGateError("signing-in")
      }
      if (!client.getAccessToken() && !client.getRefreshToken()) {
        clearAdminSession(context.queryClient)
        throw redirect({
          replace: true,
          search: { redirect: location.pathname },
          to: "/login",
        })
      }
      throw error
    }
  },
  component: AdminRoute,
  errorComponent: AdminError,
})

function AdminRoute() {
  return <AdminShell />
}

function AdminError({ error }: ErrorComponentProps) {
  if (error instanceof AdminGateError && error.gate === "forbidden") {
    return <ForbiddenNotice />
  }
  if (error instanceof AdminGateError) {
    return <AuthBusyScreen label="로그인 중" />
  }
  throw error
}
