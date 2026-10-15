import { useMemo, useState } from "react"

import { filterMembers } from "../model/filter-members"
import { MOCK_MEMBERS } from "../model/mock-members"
import { MemberTable } from "./MemberTable"
import { PointsToolbar } from "./PointsToolbar"

import type {
  MemberPartFilter,
  MemberRegion,
  MemberSchool,
} from "../model/types"

export function PointsPage() {
  const [region, setRegion] = useState<MemberRegion | null>(null)
  const [school, setSchool] = useState<MemberSchool | null>(null)
  const [part, setPart] = useState<MemberPartFilter | null>(null)
  const [query, setQuery] = useState("")

  const members = useMemo(
    () =>
      filterMembers({
        members: MOCK_MEMBERS,
        region,
        school,
        part,
        query,
      }),
    [part, query, region, school],
  )

  return (
    <section className="flex flex-col gap-(--umc-spacing-gap-32)">
      <div className="flex flex-col gap-(--umc-spacing-gap-12)">
        <h1 className="text-heading-2-semibold text-neutral-default-900">
          상벌점 관리
        </h1>
        <p className="text-body-3-regular text-neutral-medium-600">
          구성원에게 상벌점을 주거나 내역을 확인해요
        </p>
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-20)">
        <PointsToolbar
          onPartChange={setPart}
          onQueryChange={setQuery}
          onRegionChange={setRegion}
          onSchoolChange={setSchool}
          part={part}
          query={query}
          region={region}
          school={school}
        />
        <MemberTable
          members={members}
          onAssignPoints={() => {
            // 상벌점 부여 플로우는 후속 작업에서 연결
          }}
        />
      </div>
    </section>
  )
}
