import "./admin-header.css"

import { useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Header, HeaderActionButton, HeaderHomeLink } from "@umc-product/react"
import { useEffect, useId, useRef, useState } from "react"

import { clearAdminSession } from "@/features/auth"
import { useSelectedGisu } from "@/shared/model/selected-gisu"

import { HEADER_NAV_ITEMS } from "./nav"
import { ProfileAvatar } from "./ProfileAvatar"
import { ProfileDropdown } from "./ProfileDropdown"

import type { AdminSession } from "@/features/auth"

const adminRouteApi = getRouteApi("/_admin")

type AdminHeaderProps = {
  currentPath: string
  generation: number
}

function resolveRoleLabel(session: AdminSession): string {
  if (session.isSuperAdmin) {
    return "슈퍼 어드민"
  }

  switch (session.scope) {
    case "CENTRAL":
      return "중앙 운영진"
    case "CHAPTER":
      return "지부 회장"
    case "SCHOOL":
    case "SCHOOL_PART":
      return "교내 운영진"
    default:
      return "챌린저"
  }
}

export function AdminHeader({ currentPath, generation }: AdminHeaderProps) {
  const { session } = adminRouteApi.useRouteContext()
  const selectedGisu = useSelectedGisu()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    setOpen(false)
    clearAdminSession(queryClient)
    void navigate({ to: "/login" })
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (rootRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <Header
      actions={
        <>
          <HeaderActionButton
            onClick={() => {
              window.open(
                "https://pf.kakao.com/_MDxhqX",
                "_blank",
                "noopener,noreferrer",
              )
            }}
            type="button"
          >
            문의사항
          </HeaderActionButton>
          <div className="relative" ref={rootRef}>
            <button
              aria-controls={open ? menuId : undefined}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label="프로필"
              className="cursor-pointer rounded-full border border-transparent transition-[box-shadow,border-color] duration-200 hover:border-[#b3e5e1] hover:shadow-[0_0_0_3px_rgba(179,229,225,0.45),0_0_12px_rgba(122,199,193,0.35)] focus-visible:border-[#b3e5e1] focus-visible:shadow-[0_0_0_3px_rgba(179,229,225,0.45),0_0_12px_rgba(122,199,193,0.35)] focus-visible:outline-none"
              onClick={() => {
                setOpen((current) => !current)
              }}
              type="button"
            >
              <ProfileAvatar
                alt=""
                imageUrl={session.profileImageUrl}
                size={40}
              />
            </button>
            {open ? (
              <ProfileDropdown
                className="absolute top-[calc(100%+8px)] right-0 z-50"
                gisuOptions={selectedGisu.options}
                id={menuId}
                name={session.name || "이름 없음"}
                onLogout={handleLogout}
                onSelectGisu={(gisuId) => {
                  selectedGisu.setGisuId(gisuId)
                }}
                profileImageUrl={session.profileImageUrl}
                roleLabel={resolveRoleLabel(session)}
                schoolName={session.schoolName || "학교 정보 없음"}
                selectedGisuId={selectedGisu.selectedValue}
              />
            ) : null}
          </div>
        </>
      }
      className="admin-header relative z-20"
      currentPath={currentPath}
      logo={
        <HeaderHomeLink context="operation" generation={generation} href="/" />
      }
      mode="light"
      navItems={HEADER_NAV_ITEMS}
    />
  )
}
