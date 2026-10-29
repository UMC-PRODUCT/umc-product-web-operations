import { CheckIcon, CloseIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

type NoticeEditSummaryPanelProps = {
  isSubmitting: boolean
  onCancel: () => void
  onSubmitClick: () => void
}

type EditableItem = {
  editable: boolean
  label: string
}

const NOTICE_EDIT_SUMMARY_ITEMS: EditableItem[] = [
  { editable: true, label: "제목" },
  { editable: true, label: "본문" },
  { editable: true, label: "필독" },
  { editable: true, label: "이미지" },
  { editable: true, label: "링크" },
  { editable: true, label: "투표 삭제 후 추가" },
  { editable: false, label: "공지 종류" },
  { editable: false, label: "대상" },
]

function NoticeEditSummaryRow({ editable, label }: EditableItem) {
  return (
    <div className="flex items-center gap-(--umc-spacing-gap-4)">
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        {editable ? (
          <CheckIcon
            aria-hidden
            className="text-icon-brand-strong-600"
            size={16}
            weight="fill"
          />
        ) : (
          <CloseIcon
            aria-hidden
            className="text-icon-error"
            size={16}
            weight="fill"
          />
        )}
      </span>
      <span className="text-body-3-medium text-neutral-medium-600">
        {label}
      </span>
    </div>
  )
}

export function NoticeEditSummaryPanel({
  isSubmitting,
  onCancel,
  onSubmitClick,
}: NoticeEditSummaryPanelProps) {
  return (
    <aside className="border-neutral-disabled sticky top-0 flex w-[277px] shrink-0 flex-col rounded-(--umc-radius-14) border bg-white p-(--umc-spacing-padding-24)">
      <h2 className="text-heading-4-semibold text-neutral-default-900">
        수정 가능 항목
      </h2>
      <div className="mt-(--umc-spacing-gap-20) flex flex-col gap-(--umc-spacing-gap-32)">
        <div className="flex flex-col gap-(--umc-spacing-gap-4)">
          {NOTICE_EDIT_SUMMARY_ITEMS.map((item) => (
            <NoticeEditSummaryRow
              editable={item.editable}
              key={item.label}
              label={item.label}
            />
          ))}
        </div>
        <div className="flex flex-col gap-(--umc-spacing-gap-8)">
          <Button
            className="w-full"
            color="brand"
            disabled={isSubmitting}
            onClick={onSubmitClick}
            size="sm"
            type="button"
            variant="fill"
          >
            {isSubmitting ? "수정 중..." : "수정하기"}
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
