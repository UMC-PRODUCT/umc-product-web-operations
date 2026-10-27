import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import type { NoticeImageLoadState } from "../model/notice-detail.types"

const noticeDetailRouteApi = getRouteApi("/_admin/notices/$noticeId")

const LOADING_MOCK_MS = 1500
const SUCCESS_AUTO_DISMISS_MS = 3000

type UseNoticeDetailImageLoadFlowOptions = {
  imageLoadPause?: boolean
  imageLoadState?: NoticeImageLoadState
  noticeId: string
}

export function useNoticeDetailImageLoadFlow({
  imageLoadPause = false,
  imageLoadState,
  noticeId,
}: UseNoticeDetailImageLoadFlowOptions) {
  const navigate = useNavigate()
  const { listAudience } = noticeDetailRouteApi.useSearch()

  const baseDetailSearch = (extra: Record<string, unknown> = {}) => ({
    ...(listAudience ? { listAudience } : {}),
    ...extra,
  })

  const startLoadImages = () => {
    void navigate({
      params: { noticeId },
      replace: true,
      search: baseDetailSearch({ imageLoadState: "loading" }),
      to: "/notices/$noticeId",
    })
  }

  const clearImageLoadSearch = () => {
    void navigate({
      params: { noticeId },
      replace: true,
      search: baseDetailSearch(),
      to: "/notices/$noticeId",
    })
  }

  useEffect(() => {
    if (imageLoadState !== "loading" || imageLoadPause) {
      return
    }

    const timer = window.setTimeout(() => {
      void navigate({
        params: { noticeId },
        replace: true,
        search: baseDetailSearch({ imageLoadState: "success" }),
        to: "/notices/$noticeId",
      })
    }, LOADING_MOCK_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [imageLoadPause, imageLoadState, navigate, noticeId])

  useEffect(() => {
    if (imageLoadState !== "success") {
      return
    }

    const timer = window.setTimeout(() => {
      void navigate({
        params: { noticeId },
        replace: true,
        search: baseDetailSearch(),
        to: "/notices/$noticeId",
      })
    }, SUCCESS_AUTO_DISMISS_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [imageLoadState, noticeId, navigate])

  return {
    clearImageLoadSearch,
    startLoadImages,
  }
}
