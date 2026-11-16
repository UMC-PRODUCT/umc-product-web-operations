import { getPartLabel } from "../../model/member-labels"
import { AwardInfoRow } from "./AwardInfoRow"

import type { PointsMember } from "../../model/types"

type AwardTargetRowProps = {
  member: PointsMember
}

export function AwardTargetRow({ member }: AwardTargetRowProps) {
  const memberMetaParts = [
    `${member.name} / ${member.nickname}`,
    member.schoolLabel,
    getPartLabel(member.part),
  ]

  return (
    <AwardInfoRow label="대상">
      <p className="text-body-1-medium text-teal-grey-800 flex min-w-0 flex-1 items-center gap-(--umc-spacing-gap-12) overflow-hidden">
        {memberMetaParts.map((part, index) => (
          <span
            className="flex shrink-0 items-center gap-(--umc-spacing-gap-12)"
            key={part}
          >
            {index > 0 ? (
              <span
                aria-hidden
                className="text-body-3-regular text-teal-grey-400"
              >
                |
              </span>
            ) : null}
            <span className="whitespace-nowrap">{part}</span>
          </span>
        ))}
      </p>
    </AwardInfoRow>
  )
}
