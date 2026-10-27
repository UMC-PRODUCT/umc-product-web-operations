import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type {
  CursorResponseGetNoticeReadStatusResponse,
  GetNoticeDetailResponse,
  GetNoticeReadStatusParams,
  GetNoticeStaticsResponse,
  ListNoticesParams,
  PageResponseGetNoticeSummaryResponse,
  SearchNoticesParams,
} from "./notice-api.types"

function appendQueryParam(
  search: URLSearchParams,
  key: string,
  value: string | number | undefined | null,
) {
  if (value === undefined || value === null || value === "") {
    return
  }
  search.append(key, String(value))
}

function appendQueryList(
  search: URLSearchParams,
  key: string,
  values: string[] | number[] | undefined,
) {
  if (!values?.length) {
    return
  }
  for (const value of values) {
    search.append(key, String(value))
  }
}

function serializeListNoticesParams(
  params: ListNoticesParams | SearchNoticesParams,
) {
  const search = new URLSearchParams()
  appendQueryParam(search, "gisuId", params.gisuId)
  appendQueryParam(search, "noticeTab", params.noticeTab)
  appendQueryParam(search, "chapterId", params.chapterId)
  appendQueryParam(search, "schoolId", params.schoolId)
  appendQueryParam(search, "part", params.part)
  appendQueryParam(search, "page", params.page ?? 0)
  appendQueryParam(search, "size", params.size ?? 20)
  appendQueryList(search, "sort", params.sort ?? ["createdAt,DESC"])

  if ("keyword" in params) {
    appendQueryParam(search, "keyword", params.keyword)
  }

  return search.toString()
}

function serializeReadStatusParams(params: GetNoticeReadStatusParams) {
  const search = new URLSearchParams()
  appendQueryParam(search, "status", params.status)
  appendQueryParam(search, "filterType", params.filterType)
  appendQueryParam(search, "cursorId", params.cursorId ?? undefined)
  appendQueryList(search, "organizationIds", params.organizationIds)

  return search.toString()
}

export async function listNotices(params: ListNoticesParams) {
  const query = serializeListNoticesParams(params)
  const { data } = await api.get<unknown>(`/v1/notices?${query}`)
  return unwrapApiResult<PageResponseGetNoticeSummaryResponse>(data)
}

export async function searchNotices(params: SearchNoticesParams) {
  const query = serializeListNoticesParams(params)
  const { data } = await api.get<unknown>(`/v1/notices/search?${query}`)
  return unwrapApiResult<PageResponseGetNoticeSummaryResponse>(data)
}

export async function getNoticeDetail(noticeId: number) {
  const { data } = await api.get<unknown>(`/v1/notices/${noticeId}`)
  return unwrapApiResult<GetNoticeDetailResponse>(data)
}

export async function getNoticeReadStatics(noticeId: number) {
  const { data } = await api.get<unknown>(
    `/v1/notices/${noticeId}/read-statics`,
  )
  return unwrapApiResult<GetNoticeStaticsResponse>(data)
}

export async function getNoticeReadStatus(params: GetNoticeReadStatusParams) {
  const query = serializeReadStatusParams(params)
  const { data } = await api.get<unknown>(
    `/v1/notices/${params.noticeId}/read-status?${query}`,
  )
  return unwrapApiResult<CursorResponseGetNoticeReadStatusResponse>(data)
}
