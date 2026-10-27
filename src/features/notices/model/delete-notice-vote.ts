import { deleteNoticeVote as deleteNoticeVoteApi } from "../api/notices-command.api"

export async function deleteNoticeVoteByNoticeId(
  noticeId: number,
): Promise<void> {
  await deleteNoticeVoteApi(noticeId)
}
