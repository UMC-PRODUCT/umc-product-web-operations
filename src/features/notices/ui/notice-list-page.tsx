import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AddIcon } from "@umc-product/icons"
import { Button, Pagination, Tab, TabList, Tabs } from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"

import { noticeListOrganizationQueryOptions } from "../model/notice-list-organization-query"
import {
  noticeListQueryOptions,
  type NoticeListQueryResult,
} from "../model/notice-list-query"
import { parseNoticeListAudience } from "../model/notice-list-route-search"
import {
  canCreateNotice,
  type NoticeOperatorSession,
} from "../model/notice-session"
import {
  isNoticeListClientFilterForbidden,
  isNoticeListScopeOutOfOrganization,
  resolveNoticeListTableEmptyState,
} from "../model/resolve-notice-list-ui-state"
import { NoticeListFiltersBar } from "./notice-list-filters"
import { NoticeListTable } from "./notice-list-table"
import { useNoticeListOutcomeToasts } from "./use-notice-list-outcome-toasts"

import type {
  NoticeDeleteOutcome,
  NoticeImageRegisterOutcome,
  NoticeListLoadOutcome,
  NoticePublishOutcome,
} from "../model/notice-outcomes"
import type { Notice, NoticeAudience, NoticeListFilters } from "../model/types"

type NoticeListPageProps = {
  audience?: NoticeAudience
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
  scopeStage: null,
  scope: null,
  part: null,
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

export function NoticeListPage({
  audience: audienceFromRoute,
  session,
  deleteOutcome,
  imageRegisterOutcome,
  listOutcome,
  publishOutcome,
}: NoticeListPageProps) {
  const navigate = useNavigate()
  useNoticeListOutcomeToasts({
    deleteOutcome,
    imageRegisterOutcome,
    publishOutcome,
  })
  const audience = parseNoticeListAudience(audienceFromRoute)
  const showCreateNoticeButton = canCreateNotice(session)
  const [filters, setFilters] =
    useState<Omit<NoticeListFilters, "audience">>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [audience, session.gisuId])

  useEffect(() => {
    setPage(1)
  }, [filters.part, filters.query, filters.scope])

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

    return resolveNoticeListTableEmptyState({
      audience,
      filters,
      hasLoadedList,
      noticeCount: listState.notices.length,
      registeredTotal,
    })
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
              void navigate({ to: "/notices/new" })
            }}
            size="sm"
            type="button"
          >
            공지 작성
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-20) pl-(--umc-spacing-padding-12)">
        <div className="flex w-full items-end">
          <Tabs
            className="w-auto shrink-0"
            onValueChange={(value) => {
              void navigate({
                search: { audience: value as NoticeAudience },
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
          isOrganizationLoading={organizationQuery.isLoading}
          onPartChange={(part) => {
            setFilters((current) => ({ ...current, part }))
          }}
          onQueryChange={(query) => {
            setFilters((current) => ({ ...current, query }))
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
          schoolOptions={organizationQuery.data?.schools ?? []}
        />

        <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-20)">
          <NoticeListTable
            emptyState={tableEmptyState}
            isError={listState.isError}
            isForbidden={isForbidden}
            isLoading={listState.isLoading}
            notices={listState.notices}
            onOpenNotice={(noticeId) => {
              void navigate({
                params: { noticeId },
                search: { listAudience: audience },
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
