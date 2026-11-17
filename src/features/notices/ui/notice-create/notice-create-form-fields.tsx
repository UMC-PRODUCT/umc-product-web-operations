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
} from "./notice-create-form-locks"

type NoticeCreateFormFieldsProps = {
  /** 슈퍼·중앙: 챌린저 해제 시 대상 필터 초기화 */
  centralUnrestrictedCreate?: boolean
  /** 지부장: 챌린저 대상 공지만 작성 (체크 고정) */
  chapterPresidentChallengerOnly?: boolean
  chapterPresidentCreateLock?: NoticeChapterPresidentCreateLock | null
  schoolExecutiveCreateLock?: NoticeSchoolExecutiveCreateLock | null
  /** 교내 파트장·기타 운영진: 챌린저/운영진 공지 시 파트 필수 */
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
  showRequiredFieldErrors: boolean
  targetSummaryLine: string
  voteDraft?: NoticeCreateVoteDraft | null
}

export function NoticeCreateFormFields({
  centralUnrestrictedCreate = false,
  chapterPresidentChallengerOnly = false,
  chapterPresidentCreateLock = null,
  schoolExecutiveCreateLock = null,
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
  showRequiredFieldErrors,
  targetSummaryLine,
  voteDraft = null,
}: NoticeCreateFormFieldsProps) {
  const locks = resolveNoticeCreateFormLocks({
    centralUnrestrictedCreate,
    chapterPresidentChallengerOnly,
    chapterPresidentCreateLock,
    form,
    mode,
    schoolExecutiveCreateLock,
  })

  return (
    <div className="flex flex-col gap-(--umc-spacing-gap-24)">
      <NoticeCreateAudienceSection
        form={form}
        locks={locks}
        onChange={onChange}
      />
      <NoticeCreateTargetSection
        form={form}
        isOrganizationLoading={isOrganizationLoading}
        locks={locks}
        onChange={onChange}
        organization={organization}
        partOptions={partOptions}
        schoolStaffPartsRequired={schoolStaffPartsRequired}
        targetSummaryLine={targetSummaryLine}
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
