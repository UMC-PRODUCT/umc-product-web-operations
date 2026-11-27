import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AddIcon } from "@umc-product/icons"
import { Button, Pagination, Tab, TabList, Tabs } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { toOrganizationLists } from "@/entities/organization"

import { normalizeNoticeListFiltersForApi } from "../model/build-notice-list-params"
import { normalizeNoticeListFilters } from "../model/normalize-notice-list-filters"
import {
  NOTICE_CHAPTER_ADMIN_STAFF_LIST_RECIPIENTS,
  resolveNoticeChapterPresidentChallengerLock,
} from "../model/notice-chapter-president-access"
import { noticeCreateGisuListQueryOptions } from "../model/notice-create-gisu-query"
import { resolveNoticeCreatePartOptions } from "../model/notice-create-part-options"
import { noticeListOrganizationQueryOptions } from "../model/notice-list-organization-query"
import {
  noticeListQueryOptions,
  type NoticeListQueryResult,
} from "../model/notice-list-query"
import {
  areNoticeListFilterSearchParamsEqual,
  buildNoticeListFilterSearchParams,
  parseNoticeListAudience,
} from "../model/notice-list-route-search"
import {
  buildNoticeLocationState,
  noticeFiltersFromLocationState,
  rememberNoticeListView,
  resolveNoticeListViewState,
} from "../model/notice-location-state"
import {
  isNoticeSchoolExecutiveContext,
  NOTICE_SCHOOL_EXECUTIVE_STAFF_LIST_RECIPIENTS,
  resolveNoticeSchoolExecutiveLock,
} from "../model/notice-school-executive-access"
import {
  NOTICE_SCHOOL_STAFF_STAFF_LIST_RECIPIENTS,
  resolveNoticeSchoolStaffLock,
} from "../model/notice-school-staff-access"
import {
  encodeChapterScope,
  encodeSchoolScope,
} from "../model/notice-scope-filter"
import {
  canCreateNotice,
  type NoticeOperatorSession,
} from "../model/notice-session"
import {
  hasAppliedNoticeListApiFilters,
  isNoticeListClientFilterForbidden,
  isNoticeListScopeOutOfOrganization,
  resolveNoticeListTableEmptyState,
} from "../model/resolve-notice-list-ui-state"
import { NoticeListFiltersBar } from "./notice-list-filters"
import { NoticeListTable } from "./notice-list-table"
import { useNoticeLocationStateFromLocation } from "./use-notice-location-state"

import type { NoticeListFilterFields } from "../model/normalize-notice-list-filters"
import type { NoticeAdminAccessContext } from "../model/notice-admin-access-context"
import type { Notice, NoticeAudience, NoticeListFilters } from "../model/types"

type NoticeListPageProps = {
  adminSession: NoticeAdminAccessContext
  session: NoticeOperatorSession
}

const DEFAULT_FILTERS: Omit<NoticeListFilters, "audience"> = {
  query: "",
  chapterScope: null,
  schoolScope: null,
  part: null,
  scopeStage: null,
  scope: null,
  staffRecipient: null,
}

function resolveListLoadState(
  queryResult: NoticeListQueryResult | undefined,
  isFetching: boolean,
): {
  isError: boolean
  isForbidden: boolean
  isLoading: boolean
  notices: Notice[]
  registeredTotal: number
} {
  if (!queryResult) {
    return {
      isError: false,
      isForbidden: false,
      isLoading: isFetching,
      notices: [],
      registeredTotal: 0,
    }
  }

  if (queryResult.kind === "network_error") {
    return {
      isError: true,
      isForbidden: false,
      isLoading: false,
      notices: [],
      registeredTotal: 0,
    }
  }

  if (queryResult.kind === "forbidden" || queryResult.kind === "missing_gisu") {
    return {
      isError: false,
      isForbidden: true,
      isLoading: false,
      notices: [],
      registeredTotal: 0,
    }
  }

  return {
    isError: false,
    isForbidden: false,
    isLoading: false,
    notices: queryResult.notices,
    registeredTotal: queryResult.totalElements,
  }
}

