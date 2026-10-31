import { WarningIcon } from "@umc-product/icons"

import { cn } from "@/shared/lib/cn"

import type { NoticeImageLoadState } from "../model/notice-detail.types"

const IMAGE_LOAD_FAILED_MESSAGE =
  "공지는 올라갔지만 이미지를 불러오지 못했어요."

type NoticeDetailImageLoadInlineToastProps = {
  onLoadImages: () => void
  state: Extract<NoticeImageLoadState, "pending" | "loading">
}

/**
 * Figma 525:7982 · 525:7983 — DS Toast `warning`(배경 neutral dark, 아이콘 warning), 그림자 없음.
 * 본문·「이미지 불러오기」·「불러오는 중…」 모두 `--umc-toast-fg`(text-inverse).
 */
export function NoticeDetailImageLoadInlineToast({
  onLoadImages,
  state,
}: NoticeDetailImageLoadInlineToastProps) {
  return (
    <div
      className={cn(
        "umc-toast w-fit max-w-full min-w-[400px]",
        "[box-shadow:none]",
      )}
      data-color="warning"
      data-icon=""
      role="status"
    >
      <div className="umc-toast__main">
        <span aria-hidden className="umc-toast__icon">
          <WarningIcon size={24} weight="fill" />
        </span>
        <p className="umc-toast__message">
          {IMAGE_LOAD_FAILED_MESSAGE}
          {state === "loading" ? (
            <>
              {" "}
              <span className="underline">불러오는 중...</span>
            </>
          ) : null}
        </p>
      </div>
      {state === "pending" ? (
        <button
          className="umc-toast__action"
          onClick={onLoadImages}
          type="button"
        >
          이미지 불러오기
        </button>
      ) : null}
    </div>
  )
}
