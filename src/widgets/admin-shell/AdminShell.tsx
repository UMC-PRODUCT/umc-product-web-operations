import { Outlet, useRouterState } from "@tanstack/react-router"
import { PageHeader } from "@umc-product/react"

import { OperatorGisuProvider } from "@/features/auth"
import { shouldHideNoticeDetailPageHeader } from "@/features/notices/model/load-notice-detail"
import { cn } from "@/shared/lib/cn"

import { AdminContentsArea } from "./AdminContentsArea"
import { AdminHeader } from "./AdminHeader"
import { AdminSideNav } from "./AdminSideNav"
import { getPageBreadcrumbs, resolveAdminSection } from "./nav"

function getNoticeDetailIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/notices\/([^/]+)$/)
  const noticeId = match?.[1]
  if (!noticeId || noticeId === "new") {
    return null
  }
  return noticeId
}

export function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
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
  const usesFeaturePageHeader =
    isPointsSurface || isNoticesListPage || isNoticeDetailPage

  return (
    <OperatorGisuProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <AdminHeader currentPath={pathname} />
        <div className="flex min-h-0 min-w-0 flex-1">
          <AdminSideNav currentPath={pathname} section={section} />
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
            <div className="flex min-w-0 flex-1 flex-col overflow-auto px-8 pt-12 pb-20">
              <PageHeader
                breadcrumbs={breadcrumbs}
                className={cn(
                  usesFeaturePageHeader &&
                    "[&_.umc-page-header__title-block]:hidden",
                )}
                title={<span className="sr-only">{title}</span>}
              />
              <main
                className={
                  usesFeaturePageHeader ? "mt-[26px] flex-1" : "mt-6 flex-1"
                }
              >
                <Outlet />
              </main>
            </div>
          )}
        </div>
      </div>
    </OperatorGisuProvider>
  )
}
