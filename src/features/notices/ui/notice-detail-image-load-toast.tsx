import { CheckCircleIcon, CloseIcon, WarningIcon } from "@umc-product/icons"
import { TextButton } from "@umc-product/react"

import type { NoticeImageLoadState } from "../model/notice-detail.types"

const IMAGE_LOAD_FAILED_MESSAGE =
  "공지는 올라갔지만 이미지를 불러오지 못했어요."

const IMAGE_LOAD_SUCCESS_MESSAGE = "이미지와 함께 공지를 등록했어요"

const darkToastClassName =
  "inline-flex min-h-11 w-full min-w-[400px] max-w-full items-center rounded-(--umc-radius-14) bg-neutral-strong-800/80 py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px]"

type NoticeDetailImageLoadToastProps = {
  onDismissSuccess?: () => void
  onLoadImages?: () => void
  state: NoticeImageLoadState
}

export function NoticeDetailImageLoadToast({
  onDismissSuccess,
  onLoadImages,
  state,
}: NoticeDetailImageLoadToastProps) {
  if (state === "pending") {
    return (
      <div className={`${darkToastClassName} w-fit`} role="status">
        <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-8)">
          <WarningIcon
            aria-hidden
            className="shrink-0 text-[var(--umc-color-icon-warning)]"
            size={24}
            weight="fill"
          />
          <p className="text-label-3-medium min-w-0 text-white">
            {IMAGE_LOAD_FAILED_MESSAGE}
          </p>
        </div>
        <TextButton
          className="shrink-0 pl-(--umc-spacing-padding-12) text-white"
          onClick={onLoadImages}
          size="md"
          type="button"
          variant="underline"
        >
          이미지 불러오기
        </TextButton>
      </div>
    )
  }

  if (state === "loading") {
    return (
      <div
        className={`${darkToastClassName} justify-between gap-(--umc-spacing-gap-8)`}
        role="status"
        aria-busy="true"
      >
        <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-8)">
          <WarningIcon
            aria-hidden
            className="shrink-0 text-[var(--umc-color-icon-warning)]"
            size={24}
            weight="fill"
          />
          <p className="text-label-3-medium min-w-0 text-white">
            {IMAGE_LOAD_FAILED_MESSAGE}
          </p>
        </div>
        <span className="text-label-3-medium shrink-0 pl-(--umc-spacing-padding-12) text-white underline">
          불러오는 중...
        </span>
      </div>
    )
  }

  return (
    <div
      className="inline-flex min-h-11 w-full max-w-full min-w-[400px] items-center justify-between gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[var(--umc-color-action-primary-default,#b3e5e1)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-(--umc-shadow-drop-neutral-1)"
      role="status"
    >
      <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-8)">
        <CheckCircleIcon
          aria-hidden
          className="shrink-0 text-[var(--umc-color-icon-brand,#015a54)]"
          size={24}
          weight="fill"
        />
        <p className="text-label-3-medium min-w-0 text-[var(--umc-color-teal-teal-700,#015a54)]">
          {IMAGE_LOAD_SUCCESS_MESSAGE}
        </p>
      </div>
      <button
        aria-label="닫기"
        className="shrink-0 pl-(--umc-spacing-padding-8) text-[var(--umc-color-icon-neutral-default,#404443)]"
        onClick={onDismissSuccess}
        type="button"
      >
        <CloseIcon aria-hidden size={20} weight="regular" />
      </button>
    </div>
  )
}
