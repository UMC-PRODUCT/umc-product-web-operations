import type { NoticeVoteInfo } from "../api/notice-api.types"
import type { NoticePoll } from "./notice-detail.types"

/** API 투표 상태 → 상세 카드 UI 상태 (마감 시각 경과 포함) */
export function resolveNoticeVoteUiStatus(
  vote: Pick<NoticeVoteInfo, "endsAtExclusive" | "status">,
  now: Date = new Date(),
): NoticePoll["status"] {
  if (vote.status?.toUpperCase() === "CLOSED") {
    return "closed"
  }

  const endMs = Date.parse(vote.endsAtExclusive)
  if (Number.isFinite(endMs) && endMs <= now.getTime()) {
    return "closed"
  }

  return "in_progress"
}
