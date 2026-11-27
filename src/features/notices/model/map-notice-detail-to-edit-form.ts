import {
  INITIAL_NOTICE_CREATE_FORM,
  type NoticeCreateFormState,
} from "./notice-create-form"
import { resolveStaffScopeFromTargetInfo } from "./notice-staff-recipient-display"

import type {
  GetNoticeDetailResponse,
  NoticeTargetInfo,
} from "../api/notice-api.types"

function mapTargetInfoToFormFields(
  targetInfo: NoticeTargetInfo | null | undefined,
): Pick<
  NoticeCreateFormState,
  | "challengerEnabled"
  | "staffEnabled"
  | "staffScope"
  | "gisuMode"
  | "targetGisuId"
  | "orgMode"
  | "chapterId"
  | "schoolId"
  | "parts"
> {
  const tab = targetInfo?.targetNoticeTab ?? "CHALLENGER"
  const challengerEnabled = tab === "CHALLENGER"
  const staffEnabled = !challengerEnabled

  const targetGisuRaw = targetInfo?.targetGisuId
  const targetGisuId = targetGisuRaw == null ? null : Number(targetGisuRaw)
  const gisuMode =
    targetGisuId != null && Number.isFinite(targetGisuId) ? "specific" : "all"

  let orgMode: NoticeCreateFormState["orgMode"] = "umc"
  let chapterId: number | null = null
  let schoolId: number | null = null

  if (targetInfo?.targetChapterId != null) {
    orgMode = "chapter"
    chapterId = Number(targetInfo.targetChapterId)
  } else if (targetInfo?.targetSchoolId != null) {
    orgMode = "school"
    schoolId = Number(targetInfo.targetSchoolId)
  }

  return {
    challengerEnabled,
    staffEnabled,
    staffScope: resolveStaffScopeFromTargetInfo(targetInfo),
    gisuMode,
    targetGisuId:
      gisuMode === "specific" && Number.isFinite(targetGisuId)
        ? targetGisuId
        : null,
    orgMode,
    chapterId: Number.isFinite(chapterId) ? chapterId : null,
    schoolId: Number.isFinite(schoolId) ? schoolId : null,
    parts: targetInfo?.targetParts ?? [],
  }
}

export function mapNoticeDetailToEditForm(
  detail: GetNoticeDetailResponse,
): NoticeCreateFormState {
  const sortedLinks = [...detail.links].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  )
  const sortedImages = [...detail.images].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  )

  return {
    ...INITIAL_NOTICE_CREATE_FORM,
    ...mapTargetInfoToFormFields(detail.targetInfo),
    title: detail.title,
    content: detail.content,
    mustRead: detail.mustRead,
    sendNotification: detail.shouldNotify ?? false,
    links: sortedLinks.map((link) => link.url),
    linkDraft: "",
    imageFiles: [],
    existingImages: sortedImages.map((image) => ({
      fileId: image.fileId,
      src: image.url,
    })),
  }
}
