import { Checkbox, Tag } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { formatTypeListScore, getTypeListLabel } from "../../model/point-types"
import { AwardFieldLabel } from "./AwardFieldLabel"

import type { PointAwardTab, PointTypeOption } from "../../model/point-types"

type AwardTypeListProps = {
  tab: Exclude<PointAwardTab, "other">
  options: PointTypeOption[]
  selectedTypeId: string | null
  onSelect: (option: PointTypeOption) => void
}

/** 상점·벌점 탭: 유형 목록 */
export function AwardTypeList({
  tab,
  options,
  selectedTypeId,
  onSelect,
}: AwardTypeListProps) {
  return (
    <div className="flex flex-col gap-(--umc-spacing-gap-12)">
      <AwardFieldLabel>{getTypeListLabel(tab)}</AwardFieldLabel>
      <div className="border-neutral-disabled max-h-[191px] overflow-y-auto rounded-(--umc-radius-12) border">
        {options.map((option, index) => {
          const selected = option.id === selectedTypeId
          const isFirst = index === 0
          const isLast = index === options.length - 1
          return (
            <button
              className={cn(
                "border-neutral-disabled flex h-[39px] w-full items-center justify-between border-b py-(--umc-spacing-padding-8) pr-6 pl-(--umc-spacing-padding-16) text-left last:border-b-0",
                selected ? "bg-fill-neutral-weak-75" : "bg-white",
                isFirst && "rounded-t-(--umc-radius-12)",
                isLast && "rounded-b-(--umc-radius-12)",
              )}
              key={option.id}
              onClick={() => onSelect(option)}
              type="button"
            >
              <span className="flex items-center gap-5">
                <span className="text-label-4-medium w-[120px] text-[#212121]">
                  {option.label}
                </span>
                <Tag
                  color={option.score < 0 ? "error" : "brand"}
                  size="sm"
                  variant="weak"
                >
                  {formatTypeListScore(option.score)}
                </Tag>
              </span>
              <Checkbox
                aria-label={`${option.label} 선택`}
                checked={selected}
                color="brand"
                onCheckedChange={() => onSelect(option)}
                size="md"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
