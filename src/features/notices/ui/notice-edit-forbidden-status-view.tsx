import { useNavigate } from "@tanstack/react-router"
import { Button } from "@umc-product/react"

import { FullPageError } from "@/shared/ui/full-page-error"

import { buildNoticeLocationState } from "../model/notice-location-state"
import {
  NOTICE_EDIT_FORBIDDEN_DESCRIPTION,
  NOTICE_EDIT_FORBIDDEN_TITLE,
} from "../model/notice-outcomes"
import { useNoticeLocationStateFromLocation } from "./use-notice-location-state"

/** Figma 888:31367 — 공지 수정 권한 없음 (주소 직접 진입) */
export function NoticeEditForbiddenStatusView() {
  const navigate = useNavigate()
  const locationState = useNoticeLocationStateFromLocation()

  return (
    <FullPageError
      actions={
        <Button
          color="white"
          onClick={() => {
            void navigate({
              state: buildNoticeLocationState({
                listAudience: locationState.listAudience,
                listPage: locationState.listPage,
              }),
              to: "/notices",
            })
          }}
          size="xs"
          type="button"
          variant="fill"
        >
          목록으로
        </Button>
      }
      body={NOTICE_EDIT_FORBIDDEN_DESCRIPTION}
      placement="content"
      role="status"
      title={NOTICE_EDIT_FORBIDDEN_TITLE}
    />
  )
}
