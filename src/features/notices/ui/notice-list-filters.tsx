import { SearchField, Select } from "@umc-product/react"
import { useEffect, useMemo } from "react"

import { NOTICE_PART_SELECT_OPTIONS } from "../model/notice-part-options"
import {
  encodeChapterScope,
  encodeSchoolScope,
} from "../model/notice-scope-filter"
import {
  NOTICE_SCOPE_STAGE_SELECT_OPTIONS,
  type NoticeScopeStage,
} from "../model/notice-scope-stage"
import { NOTICE_FILTER_SELECT_TYPO_CLASS } from "./constants"

import type { NoticePart } from "../api/notice-api.types"
import type { NoticeListFilters } from "../model/types"

type NoticeListFiltersProps = {
  filters: NoticeListFilters
  isOrganizationLoading?: boolean
  chapterOptions: { id: number; name: string }[]
  schoolOptions: { schoolId: number; schoolName: string }[]
  onQueryChange: (query: string) => void
  onPartChange: (part: NoticePart | null) => void
  onScopeChange: (scope: NoticeListFilters["scope"]) => void
  onScopeStageChange: (scopeStage: NoticeScopeStage | null) => void
}

function filterSelectVariant(value: string | null): "default" | "filter" {
  return value ? "filter" : "default"
}

export function NoticeListFiltersBar({
  filters,
  isOrganizationLoading = false,
  chapterOptions,
  schoolOptions,
  onQueryChange,
  onPartChange,
  onScopeChange,
  onScopeStageChange,
}: NoticeListFiltersProps) {
  const chapterSelectOptions = useMemo(
    () =>
      chapterOptions.map((chapter) => ({
        label: chapter.name,
        value: encodeChapterScope(chapter.id) as string,
      })),
    [chapterOptions],
  )

  const schoolSelectOptions = useMemo(
    () =>
      schoolOptions.map((school) => ({
        label: school.schoolName,
        value: encodeSchoolScope(school.schoolId) as string,
      })),
    [schoolOptions],
  )

  const targetSelectOptions = useMemo(() => {
    switch (filters.scopeStage) {
      case "chapter":
        return chapterSelectOptions
      case "school":
        return schoolSelectOptions
      case "part":
        return NOTICE_PART_SELECT_OPTIONS
      default:
        return []
    }
  }, [chapterSelectOptions, filters.scopeStage, schoolSelectOptions])

  const targetSelectValue =
    filters.scopeStage === "part" ? filters.part : filters.scope

  useEffect(() => {
    if (!filters.scopeStage || filters.scopeStage === "part") {
      return
    }

    const isValidScope = targetSelectOptions.some(
      (option) => option.value === filters.scope,
    )
    if (filters.scope != null && !isValidScope) {
      onScopeChange(null)
    }
  }, [filters.scope, filters.scopeStage, onScopeChange, targetSelectOptions])

  useEffect(() => {
    if (filters.scopeStage !== "part" || filters.part == null) {
      return
    }

    const isValidPart = NOTICE_PART_SELECT_OPTIONS.some(
      (option) => option.value === filters.part,
    )
    if (!isValidPart) {
      onPartChange(null)
    }
  }, [filters.part, filters.scopeStage, onPartChange])

  return (
    <div className="flex flex-nowrap items-center gap-(--umc-spacing-gap-16)">
      <Select
        aria-label="공지 범위 단계"
        className={NOTICE_FILTER_SELECT_TYPO_CLASS}
        disabled={isOrganizationLoading}
        onValueChange={(value) => {
          onScopeStageChange(value ? (value as NoticeScopeStage) : null)
        }}
        options={NOTICE_SCOPE_STAGE_SELECT_OPTIONS}
        placeholder="범위 전체"
        size="md"
        value={filters.scopeStage}
        variant={filterSelectVariant(filters.scopeStage)}
      />
      <Select
        aria-label="공지 대상"
        className={NOTICE_FILTER_SELECT_TYPO_CLASS}
        disabled={!filters.scopeStage || isOrganizationLoading}
        onValueChange={(value) => {
          if (!filters.scopeStage) {
            return
          }

          if (filters.scopeStage === "part") {
            onPartChange(value as NoticePart)
            return
          }

          onScopeChange(value)
        }}
        options={targetSelectOptions}
        placeholder="대상 전체"
        size="md"
        value={targetSelectValue}
        variant={filterSelectVariant(targetSelectValue)}
      />
      <SearchField
        aria-label="공지 검색"
        className="w-[300px] shrink-0"
        clearable
        onChange={(event) => {
          onQueryChange(event.target.value)
        }}
        placeholder="제목 · 본문 등으로 검색할 수 있어요"
        value={filters.query}
      />
    </div>
  )
}
