import { formatWithdrawalGenerationLabel } from "./format-withdrawal-member-meta"
import { getWithdrawalPartLabel } from "./member-part-label"

import type { WithdrawalMember } from "./types"
import type { WithdrawalRegisterProfileMember } from "./withdrawal-profile-member"

/** API 연동 전 — 탈부 목록 목 데이터를 프로필 카드용 멤버로 변환 */
export function mapWithdrawalMemberToProfileMember(
  member: WithdrawalMember,
): WithdrawalRegisterProfileMember {
  return {
    id: member.id,
    name: member.name,
    nickname: member.nickname,
    schoolLabel: member.schoolLabel,
    part: member.part,
    generation: formatWithdrawalGenerationLabel(member.generationNumber),
    generationNumber: member.generationNumber,
    roleLabel: "챌린저",
    status: "active",
    regionLabel: member.chapterLabel,
    partLabel: getWithdrawalPartLabel(member.part),
  }
}
