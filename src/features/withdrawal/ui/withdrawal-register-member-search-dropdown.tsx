import "./withdrawal-register-member-search-dropdown.css"

import { SearchIcon } from "@umc-product/icons"
import { ScrollFog } from "@umc-product/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/shared/lib/cn"
import { EmptyState } from "@/shared/ui/empty-state"

import { formatWithdrawalMemberOrgMeta } from "../model/format-withdrawal-member-meta"

import type { WithdrawalMember } from "../model/types"

const MENU_SIZE = "md" as const
/** Figma — 5행까지 고정, 6행 이상 세로 스크롤 */
const MEMBER_SEARCH_DROPDOWN_MAX_VISIBLE_ROWS = 5
/** DS Menu md 행 높이 (패딩 포함) */
const MEMBER_SEARCH_DROPDOWN_ROW_HEIGHT_PX = 44
const MEMBER_SEARCH_DROPDOWN_SCROLL_MAX_HEIGHT_PX =
  MEMBER_SEARCH_DROPDOWN_MAX_VISIBLE_ROWS * MEMBER_SEARCH_DROPDOWN_ROW_HEIGHT_PX

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
  const listScrollRef = useRef<HTMLDivElement>(null)
  const [showBottomListScrollFog, setShowBottomListScrollFog] = useState(false)
  const shouldScrollList =
    members.length > MEMBER_SEARCH_DROPDOWN_MAX_VISIBLE_ROWS

  const updateListScrollFog = useCallback(() => {
    const element = listScrollRef.current
    if (element == null || !shouldScrollList) {
      setShowBottomListScrollFog(false)
      return
    }
    const hasOverflow = element.scrollHeight - element.clientHeight > 1
    const atBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1
    setShowBottomListScrollFog(hasOverflow && !atBottom)
  }, [shouldScrollList])

  useLayoutEffect(() => {
    if (!visible || members.length === 0) {
      setShowBottomListScrollFog(false)
      return
    }
    updateListScrollFog()
    const rafId = requestAnimationFrame(updateListScrollFog)
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [members, visible, updateListScrollFog])

  useEffect(() => {
    if (!visible || !shouldScrollList) {
      return
    }
    const element = listScrollRef.current
    if (element == null) {
      return
    }

    const observer = new ResizeObserver(() => {
      updateListScrollFog()
    })
    observer.observe(element)
    element.addEventListener("scroll", updateListScrollFog, { passive: true })

    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", updateListScrollFog)
    }
  }, [visible, shouldScrollList, members.length, updateListScrollFog])

  useEffect(() => {
    if (!shouldScrollList || highlightedIndex < 0) {
      return
    }
    const member = members[highlightedIndex]
    if (member == null) {
      return
    }
    const option = listScrollRef.current?.querySelector<HTMLElement>(
      `#withdrawal-member-option-${member.id}`,
    )
    option?.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex, members, shouldScrollList])

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
        <div className="relative overflow-hidden">
          <div
            className={cn(shouldScrollList && "overflow-y-auto")}
            ref={listScrollRef}
            style={
              shouldScrollList
                ? { maxHeight: MEMBER_SEARCH_DROPDOWN_SCROLL_MAX_HEIGHT_PX }
                : undefined
            }
          >
            {members.map((member, index) => (
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
            ))}
          </div>
          {showBottomListScrollFog ? (
            <ScrollFog
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 left-0 h-[74px]"
              side="bottom"
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
