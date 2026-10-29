import { isAxiosError } from "axios"

import { uploadNoticeImageFiles } from "../api/notice-file-upload.api"
import {
  patchNotice,
  replaceNoticeImages,
  replaceNoticeLinks,
} from "../api/notices-command.api"
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

export type SubmitNoticeEditOutcome =
  | { kind: "success" }
  | { kind: "forbidden" }
  | { kind: "network_error" }
  | { kind: "not_found" }
  | { kind: "validation_error"; message: string }

export function validateNoticeEditForm(
  form: NoticeCreateFormState,
): string | null {
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
  const linkDraftValidation = getNoticeCreateLinkDraftValidation(form.linkDraft)
  if (form.linkDraft.trim() && !linkDraftValidation.canAdd) {
    return NOTICE_CREATE_LINK_INVALID_MESSAGE
  }
  if (form.links.some((link) => !isNoticeCreateLinkUrl(link))) {
    return NOTICE_CREATE_LINK_INVALID_MESSAGE
  }
  return null
}

export function isNoticeEditFormDirty(
  form: NoticeCreateFormState,
  baseline: NoticeCreateFormState,
): boolean {
  return JSON.stringify(form) !== JSON.stringify(baseline)
}

export async function submitNoticeEdit(input: {
  form: NoticeCreateFormState
  noticeId: number
}): Promise<SubmitNoticeEditOutcome> {
  const validationMessage = validateNoticeEditForm(input.form)
  if (validationMessage) {
    return { kind: "validation_error", message: validationMessage }
  }

  try {
    await patchNotice(input.noticeId, {
      title: input.form.title.trim(),
      content: input.form.content.trim(),
      mustRead: input.form.mustRead,
    })

    await replaceNoticeLinks(input.noticeId, input.form.links)

    const newImageIds =
      input.form.imageFiles.length > 0
        ? await uploadNoticeImageFiles(input.form.imageFiles)
        : []
    const imageIds = [
      ...input.form.existingImages.map((image) => image.fileId),
      ...newImageIds,
    ]
    await replaceNoticeImages(input.noticeId, imageIds)

    return { kind: "success" }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden" }
    }
    if (getHttpStatus(error) === 404) {
      return { kind: "not_found" }
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
