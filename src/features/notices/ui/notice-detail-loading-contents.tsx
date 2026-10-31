import { Tag } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

/** Figma NT-D01 불러오는 중 (516:12424) — 이미지 불러오기 중 본문 스켈레톤 */
type NoticeDetailLoadingContentsProps = {
  showRequiredTag?: boolean
}

function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-fill-neutral-disabled rounded-(--umc-radius-6)",
        className,
      )}
    />
  )
}

const IMAGE_PLACEHOLDER_CLASS = cn(
  "size-[200px] shrink-0 rounded-(--umc-radius-12)",
  "bg-[linear-gradient(138deg,var(--umc-color-fill-neutral-weaker-hover-pressed)_6.73%,var(--umc-color-fill-neutral-weak-hover-pressed)_93.94%)]",
)

export function NoticeDetailLoadingContents({
  showRequiredTag = true,
}: NoticeDetailLoadingContentsProps) {
  return (
    <>
      <div className="flex w-full items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-(--umc-spacing-gap-8)">
          {showRequiredTag ? (
            <Tag
              className="w-fit px-[7px]"
              color="error"
              size="md"
              variant="weak"
            >
              필독
            </Tag>
          ) : null}
          <Bone className="h-[25px] w-[330px] max-w-full" />
          <div className="flex w-full flex-wrap items-start gap-(--umc-spacing-gap-12)">
            <Bone className="h-[21px] w-[191px] max-w-full" />
            <Bone className="h-[21px] w-[171px] max-w-full" />
            <Bone className="h-[21px] w-[109px] max-w-full" />
          </div>
        </div>
      </div>

      <hr className="border-neutral-disabled m-0 w-full shrink-0 border-0 border-t" />

      <div className="flex w-full max-w-[774px] flex-col gap-(--umc-spacing-gap-8)">
        <Bone className="h-[21px] w-full" />
        <Bone className="h-[21px] w-full" />
        <Bone className="h-[21px] w-full" />
      </div>

      <div className="flex shrink-0 gap-(--umc-spacing-gap-12)">
        <div aria-hidden className={IMAGE_PLACEHOLDER_CLASS} />
        <div aria-hidden className={IMAGE_PLACEHOLDER_CLASS} />
      </div>
    </>
  )
}
