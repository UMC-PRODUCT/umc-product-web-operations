import { CloseIcon, PersonIcon } from "@umc-product/icons"
import { IconButton } from "@umc-product/react"

import { formatWithdrawalMemberSelectedBarMeta } from "../model/format-withdrawal-member-meta"

import type { WithdrawalMember } from "../model/types"

const SELECTED_BAR_ICON_CLASS = "text-icon-neutral-medium-500"

type WithdrawalRegisterTargetSelectedBarProps = {
  member: WithdrawalMember
  onClear: () => void
}

export function WithdrawalRegisterTargetSelectedBar({
  member,
  onClear,
}: WithdrawalRegisterTargetSelectedBarProps) {
  const meta = formatWithdrawalMemberSelectedBarMeta(member)

  return (
    <div className="bg-background-neutral-medium border-neutral-medium-300 flex h-11 w-full items-center gap-(--umc-spacing-gap-20) rounded-(--umc-radius-6) border-[0.7px] py-(--umc-spacing-padding-8) ps-(--umc-spacing-padding-16) pe-(--umc-spacing-padding-16)">
      <div className="flex min-w-0 flex-1 items-center gap-(--umc-spacing-gap-20)">
        <div className="flex shrink-0 items-center gap-1">
          <PersonIcon
            aria-hidden
            className={SELECTED_BAR_ICON_CLASS}
            size={16}
            weight="regular"
          />
          <span className="text-body-3-regular text-neutral-weak-500">
            탈부 대상
          </span>
        </div>
        <p className="text-body-3-semibold flex min-w-0 flex-wrap items-center gap-(--umc-spacing-gap-8)">
          <span className="text-neutral-default-900">
            {member.name} / {member.nickname}
          </span>
          {meta ? (
            <span className="text-neutral-weak-500 font-normal">{meta}</span>
          ) : null}
        </p>
      </div>
      <IconButton
        aria-label="탈부 대상 선택 취소"
        className={`bg-background-neutral-medium shrink-0 ${SELECTED_BAR_ICON_CLASS}`}
        color="neutral"
        icon={<CloseIcon aria-hidden size={16} weight="thin" />}
        onClick={onClear}
        size="sm"
        type="button"
        variant="weak"
      />
    </div>
  )
}
