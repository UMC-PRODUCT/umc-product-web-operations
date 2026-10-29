import { ChevronRightIcon } from "@umc-product/icons"
import { IconButton, ScrollFog } from "@umc-product/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/shared/lib/cn"

import type { NoticeImageAsset } from "../model/notice-detail.types"

const IMAGE_TILE_SIZE_PX = 200
const IMAGE_TILE_GAP_PX = 12
const IMAGE_SCROLL_STEP_PX = IMAGE_TILE_SIZE_PX + IMAGE_TILE_GAP_PX

type NoticeDetailImageGalleryProps = {
  images: NoticeImageAsset[]
  /** Figma 580: 가로 스크롤 + 우측 페이드 (상세 카드 본문 폭) */
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current
    if (!element) {
      setCanScrollRight(false)
      return
    }
    const hasOverflow = element.scrollWidth - element.clientWidth > 1
    const atEnd =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
    setCanScrollRight(hasOverflow && !atEnd)
  }, [])

  useLayoutEffect(() => {
    if (variant !== "scroll") {
      return
    }
    updateScrollState()
  }, [images.length, updateScrollState, variant])

  useEffect(() => {
    if (variant !== "scroll") {
      return
    }

    const element = scrollRef.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver(() => {
      updateScrollState()
    })
    observer.observe(element)

    element.addEventListener("scroll", updateScrollState, { passive: true })
    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", updateScrollState)
    }
  }, [updateScrollState, variant])

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

  const scrollNext = () => {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      left: IMAGE_SCROLL_STEP_PX,
    })
  }

  return (
    <div className="relative w-full min-w-0 self-stretch">
      <div
        className={cn(
          "flex w-full min-w-0",
          "gap-(--umc-spacing-gap-12) overflow-x-auto overscroll-x-contain",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
        ref={scrollRef}
      >
        {images.map((image) => (
          <ImageTile image={image} key={image.id} />
        ))}
      </div>
      {canScrollRight ? (
        <>
          <ScrollFog
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 h-[200px] w-[74px]"
            side="right"
          />
          <IconButton
            aria-label="다음 이미지 보기"
            className="absolute top-1/2 right-[7px] z-10 -translate-y-1/2 [--umc-icon-button-bg-pressed:var(--umc-color-icon-neutral-strong-600)] [--umc-icon-button-bg:var(--umc-color-icon-neutral-strong-600)]"
            color="neutral"
            icon={<ChevronRightIcon aria-hidden size={24} />}
            onClick={scrollNext}
            size="lg"
            type="button"
            variant="fill"
          />
        </>
      ) : null}
    </div>
  )
}
