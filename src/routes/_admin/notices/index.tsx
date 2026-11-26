import { createFileRoute, getRouteApi } from "@tanstack/react-router"

import { useSelectedGisu } from "@/entities/gisu"
import { NoticeListPage } from "@/features/notices"
import { parseNoticeListFiltersFromSearch } from "@/features/notices"

import { toNoticeOperatorSession } from "./-notice-session"

import type { NoticePart } from "@/features/notices"
import type { NoticeCreateStaffScope } from "@/features/notices"
import type { NoticeListScopeStage } from "@/features/notices"

type NoticesSearch = {
  /** 목록 검색·필터 (뒤로가기 복원용). 탭·페이지는 history/local state */
  chapterScope?: string
  q?: string
  schoolScope?: string
  scopeStage?: NoticeListScopeStage
  scope?: string
  part?: NoticePart
  staffRecipient?: NoticeCreateStaffScope
}

export const Route = createFileRoute("/_admin/notices/")({
  validateSearch: (search: Record<string, unknown>): NoticesSearch => {
    // audience는 URL에 없으므로 챌린저·운영진 형태를 모두 읽어 두고,
    // 페이지에서 현재 탭 기준으로 normalize한다.
    const challenger = parseNoticeListFiltersFromSearch(search, {
      audience: "challenger",
    }).filters
    const staff = parseNoticeListFiltersFromSearch(search, {
      audience: "staff",
    }).filters
    const query = challenger.query.trim()

    return {
      chapterScope: challenger.chapterScope ?? undefined,
      q: query || undefined,
      schoolScope: challenger.schoolScope ?? undefined,
      scopeStage: staff.scopeStage ?? undefined,
      scope: staff.scope ?? undefined,
      part: challenger.part ?? staff.part ?? undefined,
      staffRecipient: staff.staffRecipient ?? undefined,
    }
  },
  component: NoticesPage,
})

const adminRouteApi = getRouteApi("/_admin")

function NoticesPage() {
  const search = Route.useSearch()
  const {
    chapterScope,
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
      listChapterScope={chapterScope}
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
