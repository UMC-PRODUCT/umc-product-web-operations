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
        search: { redirect: location.href },
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
        // 다른 서비스의 로그인까지 끊지 않도록 SSO 세션은 남기고 이 앱의 토큰만 지운다.
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
          search: { redirect: location.href },
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
