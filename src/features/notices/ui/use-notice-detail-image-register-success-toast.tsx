import { useToast } from "@umc-product/react"
import { useEffect } from "react"

import {
  consumeImageRegisterSuccessToast,
  NOTICE_IMAGE_REGISTER_TOAST_MESSAGE,
  resetImageRegisterSuccessToastConsumption,
} from "../model/notice-outcomes"
import { showNoticePrimarySuccessToast } from "./show-notice-primary-success-toast"

type UseNoticeDetailImageRegisterSuccessToastOptions = {
  imageLoadState?: "pending" | "loading" | "success"
}

/** Figma 525:7984 — 목록 `공지를 등록했어요`와 동일 DS Toast (viewport bottom) */
export function useNoticeDetailImageRegisterSuccessToast({
  imageLoadState,
}: UseNoticeDetailImageRegisterSuccessToastOptions) {
  const toast = useToast()

  useEffect(() => {
    if (imageLoadState !== "success") {
      resetImageRegisterSuccessToastConsumption()
      return
    }

    if (!consumeImageRegisterSuccessToast()) {
      return
    }

    showNoticePrimarySuccessToast(toast, NOTICE_IMAGE_REGISTER_TOAST_MESSAGE)
  }, [imageLoadState, toast])
}
