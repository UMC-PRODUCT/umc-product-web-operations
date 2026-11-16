import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { useSelectedGisu } from "@/entities/gisu"
import { NoticeListPage } from "@/features/notices"
import {
  parseNoticeListAudienceOptional,
  parseNoticeListFiltersFromSearch,
  parseNoticeListPage,
} from "@/features/notices"

import { toNoticeOperatorSession } from "./-notice-session"

import type { NoticePart } from "@/features/notices"
import type { NoticeCreateStaffScope } from "@/features/notices"
import type { NoticeScopeStage } from "@/features/notices"
import type { NoticeAudience } from "@/features/notices"

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
    page,
    part,
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
      listChapterScope={chapterScope}
      listPage={parseNoticeListPage(page)}
      listPart={part}
      routeListQuery={q}
      listSchoolScope={schoolScope}
      listScope={scope}
      listScopeStage={scopeStage}
      listStaffRecipient={staffRecipient}
      adminSession={session}
      session={toNoticeOperatorSession(session, { gisuId: selectedGisuId })}
    />
  )
}
