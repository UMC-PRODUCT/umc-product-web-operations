import "./withdrawal-register-member-search-dropdown.css"

import { cn } from "@/shared/lib/cn"

import { formatWithdrawalMemberOrgMeta } from "../model/format-withdrawal-member-meta"

import type { WithdrawalMember } from "../model/types"

const MENU_SIZE = "md" as const

function MemberSearchRowLabel({
  caption,
  label,
}: {
  caption: string
  label: string
}) {
  return (
    <span className="umc-dropdown-item__content min-w-0">
      <span className="text-label-3-medium text-neutral-default-900 [word-break:break-word] whitespace-nowrap">
        {`${label} `}
        <span className="text-neutral-weak-500">{caption}</span>
      </span>
    </span>
  )
}

function MemberSearchDropdownRow({
  highlighted,
  member,
  onHighlight,
  onSelect,
}: {
  highlighted: boolean
  member: WithdrawalMember
  onHighlight: () => void
  onSelect: () => void
}) {
  const meta = formatWithdrawalMemberOrgMeta(member)
  const label = `${member.name} / ${member.nickname}`

  return (
    <button
      className="umc-dropdown-item w-full border-0"
      data-highlighted={highlighted ? "" : undefined}
      data-size={MENU_SIZE}
      id={`withdrawal-member-option-${member.id}`}
      onClick={onSelect}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      onMouseEnter={onHighlight}
      role="option"
      aria-selected={highlighted}
      type="button"
    >
      <MemberSearchRowLabel caption={meta} label={label} />
    </button>
  )
}

type WithdrawalRegisterMemberSearchDropdownProps = {
  highlightedIndex: number
  members: WithdrawalMember[]
  onHighlightIndex: (index: number) => void
  onSelectMember: (member: WithdrawalMember) => void
  visible: boolean
}

export function WithdrawalRegisterMemberSearchDropdown({
  highlightedIndex,
  members,
  onHighlightIndex,
  onSelectMember,
  visible,
}: WithdrawalRegisterMemberSearchDropdownProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      className={cn(
        "withdrawal-register-member-search-dropdown",
        "umc-dropdown-list umc-menu absolute inset-x-0 top-[calc(100%+4px)] z-(--umc-z-dropdown) w-full",
      )}
      data-size={MENU_SIZE}
      id="withdrawal-register-member-search-list"
      role="listbox"
    >
      {members.length === 0 ? (
        <p className="text-body-3-regular text-placeholder px-(--umc-spacing-padding-12) py-(--umc-spacing-padding-12) text-center">
          검색 결과가 없어요
        </p>
      ) : (
        members.map((member, index) => (
          <MemberSearchDropdownRow
            highlighted={highlightedIndex === index}
            key={member.id}
            member={member}
            onHighlight={() => {
              onHighlightIndex(index)
            }}
            onSelect={() => {
              onSelectMember(member)
            }}
          />
        ))
      )}
    </div>
  )
}
