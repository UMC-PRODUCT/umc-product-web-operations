import { getRouteApi } from "@tanstack/react-router"
import { PeoplePictogram } from "@umc-product/icons"
import { ContextSwitcher, SideNavigation } from "@umc-product/react"
import { useMemo, useState } from "react"

import { canCreateNotice } from "@/features/notices/model/notice-session"
import { cn } from "@/shared/lib/cn"

import { type AdminSection, getSideNavItems, getSideNavTitle } from "./nav"

const adminRouteApi = getRouteApi("/_admin")

type GenerationOption = {
  value: string
  label: string
}

type AdminSideNavProps = {
  currentPath: string
  section: AdminSection
  generationOptions: readonly GenerationOption[]
  generationValue: string | null
  isGenerationSwitcherDisabled?: boolean
  onGenerationChange: (gisuId: string) => void
}

export function AdminSideNav({
  currentPath,
  section,
  generationOptions,
  generationValue,
  isGenerationSwitcherDisabled = false,
  onGenerationChange,
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
        generationValue == null ? undefined : (
          <ContextSwitcher
            key={switcherMountKey}
            className={cn(
              "w-full",
              isGenerationSwitcherDisabled && "pointer-events-none opacity-50",
            )}
            onValueChange={(value) => {
              if (isGenerationSwitcherDisabled) {
                return
              }
              setSwitcherMountKey((key) => key + 1)
              onGenerationChange(value)
            }}
            options={[...generationOptions]}
            value={generationValue}
          />
        )
      }
      title={getSideNavTitle(section)}
    />
  )
}
