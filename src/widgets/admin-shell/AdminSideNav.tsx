import { PeoplePictogram } from "@umc-product/icons"
import { ContextSwitcher, SideNavigation } from "@umc-product/react"
import { useState } from "react"

import {
  type AdminSection,
  GENERATION_OPTIONS,
  getSideNavItems,
  getSideNavTitle,
} from "./nav"

type AdminSideNavProps = {
  currentPath: string
  section: AdminSection
}

export function AdminSideNav({ currentPath, section }: AdminSideNavProps) {
  const [generation, setGeneration] = useState("11")

  return (
    <SideNavigation
      aria-label="운영 메뉴"
      currentPath={currentPath}
      items={getSideNavItems(
        section,
        <PeoplePictogram aria-hidden color="currentColor" size={20} />,
      )}
      slot={
        <ContextSwitcher
          onValueChange={setGeneration}
          options={[...GENERATION_OPTIONS]}
          value={generation}
        />
      }
      title={getSideNavTitle(section)}
    />
  )
}
