import { useNavigate } from "@tanstack/react-router"
import { AddIcon } from "@umc-product/icons"
import { Button, Tab, TabList, Tabs } from "@umc-product/react"
import { useMemo, useState } from "react"

import { filterNotices } from "../model/filter-notices"
import { MOCK_NOTICES } from "../model/mock-notices"
import { isNoticeListFilterForbidden } from "../model/notice-list-scope"
import { NoticeListFiltersBar } from "./notice-list-filters"
import { NoticeListTable } from "./notice-list-table"
import { useNoticeListOutcomeToasts } from "./use-notice-list-outcome-toasts"

import type {
  NoticeDeleteOutcome,
  NoticeImageRegisterOutcome,
  NoticeListLoadOutcome,
  NoticePublishOutcome,
} from "../model/notice-outcomes"
import type { NoticeAudience, NoticeListFilters } from "../model/types"

type NoticeListPageProps = {
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
  range: "all",
  target: "all",
}

export function NoticeListPage({
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
  const [audience, setAudience] = useState<NoticeAudience>("challenger")
  const [filters, setFilters] =
    useState<Omit<NoticeListFilters, "audience">>(DEFAULT_FILTERS)

  const notices = useMemo(
    () =>
      filterNotices(MOCK_NOTICES, {
        ...filters,
        audience,
      }),
    [audience, filters],
  )

  const registeredNotices = useMemo(
    () =>
      filterNotices(MOCK_NOTICES, {
        audience,
        query: "",
        range: "all",
        target: "all",
      }),
    [audience],
  )

  const isListError = listOutcome === "network_error"
  const isFilterScopeForbidden = isNoticeListFilterForbidden(filters)
  const isListForbidden = listOutcome === "forbidden" || isFilterScopeForbidden

  const tableEmptyState = useMemo(() => {
    if (isListError || isListForbidden) {
      return null
    }

    if (notices.length > 0) {
      return null
    }

    if (registeredNotices.length === 0) {
      return { variant: "registered" as const }
    }

    const trimmedQuery = filters.query.trim()
    if (trimmedQuery.length > 0) {
      return { variant: "search" as const, query: trimmedQuery }
    }

    return null
  }, [
    filters.query,
    isListError,
    isListForbidden,
    notices.length,
    registeredNotices.length,
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
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-20) pl-(--umc-spacing-padding-12)">
        <div className="flex w-full items-end">
          <Tabs
            className="w-auto shrink-0"
            onValueChange={(value) => {
              setAudience(value as NoticeAudience)
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
          filters={{ ...filters, audience }}
          onQueryChange={(query) => {
            setFilters((current) => ({ ...current, query }))
          }}
          onRangeChange={(range) => {
            setFilters((current) => ({ ...current, range }))
          }}
          onTargetChange={(target) => {
            setFilters((current) => ({ ...current, target }))
          }}
        />

        <NoticeListTable
          emptyState={tableEmptyState}
          isError={isListError}
          isForbidden={isListForbidden}
          notices={notices}
          onOpenNotice={(noticeId) => {
            void navigate({
              to: "/notices/$noticeId",
              params: { noticeId },
            })
          }}
          onRetry={() => {
            void navigate({
              to: "/notices",
              search: {},
              replace: true,
            })
          }}
        />
      </div>
    </section>
  )
}
