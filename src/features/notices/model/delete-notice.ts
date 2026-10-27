import { deleteNotice as deleteNoticeApi } from "../api/notices-command.api"

export async function deleteNoticeById(noticeId: number): Promise<void> {
  await deleteNoticeApi(noticeId)
}
