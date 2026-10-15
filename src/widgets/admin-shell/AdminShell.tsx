import { Outlet, useRouterState } from "@tanstack/react-router"
import { PageHeader } from "@umc-product/react"

import { AdminHeader } from "./AdminHeader"
import { AdminSideNav } from "./AdminSideNav"
import { getPageBreadcrumbs, resolveAdminSection } from "./nav"

export function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = resolveAdminSection(pathname)
  const { breadcrumbs, title } = getPageBreadcrumbs(pathname, section)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AdminHeader currentPath={pathname} />
      <div className="flex min-h-0 min-w-0 flex-1">
        <AdminSideNav currentPath={pathname} section={section} />
        <div className="flex min-w-0 flex-1 flex-col overflow-auto px-8 pt-12 pb-20">
          <PageHeader
            breadcrumbs={breadcrumbs}
            className={
              pathname === "/activity/points" || pathname === "/activity"
                ? "[&_.umc-page-header__title-block]:hidden"
                : undefined
            }
            title={<span className="sr-only">{title}</span>}
          />
          <main
            className={
              pathname === "/activity/points" || pathname === "/activity"
                ? "mt-[26px] flex-1"
                : "mt-6 flex-1"
            }
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
