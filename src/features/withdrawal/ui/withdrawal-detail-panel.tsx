import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperclipIcon,
} from "@umc-product/icons"
import {
  BottomSheetActions,
  IconButton,
  Panel,
  PanelCloseButton,
  ScrollFog,
} from "@umc-product/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/shared/lib/cn"

import { WithdrawalDetailSkeleton } from "./withdrawal-detail-skeleton"
import { WithdrawalEvidenceImageLightbox } from "./withdrawal-evidence-image-lightbox"

import type {
  WithdrawalDetail,
  WithdrawalEvidenceImage,
} from "../model/withdrawal-detail"

const EVIDENCE_IMAGE_SIZE_PX = 100
const EVIDENCE_IMAGE_GAP_PX = 8
const EVIDENCE_IMAGE_SCROLL_STEP_PX =
  EVIDENCE_IMAGE_SIZE_PX + EVIDENCE_IMAGE_GAP_PX
const EVIDENCE_SCROLL_NAV_ICON_BUTTON_CLASS =
  "absolute top-1/2 z-10 -translate-y-1/2 [--umc-icon-button-bg-pressed:var(--umc-color-icon-neutral-strong-600)] [--umc-icon-button-bg:var(--umc-color-icon-neutral-strong-600)]"

type WithdrawalDetailPanelProps = {
  open: boolean
  detail: WithdrawalDetail | null
  /** 상세 조회 중 — Figma 2591:24943 스켈레톤 */
  isLoading?: boolean
  onOpenChange: (open: boolean) => void
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-(--umc-spacing-gap-20)">
      <p className="text-body-1-regular text-neutral-medium-600 shrink-0 whitespace-nowrap">
        {label}
      </p>
      <p className="text-label-3-medium text-neutral-strong-800 min-w-0">
        {value}
      </p>
    </div>
  )
}

function EvidenceImage({ src, onOpen }: { src?: string; onOpen: () => void }) {
  return (
    <button
      aria-label="근거 자료 이미지 크게 보기"
      className="bg-fill-neutral-disabled relative size-[100px] shrink-0 cursor-pointer overflow-hidden rounded-(--umc-radius-14) border-0 p-0"
      onClick={onOpen}
      type="button"
    >
      {src ? (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          src={src}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #e2e3e3 25%, transparent 25%), linear-gradient(-45deg, #e2e3e3 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e3e3 75%), linear-gradient(-45deg, transparent 75%, #e2e3e3 75%)",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
            backgroundSize: "16px 16px",
            backgroundColor: "#eff0f0",
          }}
        />
      )}
    </button>
  )
}

/**
 * Figma 2591:12427 — 근거 자료 이미지가 넘칠 때 가로 스크롤 + ScrollFog + chevron.
 */
