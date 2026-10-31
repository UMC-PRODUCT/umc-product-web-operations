import { normalizeNoticeCreateTargetParts } from "./notice-create-target-parts"

import type {
  CreateNoticeRequest,
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

function resolveChallengerTargetOrganizationIds(
  form: NoticeCreateFormState,
  targetGisuId: number | null,
): Pick<NoticeTargetInfo, "targetChapterId" | "targetSchoolId"> {
  if (targetGisuId == null) {
    return { targetChapterId: null, targetSchoolId: null }
  }

  return {
    targetChapterId: form.orgMode === "chapter" ? form.chapterId : null,
    targetSchoolId: form.orgMode === "school" ? form.schoolId : null,
  }
}

/** NOTICE-201: 운영진 공지는 targetChapterId 지정 불가 */
function buildStaffTargetInfo(
  form: NoticeCreateFormState,
  targetNoticeTab: NoticeTab,
  sessionGisuId: number | null,
  targetGeneration: number | null,
): NoticeTargetInfo {
  const targetGisuId = resolveStaffTargetGisuId(form, sessionGisuId)

  const targetSchoolId =
    targetNoticeTab === "SCHOOL_PART_LEADER" && form.orgMode === "school"
      ? form.schoolId
      : null

  const targetInfo: NoticeTargetInfo = {
    targetNoticeTab,
    targetGisuId,
    targetSchoolId,
  }

  if (targetNoticeTab === "SCHOOL_PART_LEADER") {
    const normalized = normalizeNoticeCreateTargetParts(
      form.parts,
      targetGeneration,
    )
    targetInfo.targetParts = normalized.length > 0 ? normalized : []
  }

  return targetInfo
}

function buildChallengerTargetInfo(
  form: NoticeCreateFormState,
  targetGeneration: number | null,
): NoticeTargetInfo {
  const targetGisuId = resolveChallengerTargetGisuId(form)
  const { targetChapterId, targetSchoolId } =
    resolveChallengerTargetOrganizationIds(form, targetGisuId)

  const normalized = normalizeNoticeCreateTargetParts(
    form.parts,
    targetGeneration,
  )

  return {
    targetNoticeTab: "CHALLENGER",
    targetGisuId,
    targetChapterId,
    targetSchoolId,
    targetParts: normalized.length > 0 ? normalized : [],
  }
}

function buildTargetInfo(
  form: NoticeCreateFormState,
  targetNoticeTab: NoticeTab,
  sessionGisuId: number | null,
  targetGeneration: number | null,
): NoticeTargetInfo {
  if (targetNoticeTab === "CHALLENGER") {
    return buildChallengerTargetInfo(form, targetGeneration)
  }

  return buildStaffTargetInfo(
    form,
    targetNoticeTab,
    sessionGisuId,
    targetGeneration,
  )
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
