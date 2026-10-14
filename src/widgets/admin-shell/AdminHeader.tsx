import { PersonIcon } from "@umc-product/icons"
import { Header, HeaderActionButton, HeaderHomeLink } from "@umc-product/react"

import { HEADER_NAV_ITEMS } from "./nav"

type AdminHeaderProps = {
  currentPath: string
}

export function AdminHeader({ currentPath }: AdminHeaderProps) {
  return (
    <Header
      actions={
        <>
          <HeaderActionButton type="button">문의사항</HeaderActionButton>
          <button
            aria-label="프로필"
            className="bg-teal-grey-200 text-teal-grey-600 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
            type="button"
          >
            <PersonIcon size={22} />
          </button>
        </>
      }
      currentPath={currentPath}
      logo={<HeaderHomeLink context="operation" generation={11} href="/" />}
      mode="light"
      navItems={HEADER_NAV_ITEMS}
    />
  )
}
