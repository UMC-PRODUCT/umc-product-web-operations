import { RoleTag } from "@umc-product/react"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"

import type { PointsMemberRole } from "../model/types"

const VISIBLE_ROLE_COUNT = 2
const MENU_OFFSET_PX = 4
const MENU_Z_INDEX = 50

type MemberRoleCellProps = {
  roles: readonly PointsMemberRole[]
}

type MenuPosition = {
  left: number
  top: number
}

/**
 * Figma:
 * - RoleTag 최대 2개
 * - 나머지 Tag/Basic `+N` (1621:31532)
 * - `+N` 클릭 시 Meue List (1621:31550)
 *
 * 테이블 셀·래퍼가 overflow-hidden 이라 메뉴는 portal + fixed 로 띄운다.
 */
export function MemberRoleCell({ roles }: MemberRoleCellProps) {
  const visibleRoles = roles.slice(0, VISIBLE_ROLE_COUNT)
  const overflowRoles = roles.slice(VISIBLE_ROLE_COUNT)
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null)
      return
    }

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (trigger == null) {
        return
      }
      const rect = trigger.getBoundingClientRect()
      setMenuPosition({
        left: rect.left,
        top: rect.bottom + MENU_OFFSET_PX,
      })
    }

    updatePosition()
    const rafId = requestAnimationFrame(updatePosition)
    window.addEventListener("resize", updatePosition)
    document.addEventListener("scroll", updatePosition, true)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
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

  if (visibleRoles.length === 0) {
    return null
  }

  const menu =
    open && overflowRoles.length > 0
      ? createPortal(
          <div
            className={cn(
              "fixed flex min-w-[100px] flex-col items-start rounded-(--umc-radius-12) bg-white p-(--umc-spacing-padding-4)",
              "shadow-(--umc-shadow-drop-neutral-1)",
              menuPosition == null && "invisible",
            )}
            id={menuId}
            ref={menuRef}
            role="menu"
            style={{
              left: menuPosition?.left ?? 0,
              top: menuPosition?.top ?? 0,
              zIndex: MENU_Z_INDEX,
            }}
          >
            {overflowRoles.map((role, index) => (
              <div
                className="text-body-2-regular text-neutral-default-900 flex h-[38px] w-full items-center rounded-[8px] px-(--umc-spacing-padding-12) whitespace-nowrap"
                key={`overflow-${index}-${role.label}`}
                role="menuitem"
              >
                {role.label}
              </div>
            ))}
          </div>,
          document.body,
        )
      : null

  return (
    <div className="relative flex min-w-0 items-center gap-(--umc-spacing-gap-6)">
      {visibleRoles.map((role, index) => (
        <RoleTag
          color={role.color}
          key={`role-${index}-${role.label}`}
          size="sm"
        >
          {role.label}
        </RoleTag>
      ))}

      {overflowRoles.length > 0 ? (
        <>
          <button
            aria-controls={open ? menuId : undefined}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={`운영 역할 ${overflowRoles.length}개 더보기`}
            className={cn(
              "text-neutral-medium-600 inline-flex h-[22px] cursor-pointer items-center justify-center",
              "bg-fill-neutral-weak-75 rounded-(--umc-radius-6) px-(--umc-spacing-padding-6)",
              "text-[12px] leading-[1.3] font-medium shadow-(--umc-shadow-drop-neutral-3)",
            )}
            onClick={() => {
              setOpen((current) => !current)
            }}
            ref={triggerRef}
            type="button"
          >
            +{overflowRoles.length}
          </button>
          {menu}
        </>
      ) : null}
    </div>
  )
}
