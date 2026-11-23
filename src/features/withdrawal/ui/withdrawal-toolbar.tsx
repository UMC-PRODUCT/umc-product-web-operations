import { SearchField, Select } from "@umc-product/react"

import {
  WITHDRAWAL_REASON_FILTER_OPTIONS,
  WITHDRAWAL_STATUS_FILTER_OPTIONS,
} from "../model/mock-withdrawals"

type FilterOption = { value: string; label: string }

const ALL_OPTION = "all"

function toFilterValue(value: string | null): string | null {
  if (value == null || value === ALL_OPTION) {
    return null
  }
  return value
}

function filterSelectVariant(value: string | null): "default" | "filter" {
  return value ? "filter" : "default"
}

type WithdrawalToolbarProps = {
  chapterId: string | null
  chapterOptions: readonly FilterOption[]
  onChapterChange: (value: string | null) => void
  schoolId: string | null
  schoolOptions: readonly FilterOption[]
  onSchoolChange: (value: string | null) => void
  part: string | null
  partOptions: readonly FilterOption[]
  onPartChange: (value: string | null) => void
  reason: string | null
  onReasonChange: (value: string | null) => void
  status: string | null
  onStatusChange: (value: string | null) => void
  query: string
  onQueryChange: (value: string) => void
}

export function WithdrawalToolbar({
  chapterId,
  chapterOptions,
  onChapterChange,
  schoolId,
  schoolOptions,
  onSchoolChange,
  part,
  partOptions,
  onPartChange,
  reason,
  onReasonChange,
  status,
  onStatusChange,
  query,
  onQueryChange,
}: WithdrawalToolbarProps) {
  return (
    <div className="flex flex-nowrap items-center gap-(--umc-spacing-gap-12)">
      <Select
        aria-label="지부"
        className="w-auto shrink-0"
        onValueChange={(value) => onChapterChange(toFilterValue(value))}
        options={[{ value: ALL_OPTION, label: "지부 전체" }, ...chapterOptions]}
        placeholder="지부 전체"
        size="md"
        value={chapterId}
        variant={filterSelectVariant(chapterId)}
      />
      <Select
        aria-label="학교"
        className="w-auto shrink-0"
        onValueChange={(value) => onSchoolChange(toFilterValue(value))}
        options={[{ value: ALL_OPTION, label: "학교 전체" }, ...schoolOptions]}
        placeholder="학교 전체"
        size="md"
        value={schoolId}
        variant={filterSelectVariant(schoolId)}
      />
      <Select
        aria-label="파트"
        className="w-auto shrink-0"
        onValueChange={(value) => onPartChange(toFilterValue(value))}
        options={[{ value: ALL_OPTION, label: "파트 전체" }, ...partOptions]}
        placeholder="파트 전체"
        size="md"
        value={part}
        variant={filterSelectVariant(part)}
      />
      <Select
        aria-label="사유"
        className="w-auto shrink-0"
        onValueChange={(value) => onReasonChange(toFilterValue(value))}
        options={[
          { value: ALL_OPTION, label: "사유 전체" },
          ...WITHDRAWAL_REASON_FILTER_OPTIONS,
        ]}
        placeholder="사유 전체"
        size="md"
        value={reason}
        variant={filterSelectVariant(reason)}
      />
      <Select
        aria-label="탈부 현황"
        className="w-auto shrink-0"
        onValueChange={(value) => onStatusChange(toFilterValue(value))}
        options={[
          { value: ALL_OPTION, label: "탈부 현황" },
          ...WITHDRAWAL_STATUS_FILTER_OPTIONS,
        ]}
        placeholder="탈부 현황"
        size="md"
        value={status}
        variant={filterSelectVariant(status)}
      />
      <SearchField
        aria-label="구성원 검색"
        className="min-w-0 flex-1"
        clearable
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="이름 · 닉네임 · 이메일로 검색할 수 있어요"
        value={query}
      />
    </div>
  )
}
