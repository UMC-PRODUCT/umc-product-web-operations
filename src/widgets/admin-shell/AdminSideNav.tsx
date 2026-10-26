import { getRouteApi } from "@tanstack/react-router"
import { PeoplePictogram } from "@umc-product/icons"
import { ContextSwitcher, SideNavigation } from "@umc-product/react"
import { useMemo, useState } from "react"

import { useOperatorGisu } from "@/features/auth"
import { canCreateNotice } from "@/features/notices/model/notice-session"

import { type AdminSection, getSideNavItems, getSideNavTitle } from "./nav"

const adminRouteApi = getRouteApi("/_admin")

type AdminSideNavProps = {
  currentPath: string
  section: AdminSection
}

export function AdminSideNav({ currentPath, section }: AdminSideNavProps) {
  const { session } = adminRouteApi.useRouteContext()
  const {
    gisuOptions,
    isLoading,
    isSwitching,
    selectedGisuId,
    switchActiveGisu,
  } = useOperatorGisu()
  const [switcherMountKey, setSwitcherMountKey] = useState(0)

  const sideNavItems = useMemo(() => {
    const items = getSideNavItems(
      section,
      <PeoplePictogram aria-hidden color="currentColor" size={20} />,
    )
    if (section !== "notices" || canCreateNotice(session)) {
      return items
    }
    return items.filter((item) => item.href !== "/notices/new")
  }, [section, session])

  const switcherValue =
    selectedGisuId != null ? String(selectedGisuId) : undefined

  return (
    <SideNavigation
      aria-label="운영 메뉴"
      className="w-(--umc-layout-sidebar-width) shrink-0"
      currentPath={currentPath}
      items={sideNavItems}
      slot={
        gisuOptions.length > 0 && switcherValue != null ? (
          <ContextSwitcher
            key={switcherMountKey}
            className="w-full"
            disabled={isLoading || isSwitching}
            onValueChange={(value) => {
              setSwitcherMountKey((key) => key + 1)
              const gisuId = Number(value)
              if (!Number.isFinite(gisuId)) {
                return
              }
              void switchActiveGisu(gisuId)
            }}
            options={gisuOptions}
            value={switcherValue}
          />
        ) : null
      }
      title={getSideNavTitle(section)}
    />
  )
}
