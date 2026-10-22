export type NoticePublishOutcome = "success"
export type NoticeDeleteOutcome = "success"

/** TODO: API 연동 시 제거. 목록 조회 결과 시뮬레이션용 */
export type NoticeListLoadOutcome = "network_error" | "forbidden"

export const NOTICE_PUBLISH_TOAST_MESSAGE = "공지를 등록했어요"
export const NOTICE_DELETE_TOAST_MESSAGE = "공지를 삭제했어요"

/** Strict Mode·effect 재실행 시 등록 성공 Toast 중복 방지 (TODO: API 연동 시 제거) */
let publishSuccessToastConsumed = false

export function consumePublishSuccessToast(): boolean {
  if (publishSuccessToastConsumed) {
    return false
  }

  publishSuccessToastConsumed = true
  return true
}

export function resetPublishSuccessToastConsumption(): void {
  publishSuccessToastConsumed = false
}

/** Strict Mode·effect 재실행 시 삭제 성공 Toast 중복 방지 (TODO: API 연동 시 제거) */
let deleteSuccessToastConsumed = false

export function consumeDeleteSuccessToast(): boolean {
  if (deleteSuccessToastConsumed) {
    return false
  }

  deleteSuccessToastConsumed = true
  return true
}

export function resetDeleteSuccessToastConsumption(): void {
  deleteSuccessToastConsumed = false
}
