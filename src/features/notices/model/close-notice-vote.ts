import { closeNoticeVote as closeNoticeVoteApi } from "../api/notices-command.api"

export async function closeNoticeVoteByNoticeId(
  noticeId: number,
): Promise<void> {
  await closeNoticeVoteApi(noticeId)
}
