import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Pagination } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { useSelectedGisu } from "@/entities/gisu"
import { gisuOrganizationQueryOptions } from "@/entities/organization"

import { MEMBER_SEARCH_PAGE_SIZE, searchMembers } from "../api/member-search"
import { challengerKeys } from "../model/challenger-keys"
import { isForbiddenError } from "../model/http-status"
import {
  getPartFilterOptions,
  toChapterOptions,
  toMemberSearchPart,
  toOrganizationId,
  toPointsMember,
  toSchoolOptions,
} from "../model/map-search-member"
import { MOCK_MEMBERS } from "../model/mock-members"
import {
  toPointsListPageIndex,
  toPointsListPageParam,
} from "../model/points-list-search"
import {
  buildPointsLocationState,
  rememberPointsListView,
} from "../model/points-location-state"
import { MemberTable } from "./MemberTable"
import { PointsToolbar } from "./PointsToolbar"
import { useDebouncedValue } from "./use-debounced-value"

import type { PointsListSearch } from "../model/points-list-search"

type LockedSchool = {
  schoolId: string
  schoolName: string
}

type PointsPageProps = {
  lockedSchool?: LockedSchool | null
  /** URL `?mock=roles` — 운영 역할 다중 표시 목 데이터 */
  mock?: "roles"
  /** 목록 필터 (history state 단일 소스) */
  search: PointsListSearch
  onSearchChange: (patch: PointsListSearch) => void
}

const SEARCH_DEBOUNCE_MS = 300

