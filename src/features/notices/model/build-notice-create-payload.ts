import type { CreateNoticeRequest } from "../api/notice-api.types"
import type { NoticeCreateFormState } from "./notice-create-form"

function resolveTargetGisuId(form: NoticeCreateFormState): number | null {
  if (form.gisuMode === "all") {
    return null
  }
  return form.targetGisuId
}

function resolveTargetOrganization(form: NoticeCreateFormState): {
  targetChapterId: number | null
  targetSchoolId: number | null
} {
  switch (form.orgMode) {
    case "chapter":
      return { targetChapterId: form.chapterId, targetSchoolId: null }
    case "school":
      return { targetChapterId: null, targetSchoolId: form.schoolId }
    default:
      return { targetChapterId: null, targetSchoolId: null }
  }
}

function buildSharedPayload(
  form: NoticeCreateFormState,
): Omit<CreateNoticeRequest, "targetNoticeTab"> {
  const { targetChapterId, targetSchoolId } = resolveTargetOrganization(form)

  return {
    title: form.title.trim(),
    content: form.content.trim(),
    mustRead: form.mustRead,
    shouldSendNotification: form.sendNotification,
    targetGisuId: resolveTargetGisuId(form),
    targetChapterId,
    targetSchoolId,
    targetParts: form.parts.length > 0 ? form.parts : undefined,
    links: form.links.map((url, displayOrder) => ({ url, displayOrder })),
  }
}

export function buildCreateNoticeRequests(
  form: NoticeCreateFormState,
): CreateNoticeRequest[] {
  const shared = buildSharedPayload(form)
  const requests: CreateNoticeRequest[] = []

  if (form.challengerEnabled) {
    requests.push({ ...shared, targetNoticeTab: "CHALLENGER" })
  }
  if (form.staffEnabled) {
    requests.push({ ...shared, targetNoticeTab: form.staffScope })
  }

  return requests
}
