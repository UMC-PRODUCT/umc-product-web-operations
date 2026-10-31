import { SearchField, Select } from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"

import { useDebouncedValue } from "@/shared/lib/use-debounced-value"

import { NOTICE_CREATE_STAFF_SCOPE_OPTIONS } from "../model/notice-create-form"
import {
  isNoticeListFilterAllValue,
  NOTICE_LIST_FILTER_ALL,
} from "../model/notice-list-filter-all"
import {
  encodeChapterScope,
  encodeSchoolScope,
} from "../model/notice-scope-filter"
import {
  isStaffCentralNoticeTab,
  STAFF_NOTICE_LIST_SCOPE_STAGE_OPTIONS,
} from "../model/notice-staff-target-rules"
import { NOTICE_FILTER_SELECT_TYPO_CLASS } from "./constants"

import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "../model/notice-create-form"
import type { NoticeCreatePartOption } from "../model/notice-create-part-options"
import type { NoticeScopeStage } from "../model/notice-scope-stage"
import type { NoticeListFilters } from "../model/types"

type NoticeListFiltersProps = {
  filters: NoticeListFilters
  isOrganizationLoading?: boolean
  chapterOptions: { id: number; name: string }[]
  schoolOptions: { schoolId: number; schoolName: string }[]
  partOptions: NoticeCreatePartOption[]
  onChapterScopeChange: (scope: NoticeListFilters["chapterScope"]) => void
  onQueryChange: (query: string) => void
  onPartChange: (part: NoticePart | null) => void
  onSchoolScopeChange: (scope: NoticeListFilters["schoolScope"]) => void
  onScopeChange: (scope: NoticeListFilters["scope"]) => void
  onScopeStageChange: (scopeStage: NoticeScopeStage | null) => void
  onStaffRecipientChange: (recipient: NoticeCreateStaffScope | null) => void
}

const NOTICE_LIST_SEARCH_DEBOUNCE_MS = 300

function filterSelectVariant(value: string | null): "default" | "filter" {
  return value ? "filter" : "default"
}

