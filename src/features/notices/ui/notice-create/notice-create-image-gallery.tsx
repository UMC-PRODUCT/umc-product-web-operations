import {
  ChevronLeftIcon,
  ChevronRightIcon,
  RemoveCircleIcon,
} from "@umc-product/icons"
import { IconButton, ImageThumbnailEditor, ScrollFog } from "@umc-product/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/shared/lib/cn"

import type { NoticeCreateExistingImage } from "../../model/notice-create-form"

const MAX_NOTICE_IMAGES = 10
const IMAGE_TILE_SIZE_PX = 160
const IMAGE_TILE_GAP_PX = 12
const IMAGE_SCROLL_STEP_PX = IMAGE_TILE_SIZE_PX + IMAGE_TILE_GAP_PX
const IMAGE_GALLERY_MAX_WIDTH_PX = 710
const IMAGE_SCROLL_NAV_ICON_BUTTON_CLASS =
  "absolute top-1/2 z-10 -translate-y-1/2 [--umc-icon-button-bg-pressed:var(--umc-color-icon-neutral-strong-600)] [--umc-icon-button-bg:var(--umc-color-icon-neutral-strong-600)]"

/** Figma AddImage filled slot — light checkerboard tile */
const NOTICE_CREATE_GALLERY_CHECKERBOARD_SRC =
  "/assets/notices/notice-create-gallery-checkerboard.png"

const IMAGE_ADD_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const

const IMAGE_ADD_LABEL = (
  <>
    이미지 추가
    <br />
    드래그 또는 클릭
  </>
)

const IMAGE_ADD_DESCRIPTION = (
  <>
    jpg, jpeg, png, gif,
    <br />
    webp, gif, heic
    <br />
    최대 10장까지
  </>
)

type NoticeCreateImageGalleryProps = {
  existingImages?: NoticeCreateExistingImage[]
  imageFiles: File[]
  onAdd: (file: File) => void
  onRemove: (index: number) => void
  onRemoveExisting?: (index: number) => void
  onUploadReject?: () => void
  showEmptyPlaceholders?: boolean
}

function estimateGalleryScrollWidth(tileCount: number) {
  if (tileCount <= 0) {
    return 0
  }
  return tileCount * IMAGE_TILE_SIZE_PX + (tileCount - 1) * IMAGE_TILE_GAP_PX
}

function NoticeCreateImageCheckerboard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "size-[160px] shrink-0 overflow-hidden rounded-(--umc-radius-14)",
        className,
      )}
      style={{
        background: `lightgray url("${NOTICE_CREATE_GALLERY_CHECKERBOARD_SRC}") 50% / cover no-repeat`,
      }}
    />
  )
}

function NoticeCreateExistingImagePreview({
  image,
  onRemove,
}: {
  image: NoticeCreateExistingImage
  onRemove: () => void
}) {
  return (
    <div className="relative size-[160px] shrink-0 overflow-hidden rounded-(--umc-radius-14)">
      <NoticeCreateImageCheckerboard className="absolute inset-0 size-full" />
      <img
        alt=""
        className="absolute inset-0 size-full object-cover"
        src={image.src}
      />
      <button
        aria-label="이미지 삭제"
        className="absolute top-2 right-2 flex size-8 items-center justify-center"
        onClick={onRemove}
        type="button"
      >
        <RemoveCircleIcon
          aria-hidden
          className="text-icon-neutral-weak-400"
          size={32}
          weight="fill"
        />
      </button>
    </div>
  )
}

function NoticeCreateImagePreview({
  file,
  onRemove,
}: {
  file: File
  onRemove: () => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="relative size-[160px] shrink-0 overflow-hidden rounded-(--umc-radius-14)">
      <NoticeCreateImageCheckerboard className="absolute inset-0 size-full" />
      {previewUrl ? (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          src={previewUrl}
        />
      ) : null}
      <button
        aria-label="이미지 삭제"
        className="absolute top-2 right-2 flex size-8 items-center justify-center"
        onClick={onRemove}
        type="button"
      >
        <RemoveCircleIcon
          aria-hidden
          className="text-icon-neutral-weak-400"
          size={32}
          weight="fill"
        />
      </button>
    </div>
  )
}

export function NoticeCreateImageGallery({
  existingImages = [],
  imageFiles,
  onAdd,
  onRemove,
  onRemoveExisting,
  onUploadReject,
  showEmptyPlaceholders = true,
}: NoticeCreateImageGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const persistedCount = existingImages.length
  const totalImageCount = persistedCount + imageFiles.length
  const showAddSlot = totalImageCount < MAX_NOTICE_IMAGES
  const placeholderCount = showEmptyPlaceholders
    ? MAX_NOTICE_IMAGES - totalImageCount - (showAddSlot ? 1 : 0)
    : 0
  const scrollTileCount = totalImageCount + placeholderCount
  const scrollViewportWidthPx =
    IMAGE_GALLERY_MAX_WIDTH_PX -
    (showAddSlot ? IMAGE_TILE_SIZE_PX + IMAGE_TILE_GAP_PX : 0)

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
    updateScrollState()
  }, [
    imageFiles.length,
    persistedCount,
    placeholderCount,
    showAddSlot,
    updateScrollState,
  ])

  useEffect(() => {
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
  }, [updateScrollState])

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

  const hasLikelyOverflow =
    estimateGalleryScrollWidth(scrollTileCount) > scrollViewportWidthPx

  return (
    <div className="flex w-full max-w-[710px] min-w-0 gap-(--umc-spacing-gap-12)">
      {showAddSlot ? (
        <ImageThumbnailEditor
          accept={[...IMAGE_ADD_ACCEPT]}
          className="size-[160px] shrink-0"
          description={IMAGE_ADD_DESCRIPTION}
          label={IMAGE_ADD_LABEL}
          maxSize={5 * 1024 * 1024}
          onReject={() => {
            onUploadReject?.()
          }}
          onValueChange={onAdd}
          value={null}
        />
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div
          className={cn(
            "flex min-w-0",
            "gap-(--umc-spacing-gap-12) overflow-x-auto overscroll-x-contain",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
          ref={scrollRef}
        >
          {existingImages.map((image, index) => (
            <NoticeCreateExistingImagePreview
              image={image}
              key={`${image.fileId}-${index}`}
              onRemove={() => {
                onRemoveExisting?.(index)
              }}
            />
          ))}
          {imageFiles.map((file, index) => (
            <NoticeCreateImagePreview
              file={file}
              key={`${file.name}-${file.lastModified}-${index}`}
              onRemove={() => {
                onRemove(index)
              }}
            />
          ))}
          {Array.from({ length: placeholderCount }, (_, index) => (
            <NoticeCreateImageCheckerboard key={`placeholder-${index}`} />
          ))}
        </div>

        {hasLikelyOverflow && canScrollLeft ? (
          <>
            <ScrollFog
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 h-[160px] w-[74px]"
              side="left"
            />
            <IconButton
              aria-label="이전 이미지 보기"
              className={cn(IMAGE_SCROLL_NAV_ICON_BUTTON_CLASS, "left-[0px]")}
              color="neutral"
              icon={<ChevronLeftIcon aria-hidden size={24} />}
              onClick={scrollPrev}
              size="lg"
              type="button"
              variant="fill"
            />
          </>
        ) : null}
        {hasLikelyOverflow && canScrollRight ? (
          <>
            <ScrollFog
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-[160px] w-[74px]"
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
    </div>
  )
}
