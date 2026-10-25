import { AddIcon, PersonIcon } from "@umc-product/icons"
import { Button, StatusTag } from "@umc-product/react"

import { getPartLabel, getRegionLabel } from "../model/member-labels"
import { formatPointScore } from "../model/point-history"

import type { MemberPointSummary } from "../model/point-history"
import type { PointsMember } from "../model/types"

type MemberProfileCardProps = {
  member: PointsMember
  summary: MemberPointSummary
  onAwardPoints?: () => void
}

/*
 * Figma Profile Card (713:11320) hierarchy:
 * Card(col gap-20 p-32) →
 *   Top(row justify-between): Left(avatar + info) | Button
 *   Score row(gap-12): 총점 | 상점 합계 | 벌점 합계
 */
function ScoreStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "brand" | "error"
}) {
  return (
    <div className="bg-fill-neutral-weak-75 flex w-[200px] shrink-0 flex-col items-center justify-center gap-(--umc-spacing-gap-12) overflow-hidden rounded-(--umc-radius-12) px-[40px] pt-(--umc-spacing-padding-20) pb-(--umc-spacing-padding-28)">
      <p className="text-body-1-regular text-neutral-weak-500 w-full truncate text-center">
        {label}
      </p>
      <div className="flex w-full items-center justify-center pr-0.5">
        <p
          className={`text-heading-1-semibold min-w-0 flex-1 truncate text-center ${tone === "brand" ? "text-brand-default-600" : "text-error"}`}
        >
          {formatPointScore(value)}
        </p>
      </div>
    </div>
  )
}

export function MemberProfileCard({
  member,
  summary,
  onAwardPoints,
}: MemberProfileCardProps) {
  const meta = [
    member.schoolLabel,
    member.regionLabel ?? getRegionLabel(member.region),
    member.partLabel ?? getPartLabel(member.part),
    member.generation,
  ]

  return (
    <section className="border-neutral-disabled flex w-full flex-col gap-(--umc-spacing-gap-20) overflow-hidden rounded-(--umc-radius-12) border bg-white p-(--umc-spacing-padding-32)">
      {/* Top — Frame 2087331287 */}
      <div className="flex items-start justify-between rounded-(--umc-radius-8)">
        <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-12)">
          <span
            aria-hidden
            className="bg-fill-neutral-weak-75 text-icon-neutral-weak-400 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full"
          >
            <PersonIcon size={36} />
          </span>
          <div className="flex min-w-0 flex-col items-start justify-center gap-(--umc-spacing-gap-8)">
            <div className="flex items-center gap-(--umc-spacing-gap-12)">
              <h1 className="text-title-2-semibold text-neutral-default-900 truncate">
                {member.name} / {member.nickname}
              </h1>
              <StatusTag color="brand">활동</StatusTag>
            </div>
            {/* log — school | region | part | generation */}
            <div className="text-body-1-regular text-teal-grey-700 flex flex-wrap items-center gap-(--umc-spacing-gap-12)">
              {meta.map((item, index) => (
                <span
                  className="flex items-center gap-(--umc-spacing-gap-12)"
                  key={item}
                >
                  <span>{item}</span>
                  {index < meta.length - 1 ? (
                    <span
                      aria-hidden
                      className="text-body-3-regular text-teal-grey-400"
                    >
                      |
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-(--umc-spacing-gap-12)">
          <Button
            color="primary"
            leadingIcon={<AddIcon aria-hidden size={14} />}
            onClick={onAwardPoints}
            size="sm"
            type="button"
            variant="fill"
          >
            상벌점 부여하기
          </Button>
        </div>
      </div>

      {/* Score cards — Frame 2087332429 */}
      <div className="flex items-start gap-(--umc-spacing-gap-12)">
        <ScoreStat
          label="총점"
          tone={summary.total >= 0 ? "brand" : "error"}
          value={summary.total}
        />
        <ScoreStat label="상점 합계" tone="brand" value={summary.rewardTotal} />
        <ScoreStat
          label="벌점 합계"
          tone="error"
          value={summary.penaltyTotal}
        />
      </div>
    </section>
  )
}
