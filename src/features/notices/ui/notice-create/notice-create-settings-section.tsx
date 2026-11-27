import { Checkbox } from "@umc-product/react"

import { NoticeCreateSection } from "./notice-create-section"

import type { NoticeCreateFormState } from "../../model/notice-create-form"

type NoticeCreateSettingsSectionProps = {
  form: NoticeCreateFormState
  isEditMode: boolean
  onChange: (patch: Partial<NoticeCreateFormState>) => void
}

/** 공지 설정 (필독 · 알림 발송) */
export function NoticeCreateSettingsSection({
  form,
  isEditMode,
  onChange,
}: NoticeCreateSettingsSectionProps) {
  return (
    <NoticeCreateSection title="공지 설정">
      <div className="flex flex-col gap-(--umc-spacing-gap-20)">
        <Checkbox
          checked={form.mustRead}
          color={form.mustRead ? "brand" : "neutral"}
          labelPlacement="end"
          onCheckedChange={(checked) => {
            onChange({ mustRead: checked === true })
          }}
          size="lg"
        >
          필독
        </Checkbox>
        <div className="flex items-center gap-(--umc-spacing-gap-8)">
          <Checkbox
            checked={form.sendNotification}
            color={
              isEditMode
                ? "neutral"
                : form.sendNotification
                  ? "brand"
                  : "neutral"
            }
            disabled={isEditMode}
            labelPlacement="end"
            onCheckedChange={(checked) => {
              onChange({ sendNotification: checked === true })
            }}
            size="lg"
          >
            알림 발송
          </Checkbox>
          <span className="text-body-3-regular text-neutral-medium-600">
            게시 즉시 대상자에게 푸시돼요
          </span>
        </div>
      </div>
    </NoticeCreateSection>
  )
}
