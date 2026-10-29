import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"
import { isAxiosError } from "axios"

import {
  AdminGateError,
  adminSessionQueryOptions,
  clearAdminSession,
  ForbiddenNotice,
  isOperator,
  OperatorOnlyNotice,
} from "@/features/auth"
import { ApiError } from "@/lib/auth-client"
import { getSsoClient } from "@/shared/auth/sso-client"
import { AdminShell } from "@/widgets/admin-shell/AdminShell"

import type { ErrorComponentProps } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ context, location }) => {
    const client = getSsoClient()
    if (!client.getAccessToken() && !client.getRefreshToken()) {
      throw redirect({
        search: { redirect: location.pathname },
        to: "/login",
      })
    }

    try {
      const session = await context.queryClient.ensureQueryData(
        adminSessionQueryOptions(),
      )
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
  const { session } = Route.useRouteContext()
  if (!isOperator(session)) {
    return <OperatorOnlyNotice />
  }
  return <AdminShell />
}

function AdminError({ error }: ErrorComponentProps) {
  if (error instanceof AdminGateError && error.gate === "forbidden") {
    return <ForbiddenNotice />
  }
  if (error instanceof AdminGateError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p>로그인 중</p>
      </div>
    )
  }
  throw error
}
