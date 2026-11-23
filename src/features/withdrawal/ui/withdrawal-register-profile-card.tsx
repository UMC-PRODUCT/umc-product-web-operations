import { PersonIcon } from "@umc-product/icons"
import { StatusTag } from "@umc-product/react"

import { getWithdrawalPartLabel } from "../model/member-part-label"
import {
  withdrawalRegisterMemberStatusLabel,
  withdrawalRegisterMemberStatusTagColor,
  type WithdrawalRegisterProfileMember,
} from "../model/withdrawal-profile-member"

type WithdrawalRegisterProfileCardProps = {
  member: WithdrawalRegisterProfileMember
}

export function WithdrawalRegisterProfileCard({
  member,
}: WithdrawalRegisterProfileCardProps) {
  const meta = [
    member.schoolLabel,
    member.regionLabel,
    member.partLabel ?? getWithdrawalPartLabel(member.part),
    member.generation,
  ].filter((item): item is string => Boolean(item && item.trim()))

  return (
    <section className="border-neutral-disabled flex w-[842px] max-w-full flex-col gap-(--umc-spacing-gap-20) overflow-hidden rounded-(--umc-radius-12) border bg-white px-(--umc-spacing-padding-32) py-(--umc-spacing-padding-20)">
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
              <h2 className="text-title-2-semibold text-neutral-default-900 truncate">
                {member.name} / {member.nickname}
              </h2>
              <StatusTag
                color={withdrawalRegisterMemberStatusTagColor(member.status)}
              >
                {withdrawalRegisterMemberStatusLabel(member.status)}
              </StatusTag>
            </div>
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
      </div>
    </section>
  )
}
