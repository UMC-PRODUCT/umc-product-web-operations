import { getRouteApi } from "@tanstack/react-router"
import { PeoplePictogram } from "@umc-product/icons"
import { ContextSwitcher, SideNavigation } from "@umc-product/react"
import { useMemo, useState } from "react"

import { canCreateNotice } from "@/features/notices/model/notice-session"

import { type AdminSection, getSideNavItems, getSideNavTitle } from "./nav"

import type { RoleViewOption } from "./role-view"

const adminRouteApi = getRouteApi("/_admin")

type AdminSideNavProps = {
  currentPath: string
  section: AdminSection
  viewOptions: readonly RoleViewOption[]
  viewValue: string | null
  onViewChange: (view: string) => void
}

export function AdminSideNav({
  currentPath,
  section,
  viewOptions,
  viewValue,
  onViewChange,
}: AdminSideNavProps) {
  const { session } = adminRouteApi.useRouteContext()
  const [switcherMountKey, setSwitcherMountKey] = useState(0)

  const sideNavItems = useMemo(() => {
    const items = getSideNavItems(
      section,
      <PeoplePictogram aria-hidden color="currentColor" size={20} />,
    )
    if (section !== "notices" || canCreateNotice(session)) {
      return items
    }
    return items.filter((item) => {
      if ("children" in item) {
        return true
      }
      return item.href !== "/notices/new"
    })
  }, [section, session])

  return (
    <SideNavigation
      aria-label="운영 메뉴"
      className="w-(--umc-layout-sidebar-width) shrink-0"
      currentPath={currentPath}
      items={sideNavItems}
      slot={
        viewValue == null || viewOptions.length === 0 ? undefined : (
          <ContextSwitcher
            key={switcherMountKey}
            className="w-full"
            onValueChange={(value) => {
              setSwitcherMountKey((key) => key + 1)
              onViewChange(value)
            }}
            options={[...viewOptions]}
            value={viewValue}
          />
        )
      }
      title={getSideNavTitle(section)}
    />
  )
}
