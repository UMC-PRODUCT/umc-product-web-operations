import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "@umc-product/icons"
import { IconButton } from "@umc-product/react"
import { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"
import { lockBodyScroll } from "@/shared/lib/lock-body-scroll"

import type { NoticeImageAsset } from "../model/notice-detail.types"

type NoticeDetailImageLightboxProps = {
  images: NoticeImageAsset[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

/** Figma 468:3026 — 공지 상세 이미지 크게 보기 */
export function NoticeDetailImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: NoticeDetailImageLightboxProps) {
  const labelId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const image = images[index]
  const hasMultiple = images.length > 1
  const canGoPrevious = index > 0
  const canGoNext = index < images.length - 1

  useEffect(() => {
    const unlock = lockBodyScroll()
    closeButtonRef.current?.focus()
    return unlock
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (!hasMultiple) {
        return
      }
      if (event.key === "ArrowLeft" && canGoPrevious) {
        event.preventDefault()
        onIndexChange(index - 1)
        return
      }
      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault()
        onIndexChange(index + 1)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [canGoNext, canGoPrevious, hasMultiple, index, onClose, onIndexChange])

  if (!image?.src || typeof document === "undefined") {
    return null
  }

  const goPrevious = () => {
    if (canGoPrevious) {
      onIndexChange(index - 1)
    }
  }

  const goNext = () => {
    if (canGoNext) {
      onIndexChange(index + 1)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--umc-z-dialog,1000)]">
      <button
        aria-hidden
        className="absolute inset-0 border-0 bg-[var(--umc-color-dimmed-strong)]"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-labelledby={labelId}
        aria-modal="true"
        className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center px-(--umc-spacing-padding-32) pt-20 pb-(--umc-spacing-padding-32)"
        role="dialog"
      >
        <p className="sr-only" id={labelId}>
          공지 이미지 크게 보기
        </p>
        <img
          alt={image.alt}
          className="pointer-events-auto max-h-[min(720px,calc(100vh-200px))] max-w-[min(960px,calc(100vw-64px))] object-contain"
          src={image.src}
        />
        {hasMultiple ? (
          <nav
            aria-label="이미지 페이지"
            className={cn(
              "pointer-events-auto mt-(--umc-spacing-gap-40) flex items-center",
              "gap-(--umc-spacing-gap-40)",
            )}
          >
            {canGoPrevious ? (
              <button
                className="text-label-3-medium inline-flex items-center gap-[3px] border-0 bg-transparent p-0 text-white"
                onClick={goPrevious}
                type="button"
              >
                <ChevronLeftIcon
                  aria-hidden
                  className="text-white"
                  size={16}
                  weight="fill"
                />
                이전
              </button>
            ) : null}
            <div
              aria-live="polite"
              className="text-label-3-medium flex items-center gap-(--umc-spacing-gap-6) text-white"
            >
              <span>{index + 1}</span>
              <span aria-hidden>/</span>
              <span>{images.length}</span>
            </div>
            {canGoNext ? (
              <button
                className="text-label-3-medium inline-flex items-center gap-[3px] border-0 bg-transparent p-0 text-white"
                onClick={goNext}
                type="button"
              >
                다음
                <ChevronRightIcon
                  aria-hidden
                  className="text-white"
                  size={16}
                  weight="fill"
                />
              </button>
            ) : null}
          </nav>
        ) : null}
      </div>
      <IconButton
        ref={closeButtonRef}
        aria-label="닫기"
        className={cn(
          "pointer-events-auto absolute top-20 right-[34px] z-10",
          "[--umc-icon-button-bg:var(--umc-color-icon-neutral-strong-600)]",
          "[--umc-icon-button-bg-pressed:var(--umc-color-icon-neutral-strong-600)]",
        )}
        color="neutral"
        icon={<CloseIcon aria-hidden className="text-white" size={24} />}
        onClick={onClose}
        size="md"
        type="button"
        variant="fill"
      />
    </div>,
    document.body,
  )
}
