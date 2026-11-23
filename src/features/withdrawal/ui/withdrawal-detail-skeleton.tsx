import { PaperclipIcon } from "@umc-product/icons"
import { Skeleton } from "@umc-product/react"

/** Figma 체커보드 이미지 슬롯 (스켈레톤용, 임시 Figma asset URL 미사용) */
function EvidenceImagePlaceholder() {
  return (
    <div className="bg-fill-neutral-disabled relative size-[100px] shrink-0 overflow-hidden rounded-(--umc-radius-14)">
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
    </div>
  )
}

function EvidenceLinkSkeleton() {
  return (
    <div className="border-neutral-disabled flex w-full items-center gap-(--umc-spacing-padding-8) overflow-hidden rounded-(--umc-radius-8) border bg-white px-(--umc-spacing-padding-8) py-(--umc-spacing-padding-6)">
      <span className="bg-fill-neutral-disabled flex size-6 shrink-0 items-center justify-center rounded-[4.5px]">
        <PaperclipIcon
          aria-hidden
          className="text-neutral-medium-600"
          size={16}
        />
      </span>
      <div className="h-[21px] min-w-0 flex-1" />
    </div>
  )
}

function DetailFieldSkeleton() {
  return (
    <div className="flex w-full items-center gap-(--umc-spacing-gap-20)">
      <Skeleton className="h-[23px] w-12 shrink-0 rounded-[4px]" />
      <Skeleton className="h-[22px] w-[200px] shrink-0 rounded-[4px]" />
    </div>
  )
}

/**
 * Figma Web/Panel (2591:24943) — 탈부 상세보기 스켈레톤 본문.
 * Panel chrome(title/닫기)은 `WithdrawalDetailPanel`이 담당.
 */
export function WithdrawalDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="탈부 상세 불러오는 중"
      className="flex w-full flex-col gap-(--umc-spacing-gap-20) pt-(--umc-spacing-padding-16)"
    >
      <div className="flex w-full flex-col gap-(--umc-spacing-gap-16)">
        <div className="bg-fill-neutral-weak-75 flex w-full items-start rounded-(--umc-radius-12) px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-12)">
          <div className="h-[51px] w-full" />
        </div>

        <div className="flex w-full flex-col gap-(--umc-spacing-gap-10) rounded-(--umc-radius-8) px-(--umc-spacing-padding-16) pb-(--umc-spacing-padding-4)">
          <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
            <DetailFieldSkeleton />
            <DetailFieldSkeleton />
            <DetailFieldSkeleton />
            <DetailFieldSkeleton />
            <DetailFieldSkeleton />
          </div>

          <div className="flex w-full flex-col gap-(--umc-spacing-padding-10)">
            <div className="flex flex-col gap-(--umc-spacing-gap-8)">
              <Skeleton className="h-[23px] w-[59px] rounded-[4px]" />
              <div className="flex gap-(--umc-spacing-gap-8)">
                <EvidenceImagePlaceholder />
                <EvidenceImagePlaceholder />
                <EvidenceImagePlaceholder />
              </div>
            </div>

            <div className="flex w-full flex-col gap-(--umc-spacing-padding-6)">
              <EvidenceLinkSkeleton />
              <EvidenceLinkSkeleton />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="border-neutral-disabled w-full border-t" />

      <div className="flex w-full flex-col gap-(--umc-spacing-gap-4)">
        <Skeleton className="h-[22px] w-[74px] rounded-[4px]" />
        <div className="flex w-full items-center gap-(--umc-spacing-gap-4)">
          <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
            10/22 21:10
          </p>
          <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
            탈부 등록 · 루카
          </p>
        </div>
        <div className="flex w-full items-center gap-(--umc-spacing-gap-4)">
          <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
            10/22 21:10
          </p>
          <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
            탈부 등록 · 루카
          </p>
        </div>
        <div className="flex w-full items-center gap-(--umc-spacing-gap-4)">
          <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
            10/22 21:10
          </p>
          <p className="text-body-2-regular text-neutral-medium-600 whitespace-nowrap">
            탈부 등록 · 루카
          </p>
        </div>
      </div>
    </div>
  )
}
