import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router"
import { LinkProvider } from "@umc-product/react"

import { RouterLink } from "@/shared/lib/router-link"

import type { QueryClient } from "@tanstack/react-query"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { title: "UMC Operation" },
      {
        name: "description",
        content: "UMC 운영 백오피스",
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <LinkProvider component={RouterLink}>
      <HeadContent />
      <Outlet />
    </LinkProvider>
  )
}
