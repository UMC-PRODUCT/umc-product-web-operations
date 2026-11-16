import { AddIcon, SubtractionIcon } from "@umc-product/icons"
import { Checkbox } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { formatOtherScoreCaption } from "../../model/point-types"
import { AwardFieldLabel } from "./AwardFieldLabel"

import type { OtherPointKind } from "../../model/point-types"

type AwardOtherPointFieldsProps = {
  otherKind: OtherPointKind | null
  otherMagnitude: number | null
  submitting: boolean
  onSelectKind: (kind: OtherPointKind, checked: boolean) => void
  onIncrement: () => void
  onDecrement: () => void
}

/** 기타 탭: 구분(상점/벌점) 선택 + 점수 스테퍼 */
export function AwardOtherPointFields({
  otherKind,
  otherMagnitude,
  submitting,
  onSelectKind,
  onIncrement,
  onDecrement,
}: AwardOtherPointFieldsProps) {
  const scoreStepperEnabled = otherKind !== null && !submitting
  const scoreDisplay =
    otherKind === null || otherMagnitude === null
      ? "-"
      : otherKind === "penalty"
        ? `-${otherMagnitude}`
        : `+${otherMagnitude}`

  return (
    <>
      <div className="flex flex-col gap-(--umc-spacing-gap-12)">
        <AwardFieldLabel>구분</AwardFieldLabel>
        <div className="flex flex-col gap-(--umc-spacing-gap-16)">
          <div className="flex items-center gap-(--umc-spacing-gap-8)">
            <Checkbox
              checked={otherKind === "reward"}
              color={otherKind === "reward" ? "brand" : "neutral"}
              disabled={submitting}
              labelPlacement="end"
              onCheckedChange={(checked) => {
                onSelectKind("reward", checked)
              }}
              size="lg"
            >
              상점
            </Checkbox>
            <span className="text-body-3-regular text-neutral-medium-600">
              점수가 더해져요
            </span>
          </div>
          <div className="flex items-center gap-(--umc-spacing-gap-8)">
            <Checkbox
              checked={otherKind === "penalty"}
              color={otherKind === "penalty" ? "brand" : "neutral"}
              disabled={submitting}
              labelPlacement="end"
              onCheckedChange={(checked) => {
                onSelectKind("penalty", checked)
              }}
              size="lg"
            >
              벌점
            </Checkbox>
            <span className="text-body-3-regular text-neutral-medium-600">
              점수가 깎여요
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-12)">
        <AwardFieldLabel>점수</AwardFieldLabel>
        <div className="flex flex-col gap-(--umc-spacing-gap-8)">
          <div className="flex items-center gap-(--umc-spacing-gap-8)">
            <button
              aria-label="점수 감소"
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-(--umc-radius-8) border bg-white",
                scoreStepperEnabled && otherMagnitude !== null
                  ? "border-neutral-weak-200 text-neutral-strong-800"
                  : "border-neutral-disabled text-neutral-weak-500",
              )}
              disabled={!scoreStepperEnabled || otherMagnitude === null}
              onClick={onDecrement}
              type="button"
            >
              <SubtractionIcon aria-hidden size={24} weight="fill" />
            </button>
            <div className="bg-fill-neutral-weak-75 flex h-11 min-w-0 flex-1 items-center justify-center rounded-(--umc-radius-12) p-1">
              <span
                className={cn(
                  "text-heading-2-semibold w-full truncate text-center",
                  otherMagnitude === null || otherKind === null
                    ? "text-neutral-weak-500"
                    : otherKind === "penalty"
                      ? "text-error"
                      : "text-brand-default-600",
                )}
              >
                {scoreDisplay}
              </span>
            </div>
            <button
              aria-label="점수 증가"
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-(--umc-radius-8) border bg-white",
                scoreStepperEnabled
                  ? "border-neutral-weak-200 text-neutral-strong-800"
                  : "border-neutral-disabled text-neutral-weak-500",
              )}
              disabled={!scoreStepperEnabled}
              onClick={onIncrement}
              type="button"
            >
              <AddIcon aria-hidden size={24} weight="fill" />
            </button>
          </div>
          {otherKind !== null && otherMagnitude !== null ? (
            <p className="text-body-3-regular text-neutral-weak-500 flex h-6 items-center">
              {formatOtherScoreCaption(otherKind, otherMagnitude)}
            </p>
          ) : null}
        </div>
      </div>
    </>
  )
}