function toTotalPages(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return 0
  }
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export function PointsPage({
  lockedSchool = null,
  mock,
  search,
  onSearchChange,
}: PointsPageProps) {
  const navigate = useNavigate()
  const selectedGisu = useSelectedGisu()
  const sectionRef = useRef<HTMLElement>(null)
  const keyword = search.q ?? ""
  const [queryInput, setQueryInput] = useState(keyword)
  const debouncedQuery = useDebouncedValue(
    queryInput.trim(),
    SEARCH_DEBOUNCE_MS,
  )
  const page = toPointsListPageIndex(search.page)
  const useMockRoles = mock === "roles"
  const partOptions = useMemo(
    () => getPartFilterOptions(selectedGisu.generation),
    [selectedGisu.generation],
  )

  const lockedSchoolId = lockedSchool?.schoolId ?? null
  const filtersLocked = lockedSchool != null
  const chapterId = filtersLocked ? null : (search.chapter ?? null)
  const selectedChapterId = toOrganizationId(chapterId)

  const organizationQuery = useQuery({
    ...gisuOrganizationQueryOptions(selectedGisu.gisuId),
    enabled: !selectedGisu.isPending && selectedGisu.gisuId != null,
    retry: false,
  })

  const schoolId = useMemo(() => {
    if (lockedSchoolId != null) {
      return lockedSchoolId
    }
    const requested = search.school ?? null
    if (requested == null || selectedChapterId == null) {
      return requested
    }
    const allowed = toSchoolOptions(
      organizationQuery.data,
      selectedChapterId,
    ).some((option) => option.value === requested)
    return allowed ? requested : null
  }, [lockedSchoolId, organizationQuery.data, search.school, selectedChapterId])
  const selectedSchoolId = toOrganizationId(schoolId)

  const requestedPart = search.part ?? null
  const part =
    requestedPart != null &&
    !selectedGisu.isPending &&
    !partOptions.some((option) => option.value === requestedPart)
      ? null
      : requestedPart

  const onSearchChangeRef = useRef(onSearchChange)
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange
  }, [onSearchChange])

  /** 마지막으로 URL과 맞춘 검색어. 우리가 보낸 값이 되돌아온 경우 입력창을 덮어쓰지 않는다 */
  const syncedQueryRef = useRef(keyword)

  useEffect(() => {
    if (keyword === syncedQueryRef.current) {
      return
    }
    syncedQueryRef.current = keyword
    setQueryInput(keyword)
  }, [keyword])

  useEffect(() => {
    if (debouncedQuery === syncedQueryRef.current) {
      return
    }
    syncedQueryRef.current = debouncedQuery
    onSearchChangeRef.current({
      page: undefined,
      q: debouncedQuery === "" ? undefined : debouncedQuery,
    })
  }, [debouncedQuery])

  const previousGisuIdRef = useRef(selectedGisu.gisuId)
  useEffect(() => {
    const previousGisuId = previousGisuIdRef.current
    previousGisuIdRef.current = selectedGisu.gisuId
    if (
      previousGisuId == null ||
      selectedGisu.gisuId == null ||
      previousGisuId === selectedGisu.gisuId
    ) {
      return
    }
    onSearchChangeRef.current({
      chapter: undefined,
      page: undefined,
      part: undefined,
      ...(lockedSchoolId == null ? { school: undefined } : {}),
    })
  }, [lockedSchoolId, selectedGisu.gisuId])

  const chapterOptions = useMemo(
    () => toChapterOptions(organizationQuery.data),
    [organizationQuery.data],
  )
  const schoolOptions = useMemo(() => {
    const options = toSchoolOptions(organizationQuery.data, selectedChapterId)
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
    queryKey: challengerKeys.search({
      keyword,
      gisuId: selectedGisu.gisuId,
      part,
      chapterId: selectedChapterId,
      schoolId: selectedSchoolId,
      page,
      size: MEMBER_SEARCH_PAGE_SIZE,
    }),
    queryFn: () =>
      searchMembers({
        keyword: keyword || undefined,
        gisuId: selectedGisu.gisuId ?? undefined,
        part: toMemberSearchPart(part, selectedGisu.generation),
        chapterId: selectedChapterId,
        schoolId: selectedSchoolId,
        page,
        size: MEMBER_SEARCH_PAGE_SIZE,
      }),
    enabled: !useMockRoles && !selectedGisu.isPending,
    placeholderData: keepPreviousData,
    retry: false,
  })

  const members = useMockRoles
    ? MOCK_MEMBERS
    : (membersQuery.data?.page?.content ?? []).map(toPointsMember)
  const totalPages = useMockRoles
    ? 1
    : toTotalPages(membersQuery.data?.page?.totalPages)
  const isForbidden = !useMockRoles && isForbiddenError(membersQuery.error)
  const isLoading =
    !useMockRoles &&
    ((membersQuery.isPending && !isForbidden) ||
      (membersQuery.isFetching && membersQuery.isError))
  const isError =
    !useMockRoles &&
    membersQuery.isError &&
    !isForbidden &&
    !membersQuery.isFetching
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
          chapterId={chapterId}
          chapterOptions={chapterOptions}
          onChapterChange={(value) => {
            const schoolStillAllowed =
              value == null ||
              schoolId == null ||
              lockedSchoolId != null ||
              toSchoolOptions(
                organizationQuery.data,
                toOrganizationId(value),
              ).some((option) => option.value === schoolId)
            onSearchChange({
              chapter: value ?? undefined,
              page: undefined,
              ...(schoolStillAllowed ? {} : { school: undefined }),
            })
          }}
          onPartChange={(value) => {
            onSearchChange({ page: undefined, part: value ?? undefined })
          }}
          onQueryChange={setQueryInput}
          onSchoolChange={(value) => {
            onSearchChange({ page: undefined, school: value ?? undefined })
          }}
          part={part}
          partOptions={partOptions}
          query={queryInput}
          schoolDisabled={filtersLocked}
          schoolId={schoolId}
          schoolOptions={schoolOptions}
        />
        <div className="flex w-full min-w-0 flex-col items-center gap-(--umc-spacing-gap-20)">
          <MemberTable
            isError={isError}
            isForbidden={isForbidden}
            isLoading={isLoading}
            members={isLoading || isError || isForbidden ? [] : members}
            onAssignPoints={(memberId) => {
              const challengerId = members.find(
                (item) => item.id === memberId,
              )?.challengerId
              if (challengerId == null) {
                return
              }
              rememberPointsListView(search)
              void navigate({
                to: "/activity/points/$challengerId",
                params: { challengerId: String(challengerId) },
                state: buildPointsLocationState(search),
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
                onSearchChange({ page: toPointsListPageParam(nextPage - 1) })
                sectionRef.current?.scrollIntoView({ block: "start" })
              }}
              page={page + 1}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
