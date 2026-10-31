import { ChevronLeftIcon, ChevronRightIcon } from "@umc-product/icons"
import { IconButton, ScrollFog } from "@umc-product/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { cn } from "@/shared/lib/cn"

import { NoticeDetailImageLightbox } from "./notice-detail-image-lightbox"

import type { NoticeImageAsset } from "../model/notice-detail.types"

const IMAGE_TILE_SIZE_PX = 200
const IMAGE_TILE_GAP_PX = 12
const IMAGE_SCROLL_STEP_PX = IMAGE_TILE_SIZE_PX + IMAGE_TILE_GAP_PX
const IMAGE_SCROLL_NAV_ICON_BUTTON_CLASS =
  "absolute top-1/2 z-10 -translate-y-1/2 [--umc-icon-button-bg-pressed:var(--umc-color-icon-neutral-strong-600)] [--umc-icon-button-bg:var(--umc-color-icon-neutral-strong-600)]"

type NoticeDetailImageGalleryProps = {
  images: NoticeImageAsset[]
  variant?: "base" | "scroll"
}

type ImageTileProps = {
  image: NoticeImageAsset
  onOpen?: () => void
}

function ImageTile({ image, onOpen }: ImageTileProps) {
  if (image.src) {
    return (
      <button
        className={cn(
          "size-[200px] shrink-0 cursor-pointer overflow-hidden rounded-(--umc-radius-12)",
          "border-0 p-0",
        )}
        onClick={onOpen}
        type="button"
      >
        <img
          alt={image.alt}
          className="size-full object-cover"
          height={200}
          src={image.src}
          width={200}
        />
      </button>
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const viewableImages = useMemo(
    () => images.filter((item) => Boolean(item.src)),
    [images],
  )

  const openLightbox = (imageId: string) => {
    const nextIndex = viewableImages.findIndex((item) => item.id === imageId)
    if (nextIndex >= 0) {
      setLightboxIndex(nextIndex)
    }
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current
    if (!element) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const hasOverflow = element.scrollWidth - element.clientWidth > 1
    const atStart = element.scrollLeft <= 1
    const atEnd =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1
    setCanScrollLeft(hasOverflow && !atStart)
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

  const lightbox =
    lightboxIndex != null ? (
      <NoticeDetailImageLightbox
        images={viewableImages}
        index={lightboxIndex}
        onClose={closeLightbox}
        onIndexChange={setLightboxIndex}
      />
    ) : null

  if (variant === "base") {
    return (
      <>
        <div className="flex shrink-0 gap-(--umc-spacing-gap-12)">
          {images.map((image) => (
            <ImageTile
              image={image}
              key={image.id}
              onOpen={
                image.src
                  ? () => {
                      openLightbox(image.id)
                    }
                  : undefined
              }
            />
          ))}
        </div>
        {lightbox}
      </>
    )
  }

  const scrollNext = () => {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      left: IMAGE_SCROLL_STEP_PX,
    })
  }

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      left: -IMAGE_SCROLL_STEP_PX,
    })
  }

  return (
    <>
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
            <ImageTile
              image={image}
              key={image.id}
              onOpen={
                image.src
                  ? () => {
                      openLightbox(image.id)
                    }
                  : undefined
              }
            />
          ))}
        </div>
        {canScrollLeft ? (
          <>
            <ScrollFog
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 h-[200px] w-[74px]"
              side="left"
            />
            <IconButton
              aria-label="이전 이미지 보기"
              className={cn(IMAGE_SCROLL_NAV_ICON_BUTTON_CLASS, "left-[7px]")}
              color="neutral"
              icon={<ChevronLeftIcon aria-hidden size={24} />}
              onClick={scrollPrev}
              size="lg"
              type="button"
              variant="fill"
            />
          </>
        ) : null}
        {canScrollRight ? (
          <>
            <ScrollFog
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-[200px] w-[74px]"
              side="right"
            />
            <IconButton
              aria-label="다음 이미지 보기"
              className={cn(IMAGE_SCROLL_NAV_ICON_BUTTON_CLASS, "right-[0px]")}
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
      {lightbox}
    </>
  )
}
