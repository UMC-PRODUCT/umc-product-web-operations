import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect } from "react"

import { buildNoticeLocationState } from "../model/notice-location-state"
import { useNoticeLocationStateFromLocation } from "./use-notice-location-state"

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
  const locationState = useNoticeLocationStateFromLocation()

  const detailState = useCallback(
    () =>
      buildNoticeLocationState({
        listAudience: locationState.listAudience,
        listPage: locationState.listPage,
      }),
    [locationState.listAudience, locationState.listPage],
  )

  const baseDetailSearch = useCallback(
    (extra: Record<string, unknown> = {}) => ({
      ...extra,
    }),
    [],
  )

  const startLoadImages = () => {
    void navigate({
      params: { noticeId },
      replace: true,
      search: baseDetailSearch({ imageLoadState: "loading" }),
      state: detailState(),
      to: "/notices/$noticeId",
    })
  }

  const clearImageLoadSearch = () => {
    void navigate({
      params: { noticeId },
      replace: true,
      search: baseDetailSearch(),
      state: detailState(),
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
        state: detailState(),
        to: "/notices/$noticeId",
      })
    }, LOADING_MOCK_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    baseDetailSearch,
    detailState,
    imageLoadPause,
    imageLoadState,
    navigate,
    noticeId,
  ])

  useEffect(() => {
    if (imageLoadState !== "success") {
      return
    }

    const timer = window.setTimeout(() => {
      void navigate({
        params: { noticeId },
        replace: true,
        search: baseDetailSearch(),
        state: detailState(),
        to: "/notices/$noticeId",
      })
    }, SUCCESS_AUTO_DISMISS_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [baseDetailSearch, detailState, imageLoadState, noticeId, navigate])

  return {
    clearImageLoadSearch,
    startLoadImages,
  }
}
