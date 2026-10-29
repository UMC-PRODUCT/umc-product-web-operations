import { isAxiosError } from "axios"

import { uploadNoticeImageFiles } from "../api/notice-file-upload.api"
import {
  postNotice,
  replaceNoticeImages,
  replaceNoticeLinks,
} from "../api/notices-command.api"
import { buildCreateNoticeRequests } from "./build-notice-create-payload"
import {
  getHttpStatus,
  getNoticeApiErrorMessage,
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
  if (
    form.challengerEnabled &&
    form.gisuMode === "all" &&
    form.orgMode !== "umc"
  ) {
    return "전체 기수로 챌린저 공지를 보낼 때는 UMC 전체 대상만 가능해요. 지부·학교 대상은 특정 기수를 선택해 주세요"
  }
  if (form.orgMode === "chapter" && form.chapterId == null) {
    return "지부를 선택해 주세요"
  }
  if (form.orgMode === "school" && form.schoolId == null) {
    return "학교를 선택해 주세요"
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

/** NOTICE-105 / NOTICE-104 — 등록 직후 링크·이미지 전체 교체 */
async function attachNoticeContent(
  noticeId: number,
  input: {
    imageIds: string[]
    links: string[]
  },
): Promise<void> {
  await replaceNoticeLinks(noticeId, input.links)
  await replaceNoticeImages(noticeId, input.imageIds)
}

export async function submitNoticeCreate(input: {
  form: NoticeCreateFormState
  session: NoticeOperatorSession
  /** 목록/작성 UI에서 선택한 조회 기수 (헤더 또는 폼 특정 기수) */
  operationGisuId?: number | null
  /** 대상 기수의 generation — 10기 이하 레거시 파트를 API enum으로 변환 */
  targetGeneration?: number | null
}): Promise<SubmitNoticeCreateOutcome> {
  const validationMessage = validateNoticeCreateForm(input.form)
  if (validationMessage) {
    return { kind: "validation_error", message: validationMessage }
  }

  const operationGisuId = input.operationGisuId ?? input.session.gisuId ?? null
  if (operationGisuId == null) {
    return { kind: "network_error" }
  }

  try {
    const imageIds =
      input.form.imageFiles.length > 0
        ? await uploadNoticeImageFiles(input.form.imageFiles)
        : []

    const requests = buildCreateNoticeRequests(
      input.form,
      operationGisuId,
      input.targetGeneration ?? null,
    )

    let noticeId = 0
    for (const request of requests) {
      noticeId = await postNotice(request)
      await attachNoticeContent(noticeId, {
        imageIds,
        links: input.form.links,
      })
    }

    return { kind: "success", noticeId }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden" }
    }
    const apiMessage = getNoticeApiErrorMessage(error)
    if (getHttpStatus(error) === 400 && apiMessage) {
      return { kind: "validation_error", message: apiMessage }
    }
    if (isNoticeNetworkError(error) || isAxiosError(error)) {
      return { kind: "network_error" }
    }
    throw error
  }
}
