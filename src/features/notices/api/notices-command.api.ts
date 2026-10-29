import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type {
  AddNoticeImagesRequest,
  CreateNoticeRequest,
  CreateNoticeResponse,
  ReplaceNoticeImagesRequest,
  ReplaceNoticeLinksRequest,
  UpdateNoticeRequest,
} from "./notice-api.types"

/** NOTICE-201 — 공지 등록 */
export async function postNotice(body: CreateNoticeRequest): Promise<number> {
  const { data } = await api.post<unknown>("/v1/notices", body)
  const result = unwrapApiResult<
    CreateNoticeResponse & { id?: number | string }
  >(data)
  const rawId = result.noticeId ?? result.id
  if (rawId == null || String(rawId).trim() === "") {
    throw new Error("공지 등록 응답에 noticeId가 없습니다.")
  }
  const noticeId = Number(rawId)
  if (!Number.isFinite(noticeId) || noticeId <= 0) {
    throw new Error("공지 등록 응답의 noticeId가 올바르지 않습니다.")
  }
  return noticeId
}

/** NOTICE-203 — 공지 수정 */
export async function patchNotice(
  noticeId: number,
  body: UpdateNoticeRequest,
): Promise<void> {
  const { data } = await api.patch<unknown>(`/v1/notices/${noticeId}`, body)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}

/** NOTICE-105 — 공지 링크 전체 교체 */
export async function replaceNoticeLinks(
  noticeId: number,
  links: string[],
): Promise<void> {
  const payload: ReplaceNoticeLinksRequest = { links }
  const { data } = await api.patch<unknown>(
    `/v1/notices/${noticeId}/links`,
    payload,
  )
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}

/** NOTICE-104 — 공지 이미지 전체 교체 */
export async function replaceNoticeImages(
  noticeId: number,
  imageIds: string[],
): Promise<void> {
  const payload: ReplaceNoticeImagesRequest = { imageIds }
  const { data } = await api.patch<unknown>(
    `/v1/notices/${noticeId}/images`,
    payload,
  )
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}

/** NOTICE-101 — 공지 이미지 추가 (생성 직후) */
export async function addNoticeImages(
  noticeId: number,
  imageIds: string[],
): Promise<void> {
  if (imageIds.length === 0) {
    return
  }
  const payload: AddNoticeImagesRequest = { imageIds }
  const { data } = await api.post<unknown>(
    `/v1/notices/${noticeId}/images`,
    payload,
  )
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<unknown>(data)
  }
}

export async function deleteNotice(noticeId: number): Promise<void> {
  const { data } = await api.delete<unknown>(`/v1/notices/${noticeId}`)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}

/** NOTICE-106 — 공지에 연결된 투표 삭제(운영 UI: 투표 종료) */
export async function deleteNoticeVote(noticeId: number): Promise<void> {
  const { data } = await api.delete<unknown>(`/v1/notices/${noticeId}/vote`)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}
