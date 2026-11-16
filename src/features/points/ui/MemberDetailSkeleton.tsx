import { Skeleton } from "@umc-product/react"

const HISTORY_SKELETON_ROW_COUNT = 3

/** `MemberProfileCard` + 상벌점 이력 영역과 같은 골격의 로딩 화면 */
export function MemberDetailSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="구성원 정보를 불러오는 중이에요"
      className="flex flex-col gap-[40px]"
    >
      <div className="border-neutral-disabled flex w-full flex-col gap-(--umc-spacing-gap-20) overflow-hidden rounded-(--umc-radius-12) border bg-white p-(--umc-spacing-padding-32)">
        <div className="flex items-start justify-between rounded-(--umc-radius-8)">
          <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-12)">
            <Skeleton className="rounded-full" height={80} width={80} />
            <div className="flex min-w-0 flex-col items-start justify-center gap-(--umc-spacing-gap-8)">
              <Skeleton height={32} width={220} />
              <Skeleton height={24} width={320} />
            </div>
          </div>
          <Skeleton height={36} width={132} />
        </div>
        <div className="flex items-start gap-(--umc-spacing-gap-12)">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              className="shrink-0"
              height={118}
              key={index}
              width={200}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-20)">
        <Skeleton height={28} width={120} />
        <div className="flex flex-col gap-(--umc-spacing-gap-8)">
          {Array.from({ length: HISTORY_SKELETON_ROW_COUNT }, (_, index) => (
            <Skeleton height={48} key={index} width="100%" />
          ))}
        </div>
      </div>
    </section>
  )
}
