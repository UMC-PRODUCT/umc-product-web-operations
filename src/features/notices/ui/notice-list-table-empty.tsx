import { MegaphoneIcon, WarningIcon } from "@umc-product/icons"

import { EmptyState } from "@/shared/ui/empty-state"

import type { NoticeListTableEmptyState } from "../model/resolve-notice-list-ui-state"

export type NoticeListTableEmptyProps = NoticeListTableEmptyState

function NoticeListRegisteredEmpty() {
  return (
    <EmptyState
      description="상단 [공지 작성] 버튼을 눌러 첫 공지를 등록해 보세요"
      icon={
        <MegaphoneIcon
          aria-hidden
          className="text-icon-disabled"
          size={44}
          weight="fill"
        />
      }
      textGap={6}
      title="아직 등록된 공지가 없어요"
    />
  )
}

const NOTICE_LIST_FILTER_HINT =
  "검색어를 다르게 입력하거나 필터를 변경해 보세요"

function NoticeListWarningIcon() {
  return (
    <WarningIcon
      aria-hidden
      className="text-icon-disabled"
      size={48}
      weight="fill"
    />
  )
}

/** Figma NT-L01 검색 결과 없음(472:9299) */
function NoticeListSearchEmpty({ query }: { query: string }) {
  const trimmedQuery = query.trim()

  return (
    <EmptyState
      description={NOTICE_LIST_FILTER_HINT}
      icon={<NoticeListWarningIcon />}
      title={`'${trimmedQuery}'을 찾을 수 없어요`}
    />
  )
}

/** Figma NT-L01 필터 결과 없음 — 범위·파트 등 (검색어 없음) */
function NoticeListNoMatchEmpty() {
  return (
    <EmptyState
      description={NOTICE_LIST_FILTER_HINT}
      icon={<NoticeListWarningIcon />}
      title="해당하는 공지가 없어요"
    />
  )
}

export function NoticeListTableEmpty(props: NoticeListTableEmptyProps) {
  if (props.variant === "registered") {
    return <NoticeListRegisteredEmpty />
  }

  if (props.variant === "search") {
    return <NoticeListSearchEmpty query={props.query} />
  }

  return <NoticeListNoMatchEmpty />
}
