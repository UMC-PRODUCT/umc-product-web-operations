export const NOTICE_PUBLISH_TOAST_MESSAGE = "공지를 등록했어요"
export const NOTICE_EDIT_SUCCESS_TOAST_MESSAGE = "공지를 수정했어요"
/** Figma 1221:17756 — 공지 수정 실패 Toast Bottom */
export const NOTICE_EDIT_FAILURE_TOAST_MESSAGE =
  "공지를 수정하지 못했어요. 잠시 후 다시 시도해 주세요"

/** Figma 888:31367 — 공지 수정 권한 없음 */
export const NOTICE_EDIT_FORBIDDEN_TITLE = "공지를 수정할 수 없어요"
export const NOTICE_EDIT_FORBIDDEN_DESCRIPTION =
  "공지는 작성자만 수정할 수 있어요"

/** Figma 1221:18826 — 수정 중 공지 삭제 Dialog */
export const NOTICE_EDIT_DELETED_DIALOG_TITLE = "공지를 찾을 수 없어요"
export const NOTICE_EDIT_DELETED_DIALOG_DESCRIPTION =
  "수정하는 동안 공지가 삭제 되었어요"
export const NOTICE_EDIT_DELETED_DIALOG_CONFIRM_LABEL = "목록으로"
export const NOTICE_DELETE_TOAST_MESSAGE = "공지를 삭제했어요"
/** Figma 516:12555 — 삭제 실패 Toast */
export const NOTICE_DELETE_FAILURE_TOAST_MESSAGE =
  "공지를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요"
export const NOTICE_IMAGE_REGISTER_TOAST_MESSAGE = "이미지를 등록했어요"

/** Figma 598:9538 — 공지 작성 forbidden Toast Bottom */
export const NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE =
  "공지를 쓸 수 없는 대상이에요. 작성했던 내용은 그대로 남아있어요"

/** Figma 2704:48597 — 게시 실패 Toast Bottom (목록 화면, 다시시도) */
export const NOTICE_CREATE_PUBLISH_FAILURE_TOAST_MESSAGE =
  "공지를 게시하지 못했어요. 다시 시도해 주세요"
export const NOTICE_CREATE_PUBLISH_FAILURE_RETRY_LABEL = "다시시도"
/** Figma 2704:48597 프레임 너비 — `toast.show({ width })` */
export const NOTICE_CREATE_PUBLISH_FAILURE_TOAST_WIDTH = 427

/** @deprecated 목록 Toast 문구는 NOTICE_CREATE_PUBLISH_FAILURE_TOAST_MESSAGE 사용 */
export const NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE =
  NOTICE_CREATE_PUBLISH_FAILURE_TOAST_MESSAGE

/** 서버가 HTTP 오류(4xx·5xx)로 응답했을 때 기본 안내 — 무응답(네트워크)과 구분 */
export const NOTICE_CREATE_PUBLISH_SERVER_ERROR_MESSAGE =
  "서버에서 공지를 처리하지 못했어요. 잠시 후 다시 시도해 주세요"
export const NOTICE_EDIT_SERVER_ERROR_MESSAGE =
  "서버에서 공지 수정을 처리하지 못했어요. 잠시 후 다시 시도해 주세요"

/** Figma 598:9622 — 이미지 업로드 실패 Toast Bottom */
export const NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE =
  "이미지를 올리지 못했어요. 파일 형식이나 용량을 확인해 주세요"
