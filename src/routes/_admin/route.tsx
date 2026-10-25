import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"

import {
  adminSessionQueryOptions,
  clearAdminSession,
  isOperator,
} from "@/features/auth"
import { getAccessToken, getRefreshToken } from "@/shared/api/access-token"
import { AdminShell } from "@/widgets/admin-shell/AdminShell"

export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ context }) => {
    if (!getAccessToken() && !getRefreshToken()) {
      throw redirect({ to: "/login" })
    }

    try {
      const session = await context.queryClient.ensureQueryData(
        adminSessionQueryOptions(),
      )
      if (!isOperator(session)) {
        clearAdminSession(context.queryClient)
        throw redirect({ to: "/login", search: { forbidden: true } })
      }
      return { session }
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      if (!getAccessToken() && !getRefreshToken()) {
        clearAdminSession(context.queryClient)
        throw redirect({ to: "/login" })
      }
      throw error
    }
  },
  component: AdminShell,
})