export function NoticeListFiltersBar({
  filters,
  isOrganizationLoading = false,
  chapterOptions,
  schoolOptions,
  partOptions,
  onChapterScopeChange,
  onQueryChange,
  onPartChange,
  onSchoolScopeChange,
  onScopeChange,
  onScopeStageChange,
  onStaffRecipientChange,
}: NoticeListFiltersProps) {
  const [queryInput, setQueryInput] = useState(filters.query)
  const debouncedQuery = useDebouncedValue(
    queryInput,
    NOTICE_LIST_SEARCH_DEBOUNCE_MS,
  )

  useEffect(() => {
    setQueryInput(filters.query)
  }, [filters.query])

  useEffect(() => {
    if (debouncedQuery === filters.query) {
      return
    }

    onQueryChange(debouncedQuery)
  }, [debouncedQuery, filters.query, onQueryChange])

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

  const challengerPartSelectOptions = useMemo(
    () => [
      { label: "파트 전체", value: NOTICE_LIST_FILTER_ALL },
      ...partOptions,
    ],
    [partOptions],
  )

  const staffTargetSelectOptions = useMemo(() => {
    switch (filters.scopeStage) {
      case "chapter":
        return [
          { label: "대상 전체", value: NOTICE_LIST_FILTER_ALL },
          ...chapterSelectOptions,
        ]
      case "school":
        return [
          { label: "대상 전체", value: NOTICE_LIST_FILTER_ALL },
          ...schoolSelectOptions,
        ]
      case "part":
        return [
          { label: "대상 전체", value: NOTICE_LIST_FILTER_ALL },
          ...partOptions,
        ]
      default:
        return []
    }
  }, [
    chapterSelectOptions,
    filters.scopeStage,
    partOptions,
    schoolSelectOptions,
  ])

  const staffTargetSelectValue =
    filters.scopeStage === "part" ? filters.part : filters.scope

  const staffRecipientSelectOptions = useMemo(
    () => [
      { label: "받는 사람 전체", value: NOTICE_LIST_FILTER_ALL },
      ...NOTICE_CREATE_STAFF_SCOPE_OPTIONS,
    ],
    [],
  )

  const staffScopeTargetFiltersLocked =
    filters.staffRecipient != null &&
    isStaffCentralNoticeTab(filters.staffRecipient)

  useEffect(() => {
    if (filters.chapterScope == null) {
      return
    }

    const isValid = chapterSelectOptions.some(
      (option) => option.value === filters.chapterScope,
    )
    if (!isValid) {
      onChapterScopeChange(null)
    }
  }, [chapterSelectOptions, filters.chapterScope, onChapterScopeChange])

  useEffect(() => {
    if (filters.schoolScope == null) {
      return
    }

    const isValid = schoolSelectOptions.some(
      (option) => option.value === filters.schoolScope,
    )
    if (!isValid) {
      onSchoolScopeChange(null)
    }
  }, [filters.schoolScope, onSchoolScopeChange, schoolSelectOptions])

  useEffect(() => {
    if (filters.part == null) {
      return
    }

    const isValid = partOptions.some((option) => option.value === filters.part)
    if (!isValid) {
      onPartChange(null)
    }
  }, [filters.part, onPartChange, partOptions])

  useEffect(() => {
    if (!filters.scopeStage || filters.scopeStage === "part") {
      return
    }

    const isValidScope = staffTargetSelectOptions.some(
      (option) => option.value === filters.scope,
    )
    if (filters.scope != null && !isValidScope) {
      onScopeChange(null)
    }
  }, [
    filters.scope,
    filters.scopeStage,
    onScopeChange,
    staffTargetSelectOptions,
  ])

  useEffect(() => {
    if (filters.scopeStage !== "part" || filters.part == null) {
      return
    }

    const isValidPart = partOptions.some(
      (option) => option.value === filters.part,
    )
    if (!isValidPart) {
      onPartChange(null)
    }
  }, [filters.part, filters.scopeStage, onPartChange, partOptions])

  useEffect(() => {
    if (!staffScopeTargetFiltersLocked) {
      return
    }

    if (
      filters.scopeStage != null ||
      filters.scope != null ||
      filters.part != null
    ) {
      onScopeStageChange(null)
    }
  }, [
    filters.part,
    filters.scope,
    filters.scopeStage,
    onScopeStageChange,
    staffScopeTargetFiltersLocked,
  ])

  return (
    <div className="flex flex-nowrap items-center gap-(--umc-spacing-gap-16)">
      {filters.audience === "challenger" ? (
        <>
          <Select
            aria-label="지부"
            className={NOTICE_FILTER_SELECT_TYPO_CLASS}
            disabled={isOrganizationLoading || filters.schoolScope != null}
            onValueChange={(value) => {
              const chapterScope = isNoticeListFilterAllValue(value)
                ? null
                : value
              onChapterScopeChange(chapterScope)
              if (chapterScope != null) {
                onSchoolScopeChange(null)
              }
            }}
            options={[
              { label: "지부 전체", value: NOTICE_LIST_FILTER_ALL },
              ...chapterSelectOptions,
            ]}
            placeholder="지부 전체"
            size="md"
            value={filters.chapterScope}
            variant={filterSelectVariant(filters.chapterScope)}
          />
          <Select
            aria-label="학교"
            className={NOTICE_FILTER_SELECT_TYPO_CLASS}
            disabled={isOrganizationLoading || filters.chapterScope != null}
            onValueChange={(value) => {
              const schoolScope = isNoticeListFilterAllValue(value)
                ? null
                : value
              onSchoolScopeChange(schoolScope)
              if (schoolScope != null) {
                onChapterScopeChange(null)
              }
            }}
            options={[
              { label: "학교 전체", value: NOTICE_LIST_FILTER_ALL },
              ...schoolSelectOptions,
            ]}
            placeholder="학교 전체"
            size="md"
            value={filters.schoolScope}
            variant={filterSelectVariant(filters.schoolScope)}
          />
          <Select
            aria-label="파트"
            className={NOTICE_FILTER_SELECT_TYPO_CLASS}
            disabled={isOrganizationLoading}
            onValueChange={(value) => {
              onPartChange(
                isNoticeListFilterAllValue(value)
                  ? null
                  : (value as NoticePart),
              )
            }}
            options={challengerPartSelectOptions}
            placeholder="파트 전체"
            size="md"
            value={filters.part}
            variant={filterSelectVariant(filters.part)}
          />
        </>
      ) : (
        <>
          <Select
            aria-label="받는 사람"
            className={NOTICE_FILTER_SELECT_TYPO_CLASS}
            disabled={isOrganizationLoading}
            onValueChange={(value) => {
              const staffRecipient = isNoticeListFilterAllValue(value)
                ? null
                : (value as NoticeCreateStaffScope)
              onStaffRecipientChange(staffRecipient)
              if (
                staffRecipient != null &&
                isStaffCentralNoticeTab(staffRecipient)
              ) {
                onScopeStageChange(null)
              }
            }}
            options={staffRecipientSelectOptions}
            placeholder="받는 사람"
            size="md"
            value={filters.staffRecipient}
            variant={filterSelectVariant(filters.staffRecipient)}
          />
          <Select
            aria-label="공지 범위 단계"
            className={NOTICE_FILTER_SELECT_TYPO_CLASS}
            disabled={isOrganizationLoading || staffScopeTargetFiltersLocked}
            onValueChange={(value) => {
              if (isNoticeListFilterAllValue(value)) {
                onScopeStageChange(null)
                return
              }

              onScopeStageChange(value as NoticeScopeStage)
            }}
            options={STAFF_NOTICE_LIST_SCOPE_STAGE_OPTIONS}
            placeholder="범위 전체"
            size="md"
            value={filters.scopeStage}
            variant={filterSelectVariant(filters.scopeStage)}
          />
          <Select
            aria-label="공지 대상"
            className={NOTICE_FILTER_SELECT_TYPO_CLASS}
            disabled={
              staffScopeTargetFiltersLocked ||
              !filters.scopeStage ||
              isOrganizationLoading
            }
            onValueChange={(value) => {
              if (!filters.scopeStage) {
                return
              }

              if (isNoticeListFilterAllValue(value)) {
                if (filters.scopeStage === "part") {
                  onPartChange(null)
                } else {
                  onScopeChange(null)
                }
                return
              }

              if (filters.scopeStage === "part") {
                onPartChange(value as NoticePart)
                return
              }

              onScopeChange(value)
            }}
            options={staffTargetSelectOptions}
            placeholder="대상 전체"
            size="md"
            value={staffTargetSelectValue}
            variant={filterSelectVariant(staffTargetSelectValue)}
          />
        </>
      )}
      <SearchField
        aria-label="공지 검색"
        className="w-[300px] shrink-0"
        clearable
        onChange={(event) => {
          setQueryInput(event.target.value)
        }}
        placeholder="제목 · 본문으로 검색할 수 있어요"
        value={queryInput}
      />
    </div>
  )
}
