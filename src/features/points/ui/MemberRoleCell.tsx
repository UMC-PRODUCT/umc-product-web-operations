import { RoleTag, Tooltip } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import type { PointsMemberRole } from "../model/types"

const VISIBLE_ROLE_COUNT = 2

type MemberRoleCellProps = {
  roles: readonly PointsMemberRole[]
}

/**
 * Figma:
 * - RoleTag 최대 2개
 * - 나머지 Tag/Basic `+N` (1621:31532)
 * - `+N` 클릭 시 나머지 역할 목록 (1621:31550) — DS Tooltip(click, light)
 *
 * 테이블 셀·래퍼가 overflow-hidden 이어도 Tooltip 이 portal 로 띄운다.
 */
export function MemberRoleCell({ roles }: MemberRoleCellProps) {
  const visibleRoles = roles.slice(0, VISIBLE_ROLE_COUNT)
  const overflowRoles = roles.slice(VISIBLE_ROLE_COUNT)

  if (visibleRoles.length === 0) {
    return null
  }

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
        <Tooltip
          content={
            <ul className="m-0 flex list-none flex-col items-start gap-(--umc-spacing-gap-4) p-0">
              {overflowRoles.map((role, index) => (
                <li key={`overflow-${index}-${role.label}`}>{role.label}</li>
              ))}
            </ul>
          }
          mode="light"
          openOn="click"
          side="bottom"
        >
          <button
            aria-label={`운영 역할 ${overflowRoles.length}개 더보기`}
            className={cn(
              "text-neutral-medium-600 inline-flex h-[22px] cursor-pointer items-center justify-center",
              "bg-fill-neutral-weak-75 rounded-(--umc-radius-6) px-(--umc-spacing-padding-6)",
              "text-[12px] leading-[1.3] font-medium shadow-(--umc-shadow-drop-neutral-3)",
            )}
            type="button"
          >
            +{overflowRoles.length}
          </button>
        </Tooltip>
      ) : null}
    </div>
  )
}
