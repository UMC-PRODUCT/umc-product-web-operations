import { Button, Divider } from "@umc-product/react"

import { getWithdrawalPartLabel } from "../model/member-part-label"
import {
  findWithdrawalRegisterReason,
  WITHDRAWAL_REGISTER_TYPE_LABEL,
} from "../model/withdrawal-register-reasons"

import type { WithdrawalRegisterProfileMember } from "../model/withdrawal-profile-member"
import type { WithdrawalRegisterFormState } from "../model/withdrawal-register-form"

type WithdrawalRegisterSummaryPanelProps = {
  form: WithdrawalRegisterFormState
  member: WithdrawalRegisterProfileMember | null
  canSubmit: boolean
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: () => void
}

function SummaryRow({
  label,
  value,
  subValue,
}: {
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex items-start gap-(--umc-spacing-gap-20)">
      <p className="text-body-1-regular text-teal-grey-700 w-10 shrink-0">
        {label}
      </p>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-label-3-semibold text-neutral-default-900">
          {value}
        </p>
        {subValue ? (
          <p className="text-body-1-regular text-neutral-strong-800">
            {subValue}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function resolveReasonSummaryLabel(
  form: WithdrawalRegisterFormState,
): string | null {
  const option = findWithdrawalRegisterReason(form.reasonId)
  return option?.summaryLabel ?? null
}

function resolveEvidenceSummary(
  form: WithdrawalRegisterFormState,
): string | null {
  const parts: string[] = []
  if (form.imageFiles.length > 0) {
    parts.push(`이미지 ${form.imageFiles.length}장`)
  }
  if (form.links.length > 0) {
    parts.push(`링크 ${form.links.length}개`)
  }
  if (parts.length === 0) {
    return null
  }
  return parts.join(" · ")
}

export function WithdrawalRegisterSummaryPanel({
  form,
  member,
  canSubmit,
  isSubmitting,
  onCancel,
  onSubmit,
}: WithdrawalRegisterSummaryPanelProps) {
  const partLabel =
    member != null
      ? (member.partLabel ?? getWithdrawalPartLabel(member.part))
      : ""
  const targetSubLine =
    member != null
      ? [member.generation, member.schoolLabel, partLabel]
          .filter(Boolean)
          .join(" · ")
      : ""
  const reasonTypeLabel =
    form.reasonType != null
      ? WITHDRAWAL_REGISTER_TYPE_LABEL[form.reasonType]
      : null
  const reasonSummaryLabel = resolveReasonSummaryLabel(form)
  const evidenceSummaryLabel = resolveEvidenceSummary(form)

  return (
    <aside className="border-neutral-disabled sticky top-0 flex w-[277px] shrink-0 flex-col rounded-(--umc-radius-14) border bg-white p-(--umc-spacing-padding-24)">
      <h2 className="text-heading-4-semibold text-neutral-default-900">
        탈부 요약
      </h2>
      <div className="mt-(--umc-spacing-gap-20) flex flex-col gap-(--umc-spacing-gap-32)">
        <div className="flex flex-col gap-(--umc-spacing-gap-20)">
          <div className="flex flex-col gap-(--umc-spacing-gap-12)">
            {member != null ? (
              <SummaryRow
                label="대상"
                subValue={targetSubLine}
                value={`${member.name} / ${member.nickname}`}
              />
            ) : null}
            {reasonTypeLabel != null ? (
              <SummaryRow label="유형" value={reasonTypeLabel} />
            ) : null}
            {reasonSummaryLabel != null ? (
              <SummaryRow label="사유" value={reasonSummaryLabel} />
            ) : null}
            {evidenceSummaryLabel != null ? (
              <SummaryRow label="근거" value={evidenceSummaryLabel} />
            ) : null}
          </div>
          {member != null ? (
            <>
              <Divider className="w-full [--umc-divider-color:var(--umc-color-border-neutral-medium-300)] [--umc-divider-line-thickness:1px]" />
            </>
          ) : null}
          {member != null ? (
            <div className="flex flex-col gap-1">
              <p className="text-label-3-medium text-neutral-default-900">
                처리하면
              </p>
              <ul className="text-body-1-regular text-neutral-weak-500 list-none space-y-0">
                <li>· 활동 상태가 ‘탈부’로 바뀌어요</li>
                <li>
                  · {member.generation} {partLabel} 파트 명단에서 빠져요
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-(--umc-spacing-gap-8)">
          <Button
            className="w-full"
            color="red"
            disabled={!canSubmit}
            isLoading={isSubmitting}
            onClick={onSubmit}
            size="sm"
            type="button"
            variant="fill"
          >
            탈부 등록하기
          </Button>
          <Button
            className="w-full"
            color="neutral"
            disabled={isSubmitting}
            onClick={onCancel}
            size="sm"
            type="button"
            variant="weak"
          >
            취소하기
          </Button>
        </div>
      </div>
    </aside>
  )
}
