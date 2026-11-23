import { SearchField } from "@umc-product/react"
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/shared/lib/cn"
import { useDebouncedValue } from "@/shared/lib/use-debounced-value"

import { MOCK_WITHDRAWALS } from "../model/mock-withdrawals"
import { WithdrawalRegisterMemberSearchDropdown } from "./withdrawal-register-member-search-dropdown"
import { WithdrawalRegisterSection } from "./withdrawal-register-section"
import { WithdrawalRegisterTargetSelectedBar } from "./withdrawal-register-target-selected-bar"

import type { WithdrawalMember } from "../model/types"

const WITHDRAWAL_REGISTER_MEMBER_SEARCH_DEBOUNCE_MS = 300

function SectionFieldLabel({
  label,
  required,
}: {
  label: string
  required?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center",
        required ? "gap-px" : "gap-0",
      )}
    >
      <span className="text-neutral-medium-600 text-body-2-medium">
        {label}
      </span>
      {required ? (
        <span className="text-error text-body-2-medium shrink-0">*</span>
      ) : null}
    </div>
  )
}

function filterMembersByKeyword(keyword: string): WithdrawalMember[] {
  const query = keyword.trim().toLowerCase()
  if (!query) {
    return []
  }
  return MOCK_WITHDRAWALS.filter(
    (member) =>
      member.status === "pending" &&
      (member.name.toLowerCase().includes(query) ||
        member.nickname.toLowerCase().includes(query)),
  )
}

type WithdrawalRegisterTargetSectionProps = {
  selectedMember: WithdrawalMember | null
  onSelectMember: (member: WithdrawalMember | null) => void
}

/**
 * Figma 2530:23989 — 구성원 미지정 탈부 등록 대상 섹션.
 * 검색 디바운스는 공지 목록과 동일 `useDebouncedValue`(300ms).
 */
export function WithdrawalRegisterTargetSection({
  onSelectMember,
  selectedMember,
}: WithdrawalRegisterTargetSectionProps) {
  const [queryInput, setQueryInput] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const blurTimerRef = useRef<number | null>(null)
  const debouncedQuery = useDebouncedValue(
    queryInput,
    WITHDRAWAL_REGISTER_MEMBER_SEARCH_DEBOUNCE_MS,
  )

  const searchResults = useMemo(
    () => filterMembersByKeyword(debouncedQuery),
    [debouncedQuery],
  )

  useEffect(() => {
    return () => {
      if (blurTimerRef.current != null) {
        window.clearTimeout(blurTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [debouncedQuery, searchResults])

  const showDropdown =
    dropdownOpen && debouncedQuery.trim().length > 0 && selectedMember == null

  const activeOptionId =
    highlightedIndex >= 0 && searchResults[highlightedIndex] != null
      ? `withdrawal-member-option-${searchResults[highlightedIndex].id}`
      : undefined

  const pickMember = (member: WithdrawalMember) => {
    onSelectMember(member)
    setQueryInput("")
    setDropdownOpen(false)
    setHighlightedIndex(-1)
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const hasResults = searchResults.length > 0

    if (event.key === "ArrowDown") {
      if (debouncedQuery.trim().length === 0) {
        return
      }
      event.preventDefault()
      setDropdownOpen(true)
      if (!hasResults) {
        return
      }
      setHighlightedIndex((current) =>
        current < searchResults.length - 1 ? current + 1 : 0,
      )
      return
    }

    if (event.key === "ArrowUp") {
      if (!showDropdown || !hasResults) {
        return
      }
      event.preventDefault()
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : searchResults.length - 1,
      )
      return
    }

    if (event.key === "Enter") {
      if (!showDropdown || !hasResults) {
        return
      }
      const index = highlightedIndex >= 0 ? highlightedIndex : 0
      const member = searchResults[index]
      if (member == null) {
        return
      }
      event.preventDefault()
      pickMember(member)
      return
    }

    if (event.key === "Escape") {
      setDropdownOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <WithdrawalRegisterSection title="탈부 대상">
      <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
        <SectionFieldLabel label="구성원" required />
        {selectedMember != null ? (
          <WithdrawalRegisterTargetSelectedBar
            member={selectedMember}
            onClear={() => {
              onSelectMember(null)
              setQueryInput("")
              setDropdownOpen(false)
              setHighlightedIndex(-1)
            }}
          />
        ) : (
          <div className="relative w-full">
            <SearchField
              aria-activedescendant={activeOptionId}
              aria-autocomplete="list"
              aria-controls="withdrawal-register-member-search-list"
              aria-expanded={showDropdown}
              aria-label="탈부 대상 구성원 검색"
              className="w-full"
              clearable
              onBlur={() => {
                blurTimerRef.current = window.setTimeout(() => {
                  setDropdownOpen(false)
                }, 150)
              }}
              onChange={(event) => {
                setQueryInput(event.target.value)
                setDropdownOpen(true)
              }}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (blurTimerRef.current != null) {
                  window.clearTimeout(blurTimerRef.current)
                }
                if (queryInput.trim().length > 0) {
                  setDropdownOpen(true)
                }
              }}
              placeholder="이름 · 닉네임으로 검색할 수 있어요"
              value={queryInput}
            />
            <WithdrawalRegisterMemberSearchDropdown
              highlightedIndex={highlightedIndex}
              members={searchResults}
              onHighlightIndex={setHighlightedIndex}
              onSelectMember={pickMember}
              visible={showDropdown}
            />
          </div>
        )}
      </div>
    </WithdrawalRegisterSection>
  )
}
