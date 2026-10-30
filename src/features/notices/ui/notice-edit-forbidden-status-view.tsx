import { useNavigate } from "@tanstack/react-router"
import { WarningIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

import {
  NOTICE_EDIT_FORBIDDEN_DESCRIPTION,
  NOTICE_EDIT_FORBIDDEN_TITLE,
} from "../model/notice-outcomes"

import type { NoticeAudience } from "../model/types"

type NoticeEditForbiddenStatusViewProps = {
  listAudience?: NoticeAudience
}

/** Figma 888:31367 — 공지 수정 권한 없음 (주소 직접 진입) */
export function NoticeEditForbiddenStatusView({
  listAudience,
}: NoticeEditForbiddenStatusViewProps) {
  const navigate = useNavigate()

  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) pt-[80px] pr-(--umc-spacing-padding-20) pb-[40px]"
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
          {NOTICE_EDIT_FORBIDDEN_TITLE}
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          {NOTICE_EDIT_FORBIDDEN_DESCRIPTION}
        </p>
      </div>
      <Button
        color="white"
        onClick={() => {
          void navigate({
            search: listAudience ? { audience: listAudience } : {},
            to: "/notices",
          })
        }}
        size="xs"
        type="button"
        variant="fill"
      >
        목록으로
      </Button>
    </div>
  )
}
