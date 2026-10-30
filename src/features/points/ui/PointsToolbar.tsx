import { SearchField, Select } from "@umc-product/react"

import type { OrganizationFilterOption } from "../model/map-search-member"
import type { MemberPartFilter } from "../model/types"

const ALL_OPTION = "all"

const PART_OPTIONS = [
  { value: ALL_OPTION, label: "파트 전체" },
  { value: "pm", label: "PM" },
  { value: "design", label: "Design" },
  { value: "web-pe", label: "Web PE" },
  { value: "mobile-pe", label: "Mobile PE" },
] as const

function toFilterValue<T extends string>(value: string | null): T | null {
  if (value == null || value === ALL_OPTION) {
    return null
  }
  return value as T
}

type PointsToolbarProps = {
  chapterId: string | null
  chapterOptions: readonly OrganizationFilterOption[]
  chapterDisabled?: boolean
  onChapterChange: (value: string | null) => void
  schoolId: string | null
  schoolOptions: readonly OrganizationFilterOption[]
  schoolDisabled?: boolean
  onSchoolChange: (value: string | null) => void
  part: MemberPartFilter | null
  onPartChange: (value: MemberPartFilter | null) => void
  query: string
  onQueryChange: (value: string) => void
}

export function PointsToolbar({
  chapterId,
  chapterOptions,
  chapterDisabled = false,
  onChapterChange,
  schoolId,
  schoolOptions,
  schoolDisabled = false,
  onSchoolChange,
  part,
  onPartChange,
  query,
  onQueryChange,
}: PointsToolbarProps) {
  return (
    <div className="flex flex-nowrap items-center gap-(--umc-spacing-gap-12)">
      <Select
        aria-label="지부"
        className="w-auto shrink-0"
        disabled={chapterDisabled}
        onValueChange={(value) => onChapterChange(toFilterValue(value))}
        options={[{ value: ALL_OPTION, label: "지부 전체" }, ...chapterOptions]}
        placeholder="지부 전체"
        size="md"
        value={chapterId}
      />
      <Select
        aria-label="학교"
        className="w-auto shrink-0"
        disabled={schoolDisabled}
        onValueChange={(value) => onSchoolChange(toFilterValue(value))}
        options={[{ value: ALL_OPTION, label: "학교 전체" }, ...schoolOptions]}
        placeholder="학교 전체"
        size="md"
        value={schoolId}
      />
      <Select
        aria-label="파트"
        className="w-auto shrink-0"
        onValueChange={(value) =>
          onPartChange(toFilterValue<MemberPartFilter>(value))
        }
        options={[...PART_OPTIONS]}
        placeholder="파트 전체"
        size="md"
        value={part}
      />
      <SearchField
        aria-label="구성원 검색"
        className="w-[400px] shrink-0"
        clearable
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="이름 / 닉네임 / 이메일로 검색하세요"
        value={query}
      />
    </div>
  )
}
