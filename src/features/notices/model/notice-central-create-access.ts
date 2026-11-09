import {
  type NoticeCreateFormState,
  type NoticeCreateStaffScope,
} from "./notice-create-form"
import { isStaffCentralNoticeTab } from "./notice-staff-target-rules"

import type { NoticeAdminAccessContext } from "./notice-admin-access-context"

const CENTRAL_NOTICE_CREATE_ROLES = new Set([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

/** 슈퍼어드민·중앙 운영진 — 작성 시 체크 해제하면 대상을 해당 모드의 초기값으로 */
export function isNoticeCentralUnrestrictedCreateContext(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (session.isSuperAdmin) {
    return true
  }

  if (session.scope !== "CENTRAL") {
    return false
  }

  return session.roleTypes.some((role) => CENTRAL_NOTICE_CREATE_ROLES.has(role))
}

/** 챌린저·운영진 모두 off — 작성 폼 기본 대상 */
export function centralCreateTargetBaselineNeither(): Partial<NoticeCreateFormState> {
  return {
    challengerEnabled: false,
    staffEnabled: false,
    gisuMode: "all",
    targetGisuId: null,
    orgMode: "umc",
    chapterId: null,
    schoolId: null,
    parts: [],
  }
}

/** 챌린저만 on — 챌린저 체크 시와 동일(대상은 기본값, 종류만 on) */
export function centralCreateTargetBaselineChallengerOnly(): Partial<NoticeCreateFormState> {
  return {
    ...centralCreateTargetBaselineNeither(),
    challengerEnabled: true,
  }
}

/** 운영진만 on — 운영진 체크 시 central 분기와 동일한 대상 */
export function centralCreateTargetBaselineStaffOnly(
  staffScope: NoticeCreateStaffScope,
): Partial<NoticeCreateFormState> {
  const base: Partial<NoticeCreateFormState> = {
    challengerEnabled: false,
    staffEnabled: true,
    chapterId: null,
    gisuMode: "specific",
    parts: [],
  }

  if (isStaffCentralNoticeTab(staffScope)) {
    return {
      ...base,
      orgMode: "umc",
      schoolId: null,
    }
  }

  return {
    ...base,
    orgMode: "umc",
    schoolId: null,
  }
}

export function applyCentralChallengerDisabledTargetReset(
  form: NoticeCreateFormState,
): Partial<NoticeCreateFormState> {
  if (form.staffEnabled) {
    return centralCreateTargetBaselineStaffOnly(form.staffScope)
  }

  return centralCreateTargetBaselineNeither()
}

export function applyCentralStaffDisabledTargetReset(
  form: NoticeCreateFormState,
): Partial<NoticeCreateFormState> {
  if (form.challengerEnabled) {
    return centralCreateTargetBaselineChallengerOnly()
  }

  return centralCreateTargetBaselineNeither()
}
