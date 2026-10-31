import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { NoticeListPage } from "@/features/notices"
import {
  parseNoticeListAudienceOptional,
  parseNoticeListFiltersFromSearch,
  parseNoticeListPage,
} from "@/features/notices/model/notice-list-route-search"
import { useSelectedGisu } from "@/shared/model/selected-gisu"

import { toNoticeOperatorSession } from "./-notice-session"

import type { NoticePart } from "@/features/notices/api/notice-api.types"
import type { NoticeCreateStaffScope } from "@/features/notices/model/notice-create-form"
import type {
  NoticeDeleteOutcome,
  NoticeImageRegisterOutcome,
  NoticeListLoadOutcome,
  NoticePublishOutcome,
} from "@/features/notices/model/notice-outcomes"
import type { NoticeScopeStage } from "@/features/notices/model/notice-scope-stage"
import type { NoticeAudience } from "@/features/notices/model/types"

type NoticesSearch = {
  audience?: NoticeAudience
  /** 목록 검색·필터 (뒤로가기 복원용) */
  chapterScope?: string
  q?: string
  schoolScope?: string
  scopeStage?: NoticeScopeStage
  scope?: string
  part?: NoticePart
  staffRecipient?: NoticeCreateStaffScope
  page?: number
  deleteOutcome?: NoticeDeleteOutcome
  /** TODO: API 연동 시 제거. 이미지 등록 성공 Toast 시뮬레이션용 */
  imageRegisterOutcome?: NoticeImageRegisterOutcome
  /** TODO: API 연동 시 제거. 목록 조회 결과 시뮬레이션용 */
  listOutcome?: NoticeListLoadOutcome
  /** TODO: API 연동 시 제거. 등록 성공 Toast 시뮬레이션용 */
  publishOutcome?: NoticePublishOutcome
}

export const Route = createFileRoute("/_admin/notices/")({
  validateSearch: (search: Record<string, unknown>): NoticesSearch => {
    const audience =
      parseNoticeListAudienceOptional(search.audience) ?? "challenger"
    const { filters, page } = parseNoticeListFiltersFromSearch(search, {
      audience,
    })

    return {
      audience: parseNoticeListAudienceOptional(search.audience),
      chapterScope: filters.chapterScope ?? undefined,
      q: filters.query || undefined,
      schoolScope: filters.schoolScope ?? undefined,
      scopeStage: filters.scopeStage ?? undefined,
      scope: filters.scope ?? undefined,
      part: filters.part ?? undefined,
      staffRecipient: filters.staffRecipient ?? undefined,
      page: page > 1 ? page : undefined,
      deleteOutcome:
        search.deleteOutcome === "success" ? search.deleteOutcome : undefined,
      imageRegisterOutcome:
        search.imageRegisterOutcome === "success"
          ? search.imageRegisterOutcome
          : undefined,
      listOutcome:
        search.listOutcome === "network_error" ||
        search.listOutcome === "forbidden"
          ? search.listOutcome
          : undefined,
      publishOutcome:
        search.publishOutcome === "success" ? search.publishOutcome : undefined,
    }
  },
  component: NoticesPage,
})

const adminRouteApi = getRouteApi("/_admin")

function NoticesPage() {
  const search = Route.useSearch()
  const {
    audience,
    chapterScope,
    deleteOutcome,
    imageRegisterOutcome,
    listOutcome,
    page,
    part,
    publishOutcome,
    q,
    schoolScope,
    scope,
    scopeStage,
    staffRecipient,
  } = search
  const { session } = adminRouteApi.useRouteContext()
  const { gisuId: selectedGisuId } = useSelectedGisu()

  return (
    <NoticeListPage
      audience={audience}
      deleteOutcome={deleteOutcome}
      imageRegisterOutcome={imageRegisterOutcome}
      listChapterScope={chapterScope}
      listOutcome={listOutcome}
      listPage={parseNoticeListPage(page)}
      listPart={part}
      routeListQuery={q}
      listSchoolScope={schoolScope}
      listScope={scope}
      listScopeStage={scopeStage}
      listStaffRecipient={staffRecipient}
      publishOutcome={publishOutcome}
      session={toNoticeOperatorSession(session, { gisuId: selectedGisuId })}
    />
  )
}
