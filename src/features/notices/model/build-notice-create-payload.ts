import { normalizeNoticeCreateTargetParts } from "./notice-create-target-parts"

import type {
  CreateNoticeRequest,
  NoticePart,
  NoticeTab,
  NoticeTargetInfo,
} from "../api/notice-api.types"
import type { NoticeCreateFormState } from "./notice-create-form"

function resolveStaffTargetGisuId(
  form: NoticeCreateFormState,
  sessionGisuId: number | null,
): number | null {
  if (form.gisuMode === "specific") {
    return form.targetGisuId ?? sessionGisuId
  }
  return sessionGisuId
}

function resolveChallengerTargetGisuId(
  form: NoticeCreateFormState,
): number | null {
  if (form.gisuMode === "all") {
    return null
  }
  return form.targetGisuId
}

/** NOTICE-201: 빈 배열이면 전체 파트, 운영진 탭별 규칙은 스펙 표 참고 */
function resolveTargetParts(
  form: NoticeCreateFormState,
  targetNoticeTab: NoticeTab,
  targetGeneration: number | null,
): NoticePart[] | undefined {
  const isStaffNotice = targetNoticeTab !== "CHALLENGER"
  const normalized = normalizeNoticeCreateTargetParts(
    form.parts,
    targetGeneration,
  )

  if (isStaffNotice) {
    if (
      targetNoticeTab === "CENTRAL_MEMBER" ||
      targetNoticeTab === "SCHOOL_CORE"
    ) {
      return undefined
    }
    return normalized.length > 0 ? normalized : []
  }

  return normalized.length > 0 ? normalized : []
}

function buildTargetInfo(
  form: NoticeCreateFormState,
  targetNoticeTab: NoticeTab,
  sessionGisuId: number | null,
  targetGeneration: number | null,
): NoticeTargetInfo {
  const isStaffNotice = targetNoticeTab !== "CHALLENGER"

  const targetGisuId = isStaffNotice
    ? resolveStaffTargetGisuId(form, sessionGisuId)
    : resolveChallengerTargetGisuId(form)

  let targetChapterId: number | null | undefined
  let targetSchoolId: number | null | undefined

  if (isStaffNotice) {
    targetChapterId = undefined
    targetSchoolId = form.orgMode === "school" ? form.schoolId : null
  } else {
    if (targetGisuId == null) {
      targetChapterId = null
      targetSchoolId = null
    } else {
      targetChapterId = form.orgMode === "chapter" ? form.chapterId : null
      targetSchoolId = form.orgMode === "school" ? form.schoolId : null
    }
  }

  const targetParts = resolveTargetParts(
    form,
    targetNoticeTab,
    targetGeneration,
  )

  return {
    targetNoticeTab,
    targetGisuId,
    targetChapterId,
    targetSchoolId,
    targetParts,
  }
}

function buildCreateNoticeRequest(
  form: NoticeCreateFormState,
  targetNoticeTab: NoticeTab,
  sessionGisuId: number | null,
  targetGeneration: number | null,
): CreateNoticeRequest {
  const request: CreateNoticeRequest = {
    title: form.title.trim(),
    content: form.content.trim(),
    shouldNotify: form.sendNotification,
    targetInfo: buildTargetInfo(
      form,
      targetNoticeTab,
      sessionGisuId,
      targetGeneration,
    ),
  }

  if (form.mustRead) {
    request.mustRead = true
  }

  return request
}

export function buildCreateNoticeRequests(
  form: NoticeCreateFormState,
  sessionGisuId: number | null,
  targetGeneration: number | null,
): CreateNoticeRequest[] {
  const requests: CreateNoticeRequest[] = []

  if (form.challengerEnabled) {
    requests.push(
      buildCreateNoticeRequest(
        form,
        "CHALLENGER",
        sessionGisuId,
        targetGeneration,
      ),
    )
  }
  if (form.staffEnabled) {
    requests.push(
      buildCreateNoticeRequest(
        form,
        form.staffScope,
        sessionGisuId,
        targetGeneration,
      ),
    )
  }

  return requests
}
