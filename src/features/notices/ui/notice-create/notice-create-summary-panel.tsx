import { CheckIcon } from "@umc-product/icons"
import { Button, Tag } from "@umc-product/react"

type NoticeCreateSummaryPanelProps = {
  audienceTags: string[]
  isSubmitting: boolean
  staffScopeLabel: string
  targetLine: string
  showMustRead: boolean
  showNotification: boolean
  onCancel: () => void
  onPublishClick: () => void
}

function NoticeCreateSummaryContent({
  audienceTags,
  showMustRead,
  showNotification,
  staffScopeLabel,
  targetLine,
}: Pick<
  NoticeCreateSummaryPanelProps,
  | "audienceTags"
  | "showMustRead"
  | "showNotification"
  | "staffScopeLabel"
  | "targetLine"
>) {
  return (
    <div className="flex flex-col gap-(--umc-spacing-gap-20)">
      <div className="flex flex-col gap-(--umc-spacing-gap-8)">
        <div className="flex flex-wrap gap-(--umc-spacing-gap-6)">
          {audienceTags.map((tag) => (
            <Tag color="brand" key={tag} size="md" variant="weak">
              {tag}
            </Tag>
          ))}
        </div>
        {staffScopeLabel ? (
          <p className="text-label-1-semibold text-neutral-default-900">
            {staffScopeLabel}
          </p>
        ) : null}
        {targetLine ? (
          <p className="text-body-1-regular text-neutral-medium-600">
            {targetLine}
          </p>
        ) : null}
      </div>

      {showMustRead || showNotification ? (
        <div className="flex flex-col gap-(--umc-spacing-gap-4)">
          {showMustRead ? (
            <div className="flex items-center gap-(--umc-spacing-gap-4)">
              <CheckIcon
                aria-hidden
                className="text-icon-brand-strong-600 shrink-0"
                size={16}
                weight="fill"
              />
              <span className="text-body-3-medium text-neutral-medium-600">
                필독
              </span>
            </div>
          ) : null}
          {showNotification ? (
            <div className="flex items-center gap-(--umc-spacing-gap-4)">
              <CheckIcon
                aria-hidden
                className="text-icon-brand-strong-600 shrink-0"
                size={16}
                weight="fill"
              />
              <span className="text-body-3-medium text-neutral-medium-600">
                알림 설정 (게시 즉시 대상자 푸시)
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function NoticeCreateSummaryPanel({
  audienceTags,
  isSubmitting,
  onCancel,
  onPublishClick,
  showMustRead,
  showNotification,
  staffScopeLabel,
  targetLine,
}: NoticeCreateSummaryPanelProps) {
  return (
    <aside className="border-neutral-disabled sticky top-0 flex w-[277px] shrink-0 flex-col rounded-(--umc-radius-14) border bg-white p-(--umc-spacing-padding-24)">
      <h2 className="text-heading-4-semibold text-neutral-default-900">
        공지 요약
      </h2>
      <div className="mt-(--umc-spacing-gap-20) flex flex-col gap-(--umc-spacing-gap-32)">
        <NoticeCreateSummaryContent
          audienceTags={audienceTags}
          showMustRead={showMustRead}
          showNotification={showNotification}
          staffScopeLabel={staffScopeLabel}
          targetLine={targetLine}
        />
        <div className="flex flex-col gap-(--umc-spacing-gap-8)">
          <Button
            className="w-full"
            color="brand"
            disabled={isSubmitting}
            onClick={onPublishClick}
            size="sm"
            type="button"
            variant="fill"
          >
            게시하기
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
