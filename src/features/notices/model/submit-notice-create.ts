import { isAxiosError } from "axios"

import { uploadNoticeImageFiles } from "../api/notice-file-upload.api"
import {
  addNoticeVote,
  postNotice,
  replaceNoticeImages,
  replaceNoticeLinks,
} from "../api/notices-command.api"
import { buildCreateNoticeRequests } from "./build-notice-create-payload"
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
import { NOTICE_CREATE_PUBLISH_SERVER_ERROR_MESSAGE } from "./notice-outcomes"
import {
  isNoticeSchoolStaffContext,
  validateNoticeSchoolStaffCreateParts,
} from "./notice-school-staff-access"
import { validateStaffNoticeCreateForm } from "./notice-staff-target-rules"

import type { NoticeAdminAccessContext } from "./notice-admin-access-context"
import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"
import type { NoticeOperatorSession } from "./notice-session"

/** 재시도 시 건너뛸 수 있도록 완료된 단계를 기록한다. 인덱스는 buildCreateNoticeRequests 순서. */
export type SubmitNoticeCreateProgress = {
  imageIds?: string[]
  noticeIds?: (number | null)[]
  attached?: boolean[]
  voted?: boolean[]
}

export type SubmitNoticeCreateOutcome =
  | { kind: "success"; noticeId: number }
  | { kind: "forbidden"; progress?: SubmitNoticeCreateProgress }
  | { kind: "network_error"; progress?: SubmitNoticeCreateProgress }
  /** 서버가 4xx·5xx로 응답한 경우 (무응답인 network_error와 구분) */
  | {
      kind: "server_error"
      message: string
      progress?: SubmitNoticeCreateProgress
    }
  | {
      kind: "validation_error"
      message: string
      progress?: SubmitNoticeCreateProgress
    }

export function validateNoticeCreateForm(
  form: NoticeCreateFormState,
  options?: {
    schoolStaffPartsRequired?: boolean
  },
): string | null {
  if (!form.challengerEnabled && !form.staffEnabled) {
    return "공지 종류를 하나 이상 선택해 주세요"
  }
  if (form.challengerEnabled && form.staffEnabled) {
    return "챌린저 공지와 운영진 공지는 동시에 선택할 수 없어요"
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
  const staffValidationMessage = validateStaffNoticeCreateForm(form)
  if (staffValidationMessage) {
    return staffValidationMessage
  }
  if (options?.schoolStaffPartsRequired) {
    const partsValidationMessage = validateNoticeSchoolStaffCreateParts(form)
    if (partsValidationMessage) {
      return partsValidationMessage
    }
  }
  if (
    form.challengerEnabled &&
    form.orgMode === "chapter" &&
    form.chapterId == null
  ) {
    return "지부를 선택해 주세요"
  }
  if (
    form.challengerEnabled &&
    form.orgMode === "school" &&
    form.schoolId == null
  ) {
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

/** NOTICE-105 / NOTICE-104 — 등록 직후 링크·이미지 전체 교체 (비어 있으면 생략, 둘 다 있으면 병렬) */
async function attachNoticeContent(
  noticeId: number,
  input: {
    imageIds: string[]
    links: string[]
  },
): Promise<void> {
  const tasks: Promise<void>[] = []
  if (input.links.length > 0) {
    tasks.push(replaceNoticeLinks(noticeId, input.links))
  }
  if (input.imageIds.length > 0) {
    tasks.push(replaceNoticeImages(noticeId, input.imageIds))
  }
  await Promise.all(tasks)
}

export async function submitNoticeCreate(input: {
  adminSession?: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >
  form: NoticeCreateFormState
  session: NoticeOperatorSession
  /** 목록/작성 UI에서 선택한 조회 기수 (헤더 또는 폼 특정 기수) */
  operationGisuId?: number | null
  /** 대상 기수의 generation — 10기 이하 레거시 파트를 API enum으로 변환 */
  targetGeneration?: number | null
  voteDraft?: NoticeCreateVoteDraft | null
  /**
   * 이전 시도에서 완료된 단계. 전달하면 해당 단계는 건너뛰고 재시도한다.
   * 같은 객체를 제자리에서 갱신하므로, 예외로 중단돼도 호출부 ref에 진행 상황이 남는다.
   */
  progress?: SubmitNoticeCreateProgress
}): Promise<SubmitNoticeCreateOutcome> {
  const validationMessage = validateNoticeCreateForm(input.form, {
    schoolStaffPartsRequired:
      input.adminSession != null &&
      isNoticeSchoolStaffContext(input.adminSession),
  })
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

  const operationGisuId = input.operationGisuId ?? input.session.gisuId ?? null
  if (operationGisuId == null) {
    return { kind: "validation_error", message: "대상 기수를 선택해 주세요" }
  }

  const progress: SubmitNoticeCreateProgress = input.progress ?? {}

  try {
    if (progress.imageIds == null) {
      progress.imageIds =
        input.form.imageFiles.length > 0
          ? await uploadNoticeImageFiles(input.form.imageFiles)
          : []
    }
    const imageIds = progress.imageIds

    const requests = buildCreateNoticeRequests(
      input.form,
      operationGisuId,
      input.targetGeneration ?? null,
    )

    if (progress.noticeIds?.length !== requests.length) {
      progress.noticeIds = requests.map(() => null)
      progress.attached = requests.map(() => false)
      progress.voted = requests.map(() => false)
    }
    const noticeIds = progress.noticeIds
    const attached = progress.attached ?? requests.map(() => false)
    const voted = progress.voted ?? requests.map(() => false)
    progress.attached = attached
    progress.voted = voted

    for (const [index, request] of requests.entries()) {
      let noticeId = noticeIds[index]
      if (noticeId == null) {
        noticeId = await postNotice(request)
        noticeIds[index] = noticeId
      }
      if (!attached[index]) {
        await attachNoticeContent(noticeId, {
          imageIds,
          links: input.form.links,
        })
        attached[index] = true
      }
    }

    if (input.voteDraft != null) {
      const voteBody = buildAddNoticeVoteRequest(input.voteDraft)
      for (const [index, noticeId] of noticeIds.entries()) {
        if (noticeId == null || voted[index]) {
          continue
        }
        await addNoticeVote(noticeId, voteBody)
        voted[index] = true
      }
    }

    const noticeId = noticeIds.findLast((id) => id != null) ?? 0
    return { kind: "success", noticeId }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden", progress }
    }
    const apiMessage = getNoticeApiErrorMessage(error)
    if (getHttpStatus(error) === 400 && apiMessage) {
      return { kind: "validation_error", message: apiMessage, progress }
    }
    if (isNoticeNetworkError(error)) {
      return { kind: "network_error", progress }
    }
    if (isAxiosError(error)) {
      return {
        kind: "server_error",
        message: apiMessage ?? NOTICE_CREATE_PUBLISH_SERVER_ERROR_MESSAGE,
        progress,
      }
    }
    throw error
  }
}
