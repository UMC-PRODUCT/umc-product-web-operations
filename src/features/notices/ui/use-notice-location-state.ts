import { useRouterState } from "@tanstack/react-router"

import { parseNoticeLocationState } from "../model/notice-location-state"

import type { NoticeLocationState } from "../model/notice-location-state"
import type { NoticeAudience } from "../model/types"

/** 현재 history state의 목록 복원값. 새로고침·직접 진입 시 비어 있을 수 있다 */
export function useNoticeLocationStateFromLocation(): NoticeLocationState {
  return useRouterState({
    select: (state) => parseNoticeLocationState(state.location.state),
  })
}

/** 현재 history state의 목록 탭 */
export function useNoticeListAudienceFromLocation():
  NoticeAudience | undefined {
  return useNoticeLocationStateFromLocation().listAudience
}