function EvidenceImageRow({ images }: { images: WithdrawalEvidenceImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
  }, [images.length, updateScrollState])

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
      left: EVIDENCE_IMAGE_SCROLL_STEP_PX,
    })
  }

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      left: -EVIDENCE_IMAGE_SCROLL_STEP_PX,
    })
  }

  return (
    <>
      <div className="relative w-full min-w-0">
        <div
          className={cn(
            "flex w-full min-w-0",
            "gap-(--umc-spacing-gap-8) overflow-x-auto overscroll-x-contain",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
          ref={scrollRef}
        >
          {images.map((image, index) => (
            <EvidenceImage
              key={image.id}
              onOpen={() => {
                setLightboxIndex(index)
              }}
              src={image.src}
            />
          ))}
        </div>

        {canScrollLeft ? (
          <>
            <ScrollFog
              className="pointer-events-none absolute top-0 left-0 h-[100px] [--umc-scroll-fog-size:46px]"
              side="left"
            />
            <IconButton
              aria-label="이전 이미지 보기"
              className={cn(EVIDENCE_SCROLL_NAV_ICON_BUTTON_CLASS, "left-0")}
              color="neutral"
              icon={<ChevronLeftIcon aria-hidden size={20} />}
              onClick={scrollPrev}
              size="sm"
              type="button"
              variant="fill"
            />
          </>
        ) : null}

        {canScrollRight ? (
          <>
            <ScrollFog
              className="pointer-events-none absolute top-0 right-0 h-[100px] [--umc-scroll-fog-size:46px]"
              side="right"
            />
            <IconButton
              aria-label="다음 이미지 보기"
              className={cn(EVIDENCE_SCROLL_NAV_ICON_BUTTON_CLASS, "right-0")}
              color="neutral"
              icon={<ChevronRightIcon aria-hidden size={20} />}
              onClick={scrollNext}
              size="sm"
              type="button"
              variant="fill"
            />
          </>
        ) : null}
      </div>

      {lightboxIndex != null ? (
        <WithdrawalEvidenceImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => {
            setLightboxIndex(null)
          }}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  )
}

function EvidenceLinkCard({
  urlLabel,
  href,
}: {
  urlLabel: string
  href?: string
}) {
  const className =
    "border-neutral-disabled flex w-full items-center gap-(--umc-spacing-padding-8) overflow-hidden rounded-(--umc-radius-8) border bg-white px-(--umc-spacing-padding-8) py-(--umc-spacing-padding-6) no-underline"

  const content = (
    <>
      <span className="bg-fill-neutral-disabled flex size-6 shrink-0 items-center justify-center rounded-[4.5px]">
        <PaperclipIcon
          aria-hidden
          className="text-neutral-medium-600"
          size={16}
        />
      </span>
      <span className="text-body-3-regular text-neutral-medium-600 min-w-0 flex-1 truncate">
        {urlLabel}
      </span>
    </>
  )

  if (href) {
    return (
      <a className={className} href={href} rel="noreferrer" target="_blank">
        {content}
      </a>
    )
  }

  return <div className={className}>{content}</div>
}

/**
 * Figma Web/Panel (2591:12359) — 탈부 상세보기.
 * DS `Panel` + `BottomSheetActions` (닫기 only).
 */
export function WithdrawalDetailPanel({
  open,
  detail,
  isLoading = false,
  onOpenChange,
}: WithdrawalDetailPanelProps) {
  const metaLine =
    detail == null
      ? ""
      : [
          detail.schoolLabel,
          detail.chapterLabel,
          detail.partLabel,
          detail.generationLabel,
        ].join(" · ")

  return (
    <Panel
      actions={
        <BottomSheetActions
          layout="full"
          primary={{
            label: "닫기",
            onClick: () => onOpenChange(false),
          }}
        />
      }
      headSlot={<PanelCloseButton />}
      onOpenChange={onOpenChange}
      open={open}
      title="탈부 상세보기"
    >
      {isLoading ? (
        <WithdrawalDetailSkeleton />
      ) : detail == null ? null : (
        <div className="flex w-full flex-col gap-(--umc-spacing-gap-20) pt-(--umc-spacing-padding-16)">
          <div className="flex w-full flex-col gap-(--umc-spacing-gap-16)">
            <div className="bg-fill-neutral-weak-75 flex w-full items-start rounded-(--umc-radius-12) px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-12)">
              <div className="flex w-full flex-col gap-(--umc-spacing-gap-4)">
                <p className="text-label-2-medium text-neutral-strong-800 whitespace-nowrap">
                  {detail.name} / {detail.nickname}
                </p>
                <p className="text-body-1-regular text-neutral-medium-600">
                  {metaLine}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-(--umc-spacing-gap-10) rounded-(--umc-radius-8) px-(--umc-spacing-padding-16) pb-(--umc-spacing-padding-4)">
              <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
                <DetailField label="유형" value={detail.typeLabel} />
                <DetailField label="사유" value={detail.reasonLabel} />
                <DetailField label="날짜" value={detail.dateLabel} />
                <DetailField label="등록" value={detail.registeredByLabel} />
                <DetailField label="메모" value={detail.memo} />
              </div>

              <div className="flex w-full flex-col gap-(--umc-spacing-padding-10)">
                <div className="flex flex-col gap-(--umc-spacing-gap-8)">
                  <p className="text-body-1-regular text-neutral-medium-600">
                    근거 자료
                  </p>
                  {detail.evidenceImages.length > 0 ? (
                    <EvidenceImageRow images={detail.evidenceImages} />
                  ) : null}
                </div>

                {detail.evidenceLinks.length > 0 ? (
                  <div className="flex w-full flex-col gap-(--umc-spacing-padding-6)">
                    {detail.evidenceLinks.map((link) => (
                      <EvidenceLinkCard
                        href={link.href}
                        key={link.id}
                        urlLabel={link.urlLabel}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="border-neutral-disabled w-full border-t"
          />

          <div className="flex w-full flex-col gap-(--umc-spacing-gap-4)">
            <p className="text-label-3-medium text-neutral-strong-800">
              진행기록
            </p>
            {detail.progressLogs.map((log) => (
              <div
                className="flex w-full items-center gap-(--umc-spacing-gap-4)"
                key={log.id}
              >
                <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
                  {log.timeLabel}
                </p>
                <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
                  {log.actionLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}