export function NoticeListPage({ adminSession, session }: NoticeListPageProps) {
  const navigate = useNavigate()
  const rawLocationState = useNoticeLocationStateFromLocation()
  const locationState = useMemo(
    () => resolveNoticeListViewState(rawLocationState),
    [rawLocationState],
  )
  const audience = parseNoticeListAudience(locationState.listAudience)
  const [page, setPage] = useState(() => locationState.listPage ?? 1)
  const showCreateNoticeButton = canCreateNotice(session)

  useEffect(() => {
    if (locationState.listPage != null) {
      setPage(locationState.listPage)
    }
  }, [locationState.listPage])

  const routeFilters = useMemo(
    () => noticeFiltersFromLocationState(locationState, audience),
    [audience, locationState],
  )

  const commitListView = (input: {
    listAudience?: NoticeAudience
    listPage?: number
    filters: Omit<NoticeListFilters, "audience">
  }) => {
    const nextState = buildNoticeLocationState({
      listAudience: input.listAudience ?? audience,
      listPage: input.listPage ?? page,
      listFilters: buildNoticeListFilterSearchParams({
        audience: input.listAudience ?? audience,
        filters: input.filters,
      }),
    })
    rememberNoticeListView(nextState)
    return nextState
  }

  const previousGisuIdRef = useRef(session.gisuId)

  useEffect(() => {
    if (previousGisuIdRef.current === session.gisuId) {
      return
    }

    previousGisuIdRef.current = session.gisuId
    setPage(1)
    const nextState = commitListView({
      listPage: 1,
      filters: DEFAULT_FILTERS,
    })
    void navigate({
      replace: true,
      search: {},
      state: nextState,
      to: "/notices",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 기수 변경 시에만 필터 초기화
  }, [navigate, session.gisuId])

  const gisuListQuery = useQuery(noticeCreateGisuListQueryOptions())

  const listGisuGeneration = useMemo(() => {
    if (session.gisuId == null) {
      return null
    }
    return (
      gisuListQuery.data?.find((gisu) => gisu.gisuId === session.gisuId)
        ?.generation ?? null
    )
  }, [gisuListQuery.data, session.gisuId])

  const partFilterOptions = useMemo(
    () => resolveNoticeCreatePartOptions(listGisuGeneration),
    [listGisuGeneration],
  )

  const organizationQuery = useQuery(
    noticeListOrganizationQueryOptions(session.gisuId),
  )

  const organizationLists = useMemo(
    () => toOrganizationLists(organizationQuery.data),
    [organizationQuery.data],
  )

  const chapterPresidentLockResult = useMemo(
    () =>
      resolveNoticeChapterPresidentChallengerLock(
        adminSession,
        organizationLists,
      ),
    [adminSession, organizationLists],
  )

  const chapterPresidentContext =
    chapterPresidentLockResult.status === "locked"
      ? chapterPresidentLockResult.lock
      : null

  const chapterPresidentUnresolved =
    chapterPresidentLockResult.status === "unresolved"

  const schoolExecutiveLock = useMemo(
    () => resolveNoticeSchoolExecutiveLock(adminSession, organizationLists),
    [adminSession, organizationLists],
  )

  const schoolStaffLock = useMemo(
    () => resolveNoticeSchoolStaffLock(adminSession, organizationLists),
    [adminSession, organizationLists],
  )

  const schoolScopedOrganizationLock = schoolExecutiveLock ?? schoolStaffLock

  const chapterPresidentChallengerLock =
    audience === "challenger" ? chapterPresidentContext : null

  const schoolExecutiveChallengerLock =
    audience === "challenger" ? schoolScopedOrganizationLock : null

  const schoolExecutiveStaffLock =
    audience === "staff" ? schoolScopedOrganizationLock : null

  const schoolStaffStaffFiltersActive =
    audience === "staff" &&
    schoolStaffLock != null &&
    !isNoticeSchoolExecutiveContext(adminSession)

  const chapterPresidentStaffListActive =
    audience === "staff" && chapterPresidentContext != null

  const schoolExecutiveStaffListActive =
    audience === "staff" &&
    schoolExecutiveStaffLock != null &&
    isNoticeSchoolExecutiveContext(adminSession)

  const staffRecipientScopeAllowlist = useMemo(() => {
    if (chapterPresidentStaffListActive) {
      return NOTICE_CHAPTER_ADMIN_STAFF_LIST_RECIPIENTS
    }

    if (schoolStaffStaffFiltersActive) {
      return NOTICE_SCHOOL_STAFF_STAFF_LIST_RECIPIENTS
    }

    if (schoolExecutiveStaffListActive) {
      return NOTICE_SCHOOL_EXECUTIVE_STAFF_LIST_RECIPIENTS
    }

    return null
  }, [
    chapterPresidentStaffListActive,
    schoolExecutiveStaffListActive,
    schoolStaffStaffFiltersActive,
  ])

  const staffFixedStaffRecipient = null

  const staffListFiltersDisabled = chapterPresidentUnresolved

  const staffScopeTargetListDisabled =
    chapterPresidentStaffListActive ||
    schoolExecutiveStaffListActive ||
    schoolStaffStaffFiltersActive

  const staffRecipientFilterVariant = chapterPresidentStaffListActive
    ? ("chapterAdmin" as const)
    : schoolExecutiveStaffListActive || schoolStaffStaffFiltersActive
      ? ("schoolAdmin" as const)
      : ("default" as const)

  const chapterPresidentChallengerListScope = useMemo(() => {
    if (
      audience !== "challenger" ||
      chapterPresidentChallengerLock == null ||
      session.gisuId == null
    ) {
      return null
    }

    return {
      chapterId: chapterPresidentChallengerLock.chapterId,
      schoolIdsInChapter: chapterPresidentChallengerLock.schoolOptions.map(
        (school) => school.schoolId,
      ),
      sessionGisuId: session.gisuId,
    }
  }, [audience, chapterPresidentChallengerLock, session.gisuId])

  const challengerLockedChapterScope = chapterPresidentUnresolved
    ? null
    : (chapterPresidentChallengerLock?.chapterScope ??
      schoolExecutiveChallengerLock?.chapterScope ??
      null)

  const challengerListSchoolOptions = useMemo(() => {
    if (chapterPresidentUnresolved) {
      return []
    }

    if (chapterPresidentChallengerLock != null) {
      return chapterPresidentChallengerLock.schoolOptions
    }

    if (schoolExecutiveChallengerLock != null) {
      return [
        {
          schoolId: schoolExecutiveChallengerLock.schoolId,
          schoolName: schoolExecutiveChallengerLock.schoolName,
        },
      ]
    }

    return organizationLists.schools
  }, [
    chapterPresidentChallengerLock,
    chapterPresidentUnresolved,
    organizationLists.schools,
    schoolExecutiveChallengerLock,
  ])

  const chapterScopeOptions = useMemo(
    () =>
      organizationLists.chapters.map((chapter) =>
        encodeChapterScope(chapter.id),
      ),
    [organizationLists.chapters],
  )

  const schoolScopeOptions = useMemo(
    () =>
      challengerListSchoolOptions.map((school) =>
        encodeSchoolScope(school.schoolId),
      ),
    [challengerListSchoolOptions],
  )

  const partScopeOptions = useMemo(
    () => partFilterOptions.map((option) => option.value),
    [partFilterOptions],
  )

  const challengerLockedSchoolScope =
    schoolExecutiveChallengerLock?.schoolScope ?? null
  const staffLockedSchoolScope = schoolExecutiveStaffLock?.schoolScope ?? null
  const isOrganizationLoading =
    organizationQuery.isLoading || gisuListQuery.isLoading

  const filters = useMemo(
    () =>
      normalizeNoticeListFilters(routeFilters, {
        audience,
        challengerLockedSchoolScope,
        chapterScopeOptions,
        lockedChapterScope: challengerLockedChapterScope,
        optionsReady: !isOrganizationLoading,
        partOptions: partScopeOptions,
        schoolScopeOptions,
        staffFixedStaffRecipient,
        staffLockedSchoolScope,
        staffRecipientScopeAllowlist,
        staffScopeTargetListLocked: staffScopeTargetListDisabled,
      }),
    [
      audience,
      challengerLockedChapterScope,
      challengerLockedSchoolScope,
      chapterScopeOptions,
      isOrganizationLoading,
      partScopeOptions,
      routeFilters,
      schoolScopeOptions,
      staffFixedStaffRecipient,
      staffLockedSchoolScope,
      staffRecipientScopeAllowlist,
      staffScopeTargetListDisabled,
    ],
  )

  const navigateToListFilters = (nextFilters: NoticeListFilterFields) => {
    const nextSearch = buildNoticeListFilterSearchParams({
      audience,
      filters: nextFilters,
    })
    const currentSearch = buildNoticeListFilterSearchParams({
      audience,
      filters,
    })

    if (areNoticeListFilterSearchParamsEqual(nextSearch, currentSearch)) {
      return
    }

    setPage(1)
    const nextState = commitListView({
      listPage: 1,
      filters: nextFilters,
    })
    void navigate({
      replace: true,
      search: {},
      state: nextState,
      to: "/notices",
    })
  }

  const handleFiltersChange = (patch: Partial<NoticeListFilterFields>) => {
    navigateToListFilters({ ...filters, ...patch })
  }

  const listQuery = useQuery(
    noticeListQueryOptions({
      audience,
      chapterPresidentChallengerListScope,
      chapterPresidentStaffListActive: chapterPresidentStaffListActive,
      filters,
      page: page - 1,
      session,
    }),
  )

  const registeredQuery = useQuery(
    noticeListQueryOptions({
      audience,
      chapterPresidentChallengerListScope,
      chapterPresidentStaffListActive: chapterPresidentStaffListActive,
      filters: DEFAULT_FILTERS,
      page: 0,
      session,
    }),
  )

  const listState = resolveListLoadState(
    listQuery.data,
    listQuery.isFetching && !listQuery.data,
  )

  const registeredTotal =
    registeredQuery.data?.kind === "success"
      ? registeredQuery.data.totalElements
      : listState.registeredTotal

  const hasLoadedList = listQuery.data?.kind === "success"

  const isClientFilterForbidden =
    isNoticeListClientFilterForbidden({
      audience,
      filters,
    }) ||
    isNoticeListScopeOutOfOrganization({
      audience,
      filters,
      organization: organizationQuery.data == null ? null : organizationLists,
    })

  const isForbidden = listState.isForbidden || isClientFilterForbidden

  const totalPages =
    listQuery.data?.kind === "success" ? listQuery.data.totalPages : 0

  useEffect(() => {
    if (listQuery.data?.kind !== "success") {
      return
    }

    const loadedTotalPages = listQuery.data.totalPages
    if (loadedTotalPages === 0) {
      if (page !== 1) {
        setPage(1)
      }
      return
    }

    if (page > loadedTotalPages) {
      setPage(loadedTotalPages)
    }
  }, [listQuery.data, page])

  const showPagination =
    !listState.isLoading &&
    !listState.isError &&
    !isForbidden &&
    listState.notices.length > 0 &&
    totalPages > 1

  const tableEmptyState = useMemo(() => {
    if (listState.isError || isForbidden || listState.isLoading) {
      return null
    }

    const resolved = resolveNoticeListTableEmptyState({
      audience,
      filters,
      hasLoadedList,
      noticeCount: listState.notices.length,
      registeredTotal,
    })
    if (resolved) {
      return resolved
    }

    if (
      hasLoadedList &&
      listState.notices.length === 0 &&
      hasAppliedNoticeListApiFilters({
        audience,
        filters: normalizeNoticeListFiltersForApi({ audience, filters }),
      })
    ) {
      return { variant: "noMatch" as const }
    }

    return null
  }, [
    audience,
    filters,
    hasLoadedList,
    isForbidden,
    listState.isError,
    listState.isLoading,
    listState.notices.length,
    registeredTotal,
  ])

  return (
    <section className="flex w-full flex-col gap-(--umc-spacing-gap-32)">
      <div className="flex items-start justify-between gap-(--umc-spacing-gap-16) pl-(--umc-spacing-padding-12)">
        <div className="flex min-w-0 flex-col gap-(--umc-spacing-gap-12)">
          <h1 className="text-heading-2-semibold text-neutral-default-900">
            공지 목록
          </h1>
          <p className="text-body-3-regular text-neutral-medium-600">
            게시된 공지를 확인하고 관리해요
          </p>
        </div>
        {showCreateNoticeButton ? (
          <Button
            className="shrink-0"
            leadingIcon={<AddIcon aria-hidden size={14} />}
            onClick={() => {
              void navigate({ to: "/notices/new", search: {} })
            }}
            size="sm"
            type="button"
          >
            공지 작성하기
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-20) pl-(--umc-spacing-padding-12)">
        <div className="flex w-full items-end">
          <Tabs
            className="w-auto shrink-0"
            onValueChange={(value) => {
              const nextAudience = value as NoticeAudience
              setPage(1)
              const nextState = commitListView({
                listAudience: nextAudience,
                listPage: 1,
                filters: DEFAULT_FILTERS,
              })
              void navigate({
                replace: true,
                search: {},
                state: nextState,
                to: "/notices",
              })
            }}
            value={audience}
          >
            <TabList aria-label="공지 유형" className="w-auto shrink-0">
              <Tab value="challenger">챌린저 공지</Tab>
              <Tab value="staff">운영진 공지</Tab>
            </TabList>
          </Tabs>
          <div
            aria-hidden
            className="border-b-neutral-weak-200 h-[44px] min-w-0 flex-1 border-b-2"
          />
        </div>

        <NoticeListFiltersBar
          key={`${audience}-${session.gisuId ?? "none"}`}
          chapterOptions={organizationLists.chapters}
          filters={{ ...filters, audience }}
          isOrganizationLoading={isOrganizationLoading}
          challengerLockedSchoolScope={challengerLockedSchoolScope}
          lockedChapterScope={challengerLockedChapterScope}
          staffListFiltersDisabled={staffListFiltersDisabled}
          staffRecipientFilterVariant={staffRecipientFilterVariant}
          staffScopeTargetListDisabled={staffScopeTargetListDisabled}
          staffFixedStaffRecipient={staffFixedStaffRecipient}
          staffLockedSchoolScope={staffLockedSchoolScope}
          staffRecipientScopeAllowlist={staffRecipientScopeAllowlist}
          partOptions={partFilterOptions}
          onFiltersChange={handleFiltersChange}
          onQueryChange={(query) => {
            handleFiltersChange({ query })
          }}
          schoolOptions={challengerListSchoolOptions}
        />

        <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-20)">
          <NoticeListTable
            audience={audience}
            emptyState={tableEmptyState}
            isError={listState.isError}
            isForbidden={isForbidden}
            isLoading={listState.isLoading}
            notices={listState.notices}
            onOpenNotice={(noticeId) => {
              const nextState = commitListView({
                listPage: page,
                filters,
              })
              void navigate({
                params: { noticeId },
                state: nextState,
                to: "/notices/$noticeId",
              })
            }}
            onRetry={() => {
              void listQuery.refetch()
              void registeredQuery.refetch()
            }}
          />
          {showPagination ? (
            <Pagination
              onPageChange={(nextPage) => {
                setPage(nextPage)
                const nextState = commitListView({
                  listPage: nextPage,
                  filters,
                })
                void navigate({
                  replace: true,
                  search: {},
                  state: nextState,
                  to: "/notices",
                })
              }}
              page={page}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
