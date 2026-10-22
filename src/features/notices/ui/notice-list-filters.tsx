import { SearchField, Select } from "@umc-product/react"
import { useEffect, useState } from "react"

import {
  NOTICE_FILTER_SELECT_TYPO_CLASS,
  NOTICE_RANGE_SELECT_OPTIONS,
  NOTICE_TARGET_SELECT_OPTIONS,
} from "./constants"

import type {
  NoticeListFilters,
  NoticeRangeFilter,
  NoticeTargetFilter,
} from "../model/types"

type NoticeListFiltersProps = {
  filters: NoticeListFilters
  onQueryChange: (query: string) => void
  onRangeChange: (range: NoticeRangeFilter) => void
  onTargetChange: (target: NoticeTargetFilter) => void
}

function toSelectValue<T extends string>(value: T, allValue: T): T | null {
  return value === allValue ? null : value
}

function filterSelectVariant(value: string | null): "default" | "filter" {
  return value ? "filter" : "default"
}

export function NoticeListFiltersBar({
  filters,
  onQueryChange,
  onRangeChange,
  onTargetChange,
}: NoticeListFiltersProps) {
  const [draftQuery, setDraftQuery] = useState(filters.query)

  useEffect(() => {
    setDraftQuery(filters.query)
  }, [filters.query])

  const commitQuery = (query: string) => {
    onQueryChange(query)
  }

  const rangeSelectValue = toSelectValue(filters.range, "all")
  const targetSelectValue = toSelectValue(filters.target, "all")

  return (
    <div className="flex flex-nowrap items-center gap-(--umc-spacing-gap-16)">
      <Select
        aria-label="공지 범위"
        className={NOTICE_FILTER_SELECT_TYPO_CLASS}
        onValueChange={(value) => {
          onRangeChange(value ?? "all")
        }}
        options={NOTICE_RANGE_SELECT_OPTIONS}
        placeholder="범위 전체"
        size="md"
        value={rangeSelectValue}
        variant={filterSelectVariant(rangeSelectValue)}
      />
      <Select
        aria-label="공지 대상"
        className={NOTICE_FILTER_SELECT_TYPO_CLASS}
        onValueChange={(value) => {
          onTargetChange(value ?? "all")
        }}
        options={NOTICE_TARGET_SELECT_OPTIONS}
        placeholder="대상 전체"
        size="md"
        value={targetSelectValue}
        variant={filterSelectVariant(targetSelectValue)}
      />
      <form
        className="w-[300px] shrink-0"
        onSubmit={(event) => {
          event.preventDefault()
          commitQuery(draftQuery)
        }}
      >
        <SearchField
          aria-label="공지 검색"
          className="w-full"
          clearable
          onChange={(event) => {
            const value = event.target.value
            setDraftQuery(value)
            if (value === "") {
              commitQuery("")
            }
          }}
          placeholder="제목 · 본문 등으로 검색할 수 있어요"
          value={draftQuery}
        />
      </form>
    </div>
  )
}
