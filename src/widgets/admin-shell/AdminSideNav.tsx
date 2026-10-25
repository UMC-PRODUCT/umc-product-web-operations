import { PeoplePictogram } from "@umc-product/icons"
import { ContextSwitcher, SideNavigation } from "@umc-product/react"

import { type AdminSection, getSideNavItems, getSideNavTitle } from "./nav"

type GenerationOption = {
  value: string
  label: string
}

type AdminSideNavProps = {
  currentPath: string
  section: AdminSection
  generationOptions: readonly GenerationOption[]
  generationValue: string | null
  onGenerationChange: (gisuId: string) => void
}

export function AdminSideNav({
  currentPath,
  section,
  generationOptions,
  generationValue,
  onGenerationChange,
}: AdminSideNavProps) {
  return (
    <SideNavigation
      aria-label="운영 메뉴"
      className="w-(--umc-layout-sidebar-width) shrink-0"
      currentPath={currentPath}
      items={getSideNavItems(
        section,
        <PeoplePictogram aria-hidden color="currentColor" size={20} />,
      )}
      slot={
        generationValue == null ? undefined : (
          <ContextSwitcher
            onValueChange={onGenerationChange}
            options={[...generationOptions]}
            value={generationValue}
          />
        )
      }
      title={getSideNavTitle(section)}
    />
  )
}
