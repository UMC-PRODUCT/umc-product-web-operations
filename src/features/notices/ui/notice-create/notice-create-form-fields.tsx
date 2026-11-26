import { NoticeCreateAudienceSection } from "./notice-create-audience-section"
import { NoticeCreateContentSection } from "./notice-create-content-section"
import { resolveNoticeCreateFormLocks } from "./notice-create-form-locks"
import { NoticeCreateSettingsSection } from "./notice-create-settings-section"
import {
  type NoticeCreateOrganizationOptions,
  NoticeCreateTargetSection,
} from "./notice-create-target-section"

import type { NoticeCreateFormState } from "../../model/notice-create-form"
import type { NoticeCreatePartOption } from "../../model/notice-create-part-options"
import type { NoticeCreateVoteDraft } from "../../model/notice-create-vote-draft"
import type { NoticePoll } from "../../model/notice-detail.types"
import type {
  NoticeChapterPresidentCreateLock,
  NoticeFormMode,
  NoticeSchoolExecutiveCreateLock,
  NoticeSchoolStaffCreateLock,
} from "./notice-create-form-locks"

type NoticeCreateFormFieldsProps = {
  /** 슈퍼·중앙: 챌린저 해제 시 대상 필터 초기화 */
  centralUnrestrictedCreate?: boolean
  noticeCreateSuperAdmin?: boolean
  /** HQ_ADMIN: 중앙 운영진·학교 운영진 칩 비활성 */
  centralAdminStaffChipRestricted?: boolean
  /** HQ_LEAD: 학교 운영진 칩 비활성 */
  centralLeadStaffChipRestricted?: boolean
  /** 지부장: 챌린저 대상 공지만 작성 (체크 고정) */
  chapterPresidentChallengerOnly?: boolean
  chapterPresidentCreateLock?: NoticeChapterPresidentCreateLock | null
  schoolExecutiveCreateLock?: NoticeSchoolExecutiveCreateLock | null
  /** 교내 파트장·기타 운영진: 챌린저 공지만 작성 */
  schoolStaffChallengerOnly?: boolean
  schoolStaffCreateLock?: NoticeSchoolStaffCreateLock | null
  /** 교내 파트장·기타 운영진: 챌린저 공지 시 파트 필수 */
  schoolStaffPartsRequired?: boolean
  form: NoticeCreateFormState
  isOrganizationLoading: boolean
  mode?: NoticeFormMode
  onChange: (patch: Partial<NoticeCreateFormState>) => void
  onImageUploadReject?: () => void
  organization: NoticeCreateOrganizationOptions
  partOptions: NoticeCreatePartOption[]
  onVoteAddClick?: () => void
  onVoteDeleteClick?: () => void
  onVoteEditClick?: () => void
  attachedVotePoll?: NoticePoll | null
  attachedVoteNoticeId?: string
  recipientSummaryLine: string
  sessionGisuId?: number | null
  sessionGisuLabel?: string | null
  showRequiredFieldErrors: boolean
  voteDraft?: NoticeCreateVoteDraft | null
}

export function NoticeCreateFormFields({
  centralAdminStaffChipRestricted = false,
  centralLeadStaffChipRestricted = false,
  centralUnrestrictedCreate = false,
  noticeCreateSuperAdmin = false,
  chapterPresidentChallengerOnly = false,
  chapterPresidentCreateLock = null,
  schoolExecutiveCreateLock = null,
  schoolStaffChallengerOnly = false,
  schoolStaffCreateLock = null,
  schoolStaffPartsRequired = false,
  form,
  isOrganizationLoading,
  mode = "create",
  onChange,
  onImageUploadReject,
  organization,
  partOptions,
  onVoteAddClick,
  onVoteDeleteClick,
  onVoteEditClick,
  attachedVotePoll = null,
  attachedVoteNoticeId,
  recipientSummaryLine,
  sessionGisuId = null,
  sessionGisuLabel = null,
  showRequiredFieldErrors,
  voteDraft = null,
}: NoticeCreateFormFieldsProps) {
  const locks = resolveNoticeCreateFormLocks({
    centralAdminStaffChipRestricted,
    centralLeadStaffChipRestricted,
    centralUnrestrictedCreate,
    chapterPresidentChallengerOnly,
    chapterPresidentCreateLock,
    form,
    mode,
    schoolExecutiveCreateLock,
    schoolStaffChallengerOnly,
    schoolStaffCreateLock,
    noticeCreateSuperAdmin,
  })

  return (
    <div className="flex flex-col gap-(--umc-spacing-gap-24)">
      <NoticeCreateAudienceSection
        form={form}
        locks={locks}
        onChange={onChange}
        sessionGisuId={sessionGisuId}
      />
      <NoticeCreateTargetSection
        form={form}
        isOrganizationLoading={isOrganizationLoading}
        locks={locks}
        onChange={onChange}
        organization={organization}
        partOptions={partOptions}
        recipientSummaryLine={recipientSummaryLine}
        schoolStaffPartsRequired={schoolStaffPartsRequired}
        sessionGisuId={sessionGisuId}
        sessionGisuLabel={sessionGisuLabel}
      />
      <NoticeCreateContentSection
        attachedVoteNoticeId={attachedVoteNoticeId}
        attachedVotePoll={attachedVotePoll}
        form={form}
        mode={mode}
        onChange={onChange}
        onImageUploadReject={onImageUploadReject}
        onVoteAddClick={onVoteAddClick}
        onVoteDeleteClick={onVoteDeleteClick}
        onVoteEditClick={onVoteEditClick}
        showRequiredFieldErrors={showRequiredFieldErrors}
        voteDraft={voteDraft}
      />
      <NoticeCreateSettingsSection
        form={form}
        isEditMode={locks.isEditMode}
        onChange={onChange}
      />
    </div>
  )
}
