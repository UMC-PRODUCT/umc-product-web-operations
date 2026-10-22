import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import type { NoticeImageLoadState } from "../model/notice-detail.types"

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

  const clearImageLoadSearch = () => {
    void navigate({
      to: "/notices/$noticeId",
      params: { noticeId },
      search: {},
      replace: true,
    })
  }

  const startLoadImages = () => {
    void navigate({
      to: "/notices/$noticeId",
      params: { noticeId },
      search: { imageLoadState: "loading" },
      replace: true,
    })
  }

  useEffect(() => {
    if (imageLoadState !== "loading" || imageLoadPause) {
      return
    }

    const timer = window.setTimeout(() => {
      void navigate({
        to: "/notices/$noticeId",
        params: { noticeId },
        search: { imageLoadState: "success" },
        replace: true,
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
        to: "/notices/$noticeId",
        params: { noticeId },
        search: {},
        replace: true,
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
