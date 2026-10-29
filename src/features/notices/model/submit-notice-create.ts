import { postNotice } from "../api/notices-command.api"
import { buildCreateNoticeRequests } from "./build-notice-create-payload"
import {
  isNoticeForbiddenError,
  isNoticeNetworkError,
} from "./notice-api-error"
import {
  NOTICE_CREATE_CONTENT_MAX_LENGTH,
  NOTICE_CREATE_TITLE_MAX_LENGTH,
  type NoticeCreateFormState,
} from "./notice-create-form"
import {
  getNoticeCreateLinkDraftValidation,
  isNoticeCreateLinkUrl,
  NOTICE_CREATE_LINK_INVALID_MESSAGE,
} from "./notice-create-link"

import type { NoticeOperatorSession } from "./notice-session"

export type SubmitNoticeCreateOutcome =
  | { kind: "success"; noticeId: number }
  | { kind: "forbidden" }
  | { kind: "network_error" }
  | { kind: "validation_error"; message: string }

export function validateNoticeCreateForm(
  form: NoticeCreateFormState,
): string | null {
  if (!form.challengerEnabled && !form.staffEnabled) {
    return "공지 종류를 하나 이상 선택해 주세요"
  }
  if (!form.title.trim()) {
    return "제목을 입력해 주세요"
  }
  if (form.title.length > NOTICE_CREATE_TITLE_MAX_LENGTH) {
    return `제목은 ${NOTICE_CREATE_TITLE_MAX_LENGTH}자 이내로 입력해 주세요`
  }
  if (!form.content.trim()) {
    return "본문을 입력해 주세요"
  }
  if (form.content.length > NOTICE_CREATE_CONTENT_MAX_LENGTH) {
    return `본문은 ${NOTICE_CREATE_CONTENT_MAX_LENGTH}자 이내로 입력해 주세요`
  }
  if (form.gisuMode === "specific" && form.targetGisuId == null) {
    return "대상 기수를 선택해 주세요"
  }
  if (form.orgMode === "chapter" && form.chapterId == null) {
    return "지부를 선택해 주세요"
  }
  if (form.orgMode === "school" && form.schoolId == null) {
    return "학교를 선택해 주세요"
  }
  if (form.parts.length === 0) {
    return "파트를 하나 이상 선택해 주세요"
  }
  const linkDraftValidation = getNoticeCreateLinkDraftValidation(form.linkDraft)
  if (form.linkDraft.trim() && !linkDraftValidation.canAdd) {
    return NOTICE_CREATE_LINK_INVALID_MESSAGE
  }
  if (form.links.some((link) => !isNoticeCreateLinkUrl(link))) {
    return NOTICE_CREATE_LINK_INVALID_MESSAGE
  }
  return null
}

export async function submitNoticeCreate(input: {
  form: NoticeCreateFormState
  session: NoticeOperatorSession
}): Promise<SubmitNoticeCreateOutcome> {
  const validationMessage = validateNoticeCreateForm(input.form)
  if (validationMessage) {
    return { kind: "validation_error", message: validationMessage }
  }

  if (input.session.gisuId == null) {
    return { kind: "network_error" }
  }

  try {
    const requests = buildCreateNoticeRequests(input.form)
    let noticeId = 0
    for (const request of requests) {
      noticeId = await postNotice({
        ...request,
        gisuId: input.session.gisuId,
      })
    }
    return { kind: "success", noticeId }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden" }
    }
    if (isNoticeNetworkError(error)) {
      return { kind: "network_error" }
    }
    throw error
  }
}
