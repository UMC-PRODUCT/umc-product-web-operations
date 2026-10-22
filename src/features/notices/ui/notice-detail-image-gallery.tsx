import { ScrollFog } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import type { NoticeImageAsset } from "../model/notice-detail.types"

type NoticeDetailImageGalleryProps = {
  images: NoticeImageAsset[]
  /** Figma 580: 가로 스크롤 + 우측 페이드 (본문 폭 안에서만) */
  variant?: "base" | "scroll"
}

function ImageTile({ image }: { image: NoticeImageAsset }) {
  if (image.src) {
    return (
      <img
        alt={image.alt}
        className="size-[200px] shrink-0 rounded-(--umc-radius-12) object-cover"
        height={200}
        src={image.src}
        width={200}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        "size-[200px] shrink-0 rounded-(--umc-radius-12)",
        "bg-fill-neutral-disabled",
      )}
    />
  )
}

export function NoticeDetailImageGallery({
  images,
  variant = "scroll",
}: NoticeDetailImageGalleryProps) {
  if (images.length === 0) {
    return null
  }

  if (variant === "base") {
    return (
      <div className="flex shrink-0 gap-(--umc-spacing-gap-12)">
        {images.map((image) => (
          <ImageTile image={image} key={image.id} />
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <div className="flex gap-(--umc-spacing-gap-12) overflow-x-auto">
        {images.map((image) => (
          <ImageTile image={image} key={image.id} />
        ))}
      </div>
      <ScrollFog
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-[200px] w-[74px]"
        side="right"
      />
    </div>
  )
}
