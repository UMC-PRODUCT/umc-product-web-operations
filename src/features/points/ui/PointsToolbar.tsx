import { SearchField, Select } from "@umc-product/react"

import type {
  MemberPartFilter,
  MemberRegion,
  MemberSchool,
} from "../model/types"

const REGION_OPTIONS = [
  { value: "seoul", label: "서울" },
  { value: "gyeonggi", label: "경기" },
  { value: "chungcheong", label: "충청" },
] as const

const SCHOOL_OPTIONS = [
  { value: "cau", label: "중앙대학교" },
  { value: "snu", label: "서울대학교" },
  { value: "yonsei", label: "연세대학교" },
] as const

const PART_OPTIONS = [
  { value: "pm", label: "PM" },
  { value: "design", label: "Design" },
  { value: "web-pe", label: "Web PE" },
  { value: "mobile-pe", label: "Mobile PE" },
] as const

type PointsToolbarProps = {
  region: MemberRegion | null
  onRegionChange: (value: MemberRegion | null) => void
  school: MemberSchool | null
  onSchoolChange: (value: MemberSchool | null) => void
  part: MemberPartFilter | null
  onPartChange: (value: MemberPartFilter | null) => void
  query: string
  onQueryChange: (value: string) => void
}

export function PointsToolbar({
  region,
  onRegionChange,
  school,
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
        onValueChange={(value) => onRegionChange(value as MemberRegion | null)}
        options={[...REGION_OPTIONS]}
        placeholder="지부 전체"
        size="md"
        value={region}
      />
      <Select
        aria-label="학교"
        className="w-auto shrink-0"
        onValueChange={(value) => onSchoolChange(value as MemberSchool | null)}
        options={[...SCHOOL_OPTIONS]}
        placeholder="학교 전체"
        size="md"
        value={school}
      />
      <Select
        aria-label="파트"
        className="w-auto shrink-0"
        onValueChange={(value) =>
          onPartChange(value as MemberPartFilter | null)
        }
        options={[...PART_OPTIONS]}
        placeholder="파트 전체"
        size="md"
        value={part}
      />
      <SearchField
        aria-label="구성원 검색"
        className="w-[300px] shrink-0"
        clearable
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="이름 · 닉네임으로 검색할 수 있어요"
        value={query}
      />
    </div>
  )
}
