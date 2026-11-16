import { isAxiosError } from "axios"

import { uploadNoticeImageFiles } from "../api/notice-file-upload.api"
import {
  addNoticeVote,
  patchNotice,
  replaceNoticeImages,
  replaceNoticeLinks,
} from "../api/notices-command.api"
import {
  buildAddNoticeVoteRequest,
  validateNoticeCreateVoteForSubmit,
} from "./build-notice-create-vote-request"
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

import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"

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

function isSameStringList(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export async function submitNoticeEdit(input: {
  form: NoticeCreateFormState
  noticeId: number
  voteDraft?: NoticeCreateVoteDraft | null
  /** 수정 진입 시점 링크. 전달하면 변경이 없을 때 NOTICE-105를 생략한다 (빈 배열로 비우는 변경은 호출) */
  baselineLinks?: readonly string[]
  /** 수정 진입 시점 이미지 fileId. 전달하고 새 파일도 없으면 변경이 없을 때 NOTICE-104를 생략한다 */
  baselineImageIds?: readonly string[]
}): Promise<SubmitNoticeEditOutcome> {
  const validationMessage = validateNoticeEditForm(input.form)
  if (validationMessage) {
    return { kind: "validation_error", message: validationMessage }
  }

  if (input.voteDraft != null) {
    const voteValidationMessage = validateNoticeCreateVoteForSubmit(
      input.voteDraft,
    )
    if (voteValidationMessage != null) {
      return { kind: "validation_error", message: voteValidationMessage }
    }
  }

  try {
    await patchNotice(input.noticeId, {
      title: input.form.title.trim(),
      content: input.form.content.trim(),
      mustRead: input.form.mustRead,
    })

    const linksUnchanged =
      input.baselineLinks != null &&
      isSameStringList(input.form.links, input.baselineLinks)
    const hasNewImageFiles = input.form.imageFiles.length > 0
    const existingImageIds = input.form.existingImages.map(
      (image) => image.fileId,
    )
    const imagesUnchanged =
      !hasNewImageFiles &&
      input.baselineImageIds != null &&
      isSameStringList(existingImageIds, input.baselineImageIds)

    const replaceImages = async () => {
      const newImageIds = hasNewImageFiles
        ? await uploadNoticeImageFiles(input.form.imageFiles)
        : []
      await replaceNoticeImages(input.noticeId, [
        ...existingImageIds,
        ...newImageIds,
      ])
    }

    await Promise.all([
      linksUnchanged
        ? Promise.resolve()
        : replaceNoticeLinks(input.noticeId, input.form.links),
      imagesUnchanged ? Promise.resolve() : replaceImages(),
    ])

    if (input.voteDraft != null) {
      await addNoticeVote(
        input.noticeId,
        buildAddNoticeVoteRequest(input.voteDraft),
      )
    }

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
