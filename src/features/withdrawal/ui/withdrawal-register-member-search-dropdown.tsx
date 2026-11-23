import "./withdrawal-register-member-search-dropdown.css"

import { SearchIcon } from "@umc-product/icons"

import { cn } from "@/shared/lib/cn"
import { EmptyState } from "@/shared/ui/empty-state"

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

function MemberSearchEmptyState({ query }: { query: string }) {
  const trimmedQuery = query.trim()

  return (
    <EmptyState
      className="min-h-0"
      description="이름이나 닉네임을 올바르게 입력했는지 확인해 보세요"
      icon={<SearchIcon aria-hidden className="text-icon-disabled" size={44} />}
      textGap={6}
      title={`'${trimmedQuery}' 님을 찾을 수 없어요`}
    />
  )
}

type WithdrawalRegisterMemberSearchDropdownProps = {
  highlightedIndex: number
  members: WithdrawalMember[]
  onHighlightIndex: (index: number) => void
  onSelectMember: (member: WithdrawalMember) => void
  searchQuery: string
  visible: boolean
}

export function WithdrawalRegisterMemberSearchDropdown({
  highlightedIndex,
  members,
  onHighlightIndex,
  onSelectMember,
  searchQuery,
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
        <MemberSearchEmptyState query={searchQuery} />
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
