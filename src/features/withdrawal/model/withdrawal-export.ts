export const WITHDRAWAL_EXPORT_TYPE_OPTIONS = [
  { value: "voluntary", label: "자진 탈부" },
  { value: "penalty-20", label: "상벌점 -20점" },
  { value: "event-noshow", label: "행사 노쇼" },
  { value: "low-participation", label: "프로젝트 참여 저조" },
] as const

export type WithdrawalExportTypeValue =
  (typeof WITHDRAWAL_EXPORT_TYPE_OPTIONS)[number]["value"]

export const WITHDRAWAL_EXPORT_COLUMN_OPTIONS = [
  { value: "org", label: "기수 · 학교 · 파트", sensitive: false },
  {
    value: "reason",
    label: "탈부 유형 · 사유 항목 · 기타 사유",
    sensitive: false,
  },
  { value: "date", label: "탈부 날짜 · 기수 내 주차", sensitive: false },
  { value: "role", label: "등록한 사람의 역할", sensitive: false },
  { value: "memo", label: "메모 (운영진 내부용)", sensitive: false },
  {
    value: "personal",
    label: "이름 · 닉네임 (개인정보)",
    sensitive: true,
  },
] as const

export type WithdrawalExportColumnValue =
  (typeof WITHDRAWAL_EXPORT_COLUMN_OPTIONS)[number]["value"]

export type WithdrawalExportFormState = {
  startDate: Date | null
  endDate: Date | null
  schoolId: string | null
  types: Set<WithdrawalExportTypeValue>
  columns: Set<WithdrawalExportColumnValue>
  personalConsent: boolean
}

export function createInitialWithdrawalExportForm(): WithdrawalExportFormState {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return {
    startDate: today,
    endDate: null,
    schoolId: null,
    types: new Set(),
    columns: new Set(
      WITHDRAWAL_EXPORT_COLUMN_OPTIONS.map((option) => option.value),
    ),
    personalConsent: false,
  }
}

export function isPersonalColumnSelected(
  columns: Set<WithdrawalExportColumnValue>,
): boolean {
  return columns.has("personal")
}

export function hasExportPeriod(
  form: Pick<WithdrawalExportFormState, "startDate" | "endDate">,
): boolean {
  return form.startDate != null && form.endDate != null
}

const SCHOOL_EXECUTIVE_ROLES = new Set([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
])

/** 탈부 CSV 내보내기 Panel — 역할별 기간·학교 필드 권한 */
export type WithdrawalExportFieldAccess = {
  /** false면 기간이 「전체」로 고정 */
  periodSelectable: boolean
  /** false면 학교 선택 불가 */
  schoolSelectable: boolean
  /** 회장단: 본인 학교 고정 */
  lockedSchool: { schoolId: string; schoolName: string } | null
}

/**
 * 일반(교내 운영진·파트장 등): 기간·학교 선택 불가
 * 중앙단(슈퍼·중앙·지부): 기간·학교 선택 가능
 * 회장단: 기간 선택 가능, 학교 고정
 */
export function resolveWithdrawalExportFieldAccess(input: {
  scope: "SUPER_ADMIN" | "CENTRAL" | "CHAPTER" | "SCHOOL" | "SCHOOL_PART" | null
  roleTypes: readonly string[]
  schoolId: number | null
  schoolName: string | null
}): WithdrawalExportFieldAccess {
  const isSchoolExecutive =
    input.scope === "SCHOOL" &&
    input.schoolId != null &&
    input.roleTypes.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))

  if (isSchoolExecutive) {
    return {
      periodSelectable: true,
      schoolSelectable: false,
      lockedSchool: {
        schoolId: String(input.schoolId),
        schoolName: input.schoolName ?? "",
      },
    }
  }

  if (
    input.scope === "SUPER_ADMIN" ||
    input.scope === "CENTRAL" ||
    input.scope === "CHAPTER"
  ) {
    return {
      periodSelectable: true,
      schoolSelectable: true,
      lockedSchool: null,
    }
  }

  return {
    periodSelectable: false,
    schoolSelectable: false,
    lockedSchool: null,
  }
}
