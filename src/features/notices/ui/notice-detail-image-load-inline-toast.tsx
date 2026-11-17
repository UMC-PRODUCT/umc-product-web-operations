import { InlineAlert } from "@/shared/ui/inline-alert"

import type { NoticeImageLoadState } from "../model/notice-detail.types"

const IMAGE_LOAD_FAILED_MESSAGE =
  "공지는 올라갔지만 이미지를 불러오지 못했어요."

type NoticeDetailImageLoadInlineToastProps = {
  onLoadImages: () => void
  state: Extract<NoticeImageLoadState, "pending" | "loading">
}

/**
 * Figma 525:7982 · 525:7983 — DS Toast `warning`(배경 neutral dark, 아이콘 warning), 그림자 없음.
 * 본문·「이미지 불러오기」·「불러오는 중…」 모두 text-inverse.
 */
export function NoticeDetailImageLoadInlineToast({
  onLoadImages,
  state,
}: NoticeDetailImageLoadInlineToastProps) {
  return (
    <InlineAlert
      action={
        state === "pending"
          ? { label: "이미지 불러오기", onClick: onLoadImages }
          : undefined
      }
      className="w-fit max-w-full min-w-[400px]"
      elevated={false}
      tone="warning"
    >
      {IMAGE_LOAD_FAILED_MESSAGE}
      {state === "loading" ? (
        <>
          {" "}
          <span className="underline">불러오는 중...</span>
        </>
      ) : null}
    </InlineAlert>
  )
}
