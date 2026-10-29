import { getRouteApi, Outlet, useRouterState } from "@tanstack/react-router"
import { PageHeader } from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"

import { shouldHideNoticeDetailPageHeader } from "@/features/notices/model/load-notice-detail"
import { cn } from "@/shared/lib/cn"
import {
  SelectedGisuProvider,
  useSelectedGisu,
} from "@/shared/model/selected-gisu"

import { AdminContentsArea } from "./AdminContentsArea"
import { AdminHeader } from "./AdminHeader"
import { AdminSideNav } from "./AdminSideNav"
import { getPageBreadcrumbs, resolveAdminSection } from "./nav"
import { resolveDefaultRoleView, toRoleViewOptions } from "./role-view"

const adminRouteApi = getRouteApi("/_admin")

function getNoticeDetailIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/notices\/([^/]+)$/)
  const noticeId = match?.[1]
  if (!noticeId || noticeId === "new") {
    return null
  }
  return noticeId
}

export function AdminShell() {
  return (
    <SelectedGisuProvider>
      <AdminShellFrame />
    </SelectedGisuProvider>
  )
}

function AdminShellFrame() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
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
  const isPointsSurface =
    pathname === "/activity" ||
    pathname === "/activity/points" ||
    pathname.startsWith("/activity/points/")
  const noticeDetailId = getNoticeDetailIdFromPath(pathname)
  const isNoticeDetailPage = noticeDetailId !== null
  const hideNoticeDetailPageHeader =
    noticeDetailId !== null && shouldHideNoticeDetailPageHeader(noticeDetailId)
  const isNoticesListPage = pathname === "/notices"
  const isNoticeCreatePage = pathname === "/notices/new"
  const usesFeaturePageHeader =
    isPointsSurface ||
    isNoticesListPage ||
    isNoticeCreatePage ||
    isNoticeDetailPage

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
        {isNoticeDetailPage ? (
          <AdminContentsArea
            breadcrumbs={breadcrumbs}
            hidePageHeader={hideNoticeDetailPageHeader}
            hideTitleBlock
            title={<span className="sr-only">{title}</span>}
          >
            <Outlet />
          </AdminContentsArea>
        ) : (
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col overflow-auto px-8 pt-12 pb-20",
              isNoticeCreatePage && "bg-background-neutral-weak",
            )}
          >
            <PageHeader
              breadcrumbs={breadcrumbs}
              className={cn(
                usesFeaturePageHeader &&
                  "[&_.umc-page-header__title-block]:hidden",
              )}
              title={<span className="sr-only">{title}</span>}
            />
            <main
              className={cn(
                usesFeaturePageHeader ? "mt-[26px] flex-1" : "mt-6 flex-1",
                isNoticeCreatePage && "flex min-h-0 flex-col",
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
