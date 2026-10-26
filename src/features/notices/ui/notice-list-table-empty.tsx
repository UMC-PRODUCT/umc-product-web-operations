import { MegaphoneIcon, WarningIcon } from "@umc-product/icons"

import type { NoticeListTableEmptyState } from "../model/resolve-notice-list-ui-state"

export type NoticeListTableEmptyProps = NoticeListTableEmptyState

function NoticeListRegisteredEmpty() {
  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)"
      role="status"
    >
      <MegaphoneIcon
        aria-hidden
        className="text-icon-disabled"
        size={44}
        weight="fill"
      />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-6) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          아직 등록된 공지가 없어요
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          상단 [공지 작성] 버튼을 눌러 첫 공지를 등록해 보세요
        </p>
      </div>
    </div>
  )
}

/** Figma NT-L01 검색 결과 없음(472:9299) — 검색어가 있을 때만 사용 */
function NoticeListSearchEmpty({ query }: { query: string }) {
  const trimmedQuery = query.trim()

  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)"
      role="status"
    >
      <WarningIcon
        aria-hidden
        className="text-icon-disabled"
        size={48}
        weight="fill"
      />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-8) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          {`'${trimmedQuery}'을 찾을 수 없어요`}
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          검색어를 다르게 입력하거나 필터를 변경해 보세요
        </p>
      </div>
    </div>
  )
}

export function NoticeListTableEmpty(props: NoticeListTableEmptyProps) {
  if (props.variant === "registered") {
    return <NoticeListRegisteredEmpty />
  }

  return <NoticeListSearchEmpty query={props.query} />
}
