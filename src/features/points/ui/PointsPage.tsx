import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Pagination } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { useSelectedGisu } from "@/shared/model/selected-gisu"

import { fetchGisuOrganization } from "../api/gisu-organization"
import { MEMBER_SEARCH_PAGE_SIZE, searchMembers } from "../api/member-search"
import { isForbiddenError } from "../model/http-status"
import {
  toChapterOptions,
  toMemberSearchPart,
  toOrganizationId,
  toPointsMember,
  toSchoolOptions,
} from "../model/map-search-member"
import { MemberTable } from "./MemberTable"
import { PointsToolbar } from "./PointsToolbar"
import { useDebouncedValue } from "./use-debounced-value"

import type { MemberPartFilter } from "../model/types"

type LockedSchool = {
  schoolId: string
  schoolName: string
}

type PointsPageProps = {
  lockedSchool?: LockedSchool | null
}

const SEARCH_DEBOUNCE_MS = 300

function toTotalPages(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return 0
  }
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export function PointsPage({ lockedSchool = null }: PointsPageProps) {
  const navigate = useNavigate()
  const selectedGisu = useSelectedGisu()
  const sectionRef = useRef<HTMLElement>(null)
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [part, setPart] = useState<MemberPartFilter | null>(null)
  const [query, setQuery] = useState("")
  const keyword = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const [page, setPage] = useState(0)

  const resetPage = () => {
    setPage(0)
  }

  const lockedSchoolId = lockedSchool?.schoolId ?? null
  const filtersLocked = lockedSchool != null
  const selectedChapterId = toOrganizationId(filtersLocked ? null : chapterId)
  const selectedSchoolId = toOrganizationId(lockedSchool?.schoolId ?? schoolId)

  const organizationQuery = useQuery({
    queryKey: ["gisu", "organization", selectedGisu.gisuId],
    queryFn: () => fetchGisuOrganization(selectedGisu.gisuId ?? undefined),
    enabled: !selectedGisu.isPending,
    retry: false,
  })

  useEffect(() => {
    setChapterId(null)
    setPage(0)
    if (lockedSchoolId == null) {
      setSchoolId(null)
    }
  }, [lockedSchoolId, selectedGisu.gisuId])

  useEffect(() => {
    if (
      lockedSchoolId != null ||
      schoolId == null ||
      selectedChapterId == null
    ) {
      return
    }
    const allowed = toSchoolOptions(
      organizationQuery.data ?? [],
      selectedChapterId,
    ).some((option) => option.value === schoolId)
    if (!allowed) {
      setSchoolId(null)
    }
  }, [lockedSchoolId, organizationQuery.data, schoolId, selectedChapterId])

  const chapterOptions = useMemo(
    () => toChapterOptions(organizationQuery.data ?? []),
    [organizationQuery.data],
  )
  const schoolOptions = useMemo(() => {
    const options = toSchoolOptions(
      organizationQuery.data ?? [],
      selectedChapterId,
    )
    if (
      lockedSchool == null ||
      options.some((option) => option.value === lockedSchool.schoolId) ||
      lockedSchool.schoolName === ""
    ) {
      return options
    }
    return [
      { value: lockedSchool.schoolId, label: lockedSchool.schoolName },
      ...options,
    ]
  }, [lockedSchool, organizationQuery.data, selectedChapterId])

  const membersQuery = useQuery({
    queryKey: [
      "challengers",
      "search",
      {
        keyword,
        gisuId: selectedGisu.gisuId,
        part,
        chapterId: selectedChapterId,
        schoolId: selectedSchoolId,
        page,
        size: MEMBER_SEARCH_PAGE_SIZE,
      },
    ],
    queryFn: () =>
      searchMembers({
        keyword: keyword || undefined,
        gisuId: selectedGisu.gisuId ?? undefined,
        part: toMemberSearchPart(part),
        chapterId: selectedChapterId,
        schoolId: selectedSchoolId,
        page,
        size: MEMBER_SEARCH_PAGE_SIZE,
      }),
    enabled: !selectedGisu.isPending,
    placeholderData: keepPreviousData,
    retry: false,
  })

  const members = (membersQuery.data?.page?.content ?? []).map(toPointsMember)
  const totalPages = toTotalPages(membersQuery.data?.page?.totalPages)
  const isForbidden = isForbiddenError(membersQuery.error)
  const isLoading =
    (membersQuery.isPending && !isForbidden) ||
    (membersQuery.isFetching && membersQuery.isError)
  const isError =
    membersQuery.isError && !isForbidden && !membersQuery.isFetching
  const showPagination =
    totalPages > 1 &&
    !isLoading &&
    !isError &&
    !isForbidden &&
    members.length > 0

  return (
    <section
      className="flex flex-col gap-(--umc-spacing-gap-32) pl-(--umc-spacing-padding-12)"
      ref={sectionRef}
    >
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
          chapterDisabled={filtersLocked}
          chapterId={filtersLocked ? null : chapterId}
          chapterOptions={chapterOptions}
          onChapterChange={(value) => {
            setChapterId(value)
            resetPage()
          }}
          onPartChange={(value) => {
            setPart(value)
            resetPage()
          }}
          onQueryChange={(value) => {
            setQuery(value)
            resetPage()
          }}
          onSchoolChange={(value) => {
            setSchoolId(value)
            resetPage()
          }}
          part={part}
          query={query}
          schoolDisabled={filtersLocked}
          schoolId={lockedSchool?.schoolId ?? schoolId}
          schoolOptions={schoolOptions}
        />
        <div className="w-full min-w-0 [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-[1158px] max-w-[1158px] shrink-0 flex-col items-center gap-(--umc-spacing-gap-20)">
            <MemberTable
              isError={isError}
              isForbidden={isForbidden}
              isLoading={isLoading}
              members={isLoading || isError || isForbidden ? [] : members}
              onAssignPoints={(memberId) => {
                const member = members.find((item) => item.id === memberId)
                void navigate({
                  to: "/activity/points/$memberId",
                  params: { memberId },
                  search:
                    member?.challengerId != null
                      ? { challengerId: member.challengerId }
                      : {},
                })
              }}
              onRetry={() => {
                void membersQuery.refetch()
              }}
              query={keyword}
            />
            {showPagination ? (
              <Pagination
                className="w-full justify-center"
                onPageChange={(nextPage) => {
                  setPage(nextPage - 1)
                  sectionRef.current?.scrollIntoView({ block: "start" })
                }}
                page={page + 1}
                totalPages={totalPages}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
