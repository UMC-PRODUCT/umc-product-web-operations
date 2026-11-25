import { getWithdrawalPartLabel } from "./member-part-label"

import type { WithdrawalMember } from "./types"

export function formatWithdrawalGenerationLabel(
  generationNumber: number,
): string {
  return `${generationNumber}기`
}

/** 멤버 표시명: `닉네임 / 이름` */
export function formatWithdrawalMemberDisplayName(
  member: Pick<WithdrawalMember, "name" | "nickname">,
): string {
  return `${member.nickname} / ${member.name}`
}

/** 검색 행: `지부 · 학교 · 파트` */
export function formatWithdrawalMemberOrgMeta(
  member: WithdrawalMember,
): string {
  const partLabel = member.partLabel ?? getWithdrawalPartLabel(member.part)
  return [member.chapterLabel, member.schoolLabel, partLabel]
    .filter(Boolean)
    .join(" · ")
}

/** 선택 바: `기수 · 학교 · 파트` */
export function formatWithdrawalMemberSelectedBarMeta(
  member: WithdrawalMember,
): string {
  const partLabel = member.partLabel ?? getWithdrawalPartLabel(member.part)
  const generationLabel = formatWithdrawalGenerationLabel(
    member.generationNumber,
  )
  return [generationLabel, member.schoolLabel, partLabel]
    .filter(Boolean)
    .join(" · ")
}
