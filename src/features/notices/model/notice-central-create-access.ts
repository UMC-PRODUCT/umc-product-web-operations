import {
  isNoticeSuperAdminContext,
  type NoticeAdminAccessContext,
} from "./notice-admin-access-context"
import {
  type NoticeCreateFormState,
  type NoticeCreateStaffScope,
} from "./notice-create-form"
import { isStaffCentralNoticeTab } from "./notice-staff-target-rules"

const CENTRAL_NOTICE_CREATE_ROLES = new Set([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

const CENTRAL_HQ_LEAD_ROLES = new Set([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
])

const CENTRAL_HQ_ADMIN_ROLES = new Set([
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

/** 중앙운영사무국 총괄·부총괄(HQ_LEAD) — 학교 운영진 칩 비활성 */
export function isNoticeCentralLeadStaffChipRestricted(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (isNoticeSuperAdminContext(session)) {
    return false
  }

  if (session.scope !== "CENTRAL") {
    return false
  }

  return session.roleTypes.some((role) => CENTRAL_HQ_LEAD_ROLES.has(role))
}

/** 운영국·교육국(HQ_ADMIN) — 중앙 운영진·학교 운영진 칩 비활성 */
export function isNoticeCentralAdminStaffChipRestricted(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (isNoticeSuperAdminContext(session)) {
    return false
  }

  if (session.scope !== "CENTRAL") {
    return false
  }

  if (isNoticeCentralLeadStaffChipRestricted(session)) {
    return false
  }

  return session.roleTypes.some((role) => CENTRAL_HQ_ADMIN_ROLES.has(role))
}

const HQ_LEAD_ACTIVE_GISU_STAFF_SCOPES = new Set<NoticeCreateStaffScope>([
  "ALL_STAFF",
  "CENTRAL_MEMBER",
  "SCHOOL_CORE",
])

const HQ_ADMIN_ACTIVE_GISU_STAFF_SCOPES = new Set<NoticeCreateStaffScope>([
  "ALL_STAFF",
  "SCHOOL_CORE",
])

function isCentralHqStaffScopeTargetPolicy(
  staffScope: NoticeCreateStaffScope,
  centralLeadStaffChipRestricted: boolean,
  centralAdminStaffChipRestricted: boolean,
): boolean {
  if (
    centralLeadStaffChipRestricted &&
    HQ_LEAD_ACTIVE_GISU_STAFF_SCOPES.has(staffScope)
  ) {
    return true
  }

  return (
    centralAdminStaffChipRestricted &&
    HQ_ADMIN_ACTIVE_GISU_STAFF_SCOPES.has(staffScope)
  )
}

/** HQ_LEAD·HQ_ADMIN + 운영진: 활성 기수 고정 */
export function isNoticeCentralHqStaffGisuLocked(
  centralLeadStaffChipRestricted: boolean,
  centralAdminStaffChipRestricted: boolean,
  form: Pick<NoticeCreateFormState, "staffEnabled" | "staffScope">,
): boolean {
  return (
    form.staffEnabled &&
    isCentralHqStaffScopeTargetPolicy(
      form.staffScope,
      centralLeadStaffChipRestricted,
      centralAdminStaffChipRestricted,
    )
  )
}

/** @deprecated use isNoticeCentralHqStaffGisuLocked */
export function isNoticeCentralLeadStaffGisuLocked(
  centralLeadStaffChipRestricted: boolean,
  form: Pick<NoticeCreateFormState, "staffEnabled" | "staffScope">,
): boolean {
  return isNoticeCentralHqStaffGisuLocked(
    centralLeadStaffChipRestricted,
    false,
    form,
  )
}

/** HQ_LEAD·HQ_ADMIN + 챌린저 공지: 활성 기수 고정 */
export function isNoticeCentralHqChallengerGisuLocked(
  centralLeadStaffChipRestricted: boolean,
  centralAdminStaffChipRestricted: boolean,
  form: Pick<NoticeCreateFormState, "challengerEnabled" | "staffEnabled">,
): boolean {
  return (
    (centralLeadStaffChipRestricted || centralAdminStaffChipRestricted) &&
    form.challengerEnabled &&
    !form.staffEnabled
  )
}

export function applyNoticeCentralHqChallengerGisuTarget(
  form: NoticeCreateFormState,
  sessionGisuId: number,
  options: {
    centralAdminStaffChipRestricted: boolean
    centralLeadStaffChipRestricted: boolean
  },
): Partial<NoticeCreateFormState> {
  if (
    !isNoticeCentralHqChallengerGisuLocked(
      options.centralLeadStaffChipRestricted,
      options.centralAdminStaffChipRestricted,
      form,
    )
  ) {
    return {}
  }

  const patch: Partial<NoticeCreateFormState> = {}

  if (form.gisuMode !== "specific" || form.targetGisuId !== sessionGisuId) {
    patch.gisuMode = "specific"
    patch.targetGisuId = sessionGisuId
  }

  return patch
}

/** HQ_LEAD + 중앙 운영진 칩: 조직 행 숨김 */
export function isNoticeCentralLeadStaffOrgRowHidden(
  centralLeadStaffChipRestricted: boolean,
  form: Pick<
    NoticeCreateFormState,
    "challengerEnabled" | "staffEnabled" | "staffScope"
  >,
): boolean {
  return (
    centralLeadStaffChipRestricted &&
    form.staffEnabled &&
    !form.challengerEnabled &&
    form.staffScope === "CENTRAL_MEMBER"
  )
}

/** HQ_LEAD·HQ_ADMIN 운영진 칩별 대상 보정 (활성 기수 · 중앙운영진 시 조직 초기화) */
export function applyNoticeCentralHqStaffScopeTarget(
  form: NoticeCreateFormState,
  sessionGisuId: number,
  options: {
    centralAdminStaffChipRestricted: boolean
    centralLeadStaffChipRestricted: boolean
  },
): Partial<NoticeCreateFormState> {
  if (
    !form.staffEnabled ||
    !isCentralHqStaffScopeTargetPolicy(
      form.staffScope,
      options.centralLeadStaffChipRestricted,
      options.centralAdminStaffChipRestricted,
    )
  ) {
    return {}
  }

  const patch: Partial<NoticeCreateFormState> = {}

  if (form.gisuMode !== "specific" || form.targetGisuId !== sessionGisuId) {
    patch.gisuMode = "specific"
    patch.targetGisuId = sessionGisuId
  }

  if (form.staffScope === "CENTRAL_MEMBER" && !form.challengerEnabled) {
    if (
      form.orgMode !== "umc" ||
      form.chapterId != null ||
      form.schoolId != null
    ) {
      patch.orgMode = "umc"
      patch.chapterId = null
      patch.schoolId = null
    }
    if (form.parts.length > 0) {
      patch.parts = []
    }
  }

  return patch
}

export function applyNoticeCentralLeadStaffScopeTarget(
  form: NoticeCreateFormState,
  sessionGisuId: number,
): Partial<NoticeCreateFormState> {
  return applyNoticeCentralHqStaffScopeTarget(form, sessionGisuId, {
    centralAdminStaffChipRestricted: false,
    centralLeadStaffChipRestricted: true,
  })
}

/** 슈퍼어드민·중앙 운영진 — 작성 시 체크 해제하면 대상을 해당 모드의 초기값으로 */
export function isNoticeCentralUnrestrictedCreateContext(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (isNoticeSuperAdminContext(session)) {
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

/** 챌린저·운영진은 동시 선택 불가 — 챌린저 체크 시 */
export function enableNoticeCreateChallengerAudience(
  form: NoticeCreateFormState,
  centralUnrestrictedCreate: boolean,
): Partial<NoticeCreateFormState> {
  if (form.staffEnabled && centralUnrestrictedCreate) {
    return {
      ...centralCreateTargetBaselineChallengerOnly(),
      challengerEnabled: true,
      staffEnabled: false,
    }
  }

  return { challengerEnabled: true, staffEnabled: false }
}

/** 챌린저·운영진은 동시 선택 불가 — 운영진 체크 시 */
export function enableNoticeCreateStaffAudience(
  form: NoticeCreateFormState,
  centralUnrestrictedCreate: boolean,
): Partial<NoticeCreateFormState> {
  if (form.challengerEnabled && centralUnrestrictedCreate) {
    return {
      ...centralCreateTargetBaselineStaffOnly(form.staffScope),
      staffEnabled: true,
      challengerEnabled: false,
    }
  }

  return { staffEnabled: true, challengerEnabled: false }
}
