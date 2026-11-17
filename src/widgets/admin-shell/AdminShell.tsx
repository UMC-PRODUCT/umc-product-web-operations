import {
  getRouteApi,
  Outlet,
  useMatches,
  useRouterState,
} from "@tanstack/react-router"
import { PageHeader } from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"

import { SelectedGisuProvider, useSelectedGisu } from "@/entities/gisu"
import { cn } from "@/shared/lib/cn"

import { AdminContentsArea } from "./AdminContentsArea"
import { AdminHeader } from "./AdminHeader"
import { AdminSideNav } from "./AdminSideNav"
import { getPageBreadcrumbs, resolveAdminSection } from "./nav"
import { resolveDefaultRoleView, toRoleViewOptions } from "./role-view"
import { resolveAdminShellStaticData } from "./route-static-data"

const adminRouteApi = getRouteApi("/_admin")

export function AdminShell() {
  const { session } = adminRouteApi.useRouteContext()
  const allowedGisuIds = useMemo(() => {
    // 슈퍼 어드민은 전체 기수 접근. 그 외는 참여 이력 기수만.
    if (session.isSuperAdmin) {
      return undefined
    }
    return session.participatedGisus.map((gisu) => gisu.gisuId)
  }, [session.isSuperAdmin, session.participatedGisus])

  return (
    <SelectedGisuProvider allowedGisuIds={allowedGisuIds}>
      <AdminShellFrame />
    </SelectedGisuProvider>
  )
}

function AdminShellFrame() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const matches = useMatches()
  const { session } = adminRouteApi.useRouteContext()
  const selectedGisu = useSelectedGisu()
  const viewOptions = useMemo(() => toRoleViewOptions(session), [session])
  const [selectedView, setSelectedView] = useState<string | null>(() =>
    resolveDefaultRoleView(viewOptions),
  )

  useEffect(() => {
    setSelectedView((current) => {
      if (
        current != null &&
        viewOptions.some((option) => option.value === current)
      ) {
        return current
      }
      return resolveDefaultRoleView(viewOptions)
    })
  }, [viewOptions])

  const section = resolveAdminSection(pathname)
  const { breadcrumbs, title } = getPageBreadcrumbs(pathname, section)
  const { hideTitleBlock, shellLayout } = resolveAdminShellStaticData(
    matches.map((match) => match.staticData),
  )
  const isContentsAreaLayout = shellLayout === "contents-area"
  const isComposeLayout = shellLayout === "compose"
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AdminHeader
        currentPath={pathname}
        generation={selectedGisu.generation ?? 11}
      />
      <div className="relative z-0 flex min-h-0 min-w-0 flex-1">
        <AdminSideNav
          currentPath={pathname}
          onViewChange={setSelectedView}
          section={section}
          viewOptions={viewOptions}
          viewValue={selectedView}
        />
        {isContentsAreaLayout ? (
          <AdminContentsArea
            breadcrumbs={breadcrumbs}
            hideTitleBlock={hideTitleBlock}
            title={<span className="sr-only">{title}</span>}
          >
            <Outlet />
          </AdminContentsArea>
        ) : (
          <div
            className={cn(
              "flex min-w-0 flex-1 [scrollbar-width:none] flex-col overflow-auto px-8 pt-12 pb-20 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              isComposeLayout && "bg-background-neutral-weak",
            )}
          >
            <PageHeader
              breadcrumbs={breadcrumbs}
              className={cn(
                hideTitleBlock && "[&_.umc-page-header__title-block]:hidden",
              )}
              title={<span className="sr-only">{title}</span>}
            />
            <main
              className={cn(
                hideTitleBlock ? "flex-1" : "mt-6 flex-1",
                isComposeLayout && "flex min-h-0 flex-col",
              )}
            >
              <Outlet />
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
