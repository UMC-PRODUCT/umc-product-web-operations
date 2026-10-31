import { useQuery } from "@tanstack/react-query"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { AddIcon } from "@umc-product/icons"
import { Button, Pagination, Tab, TabList, Tabs } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { normalizeNoticeListFiltersForApi } from "../model/build-notice-list-params"
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
  parseNoticeListAudienceOptional,
  parseNoticeListFiltersFromSearch,
} from "../model/notice-list-route-search"
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
import { useNoticeListOutcomeToasts } from "./use-notice-list-outcome-toasts"

import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "../model/notice-create-form"
import type {
  NoticeDeleteOutcome,
  NoticeImageRegisterOutcome,
  NoticeListLoadOutcome,
  NoticePublishOutcome,
} from "../model/notice-outcomes"
import type { NoticeScopeStage } from "../model/notice-scope-stage"
import type { Notice, NoticeAudience, NoticeListFilters } from "../model/types"

type NoticeListPageProps = {
  audience?: NoticeAudience
  listChapterScope?: string
  listPage?: number
  listPart?: NoticePart
  routeListQuery?: string
  listSchoolScope?: string
  listScope?: string
  listScopeStage?: NoticeScopeStage
  listStaffRecipient?: NoticeCreateStaffScope
  session: NoticeOperatorSession
  /** TODO: API 연동 시 제거. 삭제 성공 Toast 시뮬레이션용 */
  deleteOutcome?: NoticeDeleteOutcome
  /** TODO: API 연동 시 제거. 이미지 등록 성공 Toast 시뮬레이션용 */
  imageRegisterOutcome?: NoticeImageRegisterOutcome
  /** TODO: API 연동 시 제거. 목록 조회 결과 시뮬레이션용 */
  listOutcome?: NoticeListLoadOutcome
  /** TODO: API 연동 시 제거. 등록 성공 Toast 시뮬레이션용 */
  publishOutcome?: NoticePublishOutcome
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
  mockOutcome: NoticeListLoadOutcome | undefined,
  queryResult: NoticeListQueryResult | undefined,
  isFetching: boolean,
): {
  isError: boolean
  isForbidden: boolean
  isLoading: boolean
  notices: Notice[]
  registeredTotal: number
} {
  if (mockOutcome === "network_error") {
    return {
      isError: true,
      isForbidden: false,
      isLoading: false,
      notices: [],
      registeredTotal: 0,
    }
  }

  if (mockOutcome === "forbidden") {
    return {
      isError: false,
      isForbidden: true,
      isLoading: false,
      notices: [],
      registeredTotal: 0,
    }
  }

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

function filtersFromListRouteSearch(input: {
  audience: NoticeAudience
  listChapterScope?: string
  listPage?: number
  listPart?: NoticePart
  routeListQuery?: string
  listSchoolScope?: string
  listScope?: string
  listScopeStage?: NoticeScopeStage
  listStaffRecipient?: NoticeCreateStaffScope
}): { filters: Omit<NoticeListFilters, "audience">; page: number } {
  return parseNoticeListFiltersFromSearch(
    {
      audience: input.audience,
      chapterScope: input.listChapterScope,
      page: input.listPage,
      part: input.listPart,
      q: input.routeListQuery,
      schoolScope: input.listSchoolScope,
      scope: input.listScope,
      scopeStage: input.listScopeStage,
      staffRecipient: input.listStaffRecipient,
    },
    { audience: input.audience },
  )
}

export function NoticeListPage({
  audience: audienceFromRoute,
  listChapterScope,
  listPage,
  listPart,
  routeListQuery,
  listSchoolScope,
  listScope,
  listScopeStage,
  listStaffRecipient,
  session,
  deleteOutcome,
  imageRegisterOutcome,
  listOutcome,
  publishOutcome,
}: NoticeListPageProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const locationSearch = useRouterState({
    select: (state) => state.location.search,
  })
  useNoticeListOutcomeToasts({
    deleteOutcome,
    imageRegisterOutcome,
    publishOutcome,
  })
  const audience = parseNoticeListAudience(audienceFromRoute)
  const showCreateNoticeButton = canCreateNotice(session)
  const routeListState = useMemo(
    () =>
      filtersFromListRouteSearch({
        audience,
        listChapterScope,
        listPage,
        listPart,
        routeListQuery,
        listSchoolScope,
        listScope,
        listScopeStage,
        listStaffRecipient,
      }),
    [
      audience,
      listChapterScope,
      listPage,
      listPart,
      routeListQuery,
      listSchoolScope,
      listScope,
      listScopeStage,
      listStaffRecipient,
    ],
  )
  const [filters, setFilters] = useState(routeListState.filters)
  const [page, setPage] = useState(routeListState.page)
  const skipNextUrlSyncRef = useRef(false)

  useEffect(() => {
    setFilters(routeListState.filters)
    setPage(routeListState.page)
    skipNextUrlSyncRef.current = true
  }, [routeListState])

  useEffect(() => {
    if (pathname !== "/notices" && pathname !== "/notices/") {
      return
    }

    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false
      return
    }

    const searchRecord = locationSearch as Record<string, unknown>
    const urlAudience = parseNoticeListAudience(
      parseNoticeListAudienceOptional(searchRecord.audience) ?? audience,
    )
    const { filters: filtersInUrl, page: pageInUrl } =
      parseNoticeListFiltersFromSearch(searchRecord, { audience: urlAudience })
    const nextSearch = buildNoticeListFilterSearchParams({
      audience: urlAudience,
      filters: {
        chapterScope: filters.chapterScope,
        part: filters.part,
        query: filters.query,
        schoolScope: filters.schoolScope,
        scope: filters.scope,
        scopeStage: filters.scopeStage,
        staffRecipient: filters.staffRecipient,
      },
      page,
    })
    const currentSearch = buildNoticeListFilterSearchParams({
      audience: urlAudience,
      filters: filtersInUrl,
      page: pageInUrl,
    })

    if (areNoticeListFilterSearchParamsEqual(nextSearch, currentSearch)) {
      return
    }

    void navigate({
      replace: true,
      search: nextSearch,
      to: "/notices",
    })
  }, [
    audience,
    filters.chapterScope,
    filters.part,
    filters.query,
    filters.schoolScope,
    filters.scope,
    filters.scopeStage,
    filters.staffRecipient,
    locationSearch,
    navigate,
    page,
    pathname,
  ])

  const previousGisuIdRef = useRef(session.gisuId)

  useEffect(() => {
    if (previousGisuIdRef.current === session.gisuId) {
      return
    }

    previousGisuIdRef.current = session.gisuId
    skipNextUrlSyncRef.current = true
    setFilters(DEFAULT_FILTERS)
    setPage(1)
    void navigate({
      replace: true,
      search: { audience },
      to: "/notices",
    })
  }, [audience, navigate, session.gisuId])

  useEffect(() => {
    setPage(1)
  }, [
    filters.chapterScope,
    filters.part,
    filters.query,
    filters.schoolScope,
    filters.scope,
    filters.scopeStage,
    filters.staffRecipient,
  ])

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

  const listQuery = useQuery(
    noticeListQueryOptions({
      audience,
      filters,
      page: page - 1,
      session,
    }),
  )

  const registeredQuery = useQuery(
    noticeListQueryOptions({
      audience,
      filters: DEFAULT_FILTERS,
      page: 0,
      session,
    }),
  )

  const listState = resolveListLoadState(
    listOutcome,
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
      organization: organizationQuery.data ?? null,
    })

  const isForbidden = listState.isForbidden || isClientFilterForbidden

  const totalPages =
    listQuery.data?.kind === "success" ? listQuery.data.totalPages : 0

  const showPagination =
    !listState.isLoading && !listState.isError && !isForbidden && totalPages > 1

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
              skipNextUrlSyncRef.current = true
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
              skipNextUrlSyncRef.current = true
              setFilters(DEFAULT_FILTERS)
              setPage(1)
              void navigate({
                search: { audience: nextAudience },
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
          chapterOptions={organizationQuery.data?.chapters ?? []}
          filters={{ ...filters, audience }}
          isOrganizationLoading={
            organizationQuery.isLoading || gisuListQuery.isLoading
          }
          partOptions={partFilterOptions}
          onChapterScopeChange={(chapterScope) => {
            setFilters((current) => ({ ...current, chapterScope }))
          }}
          onPartChange={(part) => {
            setFilters((current) => ({ ...current, part }))
          }}
          onQueryChange={(query) => {
            setFilters((current) => ({ ...current, query }))
          }}
          onSchoolScopeChange={(schoolScope) => {
            setFilters((current) => ({ ...current, schoolScope }))
          }}
          onScopeChange={(scope) => {
            setFilters((current) => ({ ...current, scope }))
          }}
          onScopeStageChange={(scopeStage) => {
            setFilters((current) => ({
              ...current,
              part: null,
              scope: null,
              scopeStage,
            }))
          }}
          onStaffRecipientChange={(staffRecipient) => {
            setFilters((current) => ({ ...current, staffRecipient }))
          }}
          schoolOptions={organizationQuery.data?.schools ?? []}
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
              const listSearch = buildNoticeListFilterSearchParams({
                audience,
                filters: { ...filters, query: filters.query },
                page,
              })

              void navigate({
                replace: true,
                search: listSearch,
                to: "/notices",
              }).then(() => {
                void navigate({
                  params: { noticeId },
                  search: { listAudience: audience },
                  to: "/notices/$noticeId",
                })
              })
            }}
            onRetry={() => {
              void listQuery.refetch()
              void registeredQuery.refetch()
            }}
          />
          {showPagination ? (
            <Pagination
              onPageChange={setPage}
              page={page}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
