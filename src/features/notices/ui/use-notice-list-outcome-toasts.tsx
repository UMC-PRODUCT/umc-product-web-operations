import { useNavigate } from "@tanstack/react-router"
import { useToast } from "@umc-product/react"
import { useEffect } from "react"

import {
  consumeDeleteSuccessToast,
  consumeImageRegisterSuccessToast,
  consumePublishSuccessToast,
  NOTICE_DELETE_TOAST_MESSAGE,
  NOTICE_IMAGE_REGISTER_TOAST_MESSAGE,
  NOTICE_PUBLISH_TOAST_MESSAGE,
  resetDeleteSuccessToastConsumption,
  resetImageRegisterSuccessToastConsumption,
  resetPublishSuccessToastConsumption,
} from "../model/notice-outcomes"
import { showNoticePrimarySuccessToast } from "./show-notice-primary-success-toast"

import type {
  NoticeDeleteOutcome,
  NoticeImageRegisterOutcome,
  NoticePublishOutcome,
} from "../model/notice-outcomes"

type UseNoticeListOutcomeToastsOptions = {
  deleteOutcome?: NoticeDeleteOutcome
  /** TODO: API 연동 시 제거. 이미지 등록 성공 Toast 시뮬레이션용 */
  imageRegisterOutcome?: NoticeImageRegisterOutcome
  publishOutcome?: NoticePublishOutcome
}

export function useNoticeListOutcomeToasts({
  deleteOutcome,
  imageRegisterOutcome,
  publishOutcome,
}: UseNoticeListOutcomeToastsOptions) {
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (publishOutcome !== "success") {
      resetPublishSuccessToastConsumption()
      return
    }

    const clearOutcomeSearch = () => {
      void navigate({
        to: "/notices",
        search: {},
        replace: true,
      })
    }

    if (!consumePublishSuccessToast()) {
      clearOutcomeSearch()
      return
    }

    showNoticePrimarySuccessToast(toast, NOTICE_PUBLISH_TOAST_MESSAGE)

    clearOutcomeSearch()
  }, [navigate, publishOutcome, toast])

  useEffect(() => {
    if (deleteOutcome !== "success") {
      resetDeleteSuccessToastConsumption()
      return
    }

    const clearOutcomeSearch = () => {
      void navigate({
        to: "/notices",
        search: {},
        replace: true,
      })
    }

    if (!consumeDeleteSuccessToast()) {
      clearOutcomeSearch()
      return
    }

    showNoticePrimarySuccessToast(toast, NOTICE_DELETE_TOAST_MESSAGE)

    clearOutcomeSearch()
  }, [deleteOutcome, navigate, toast])

  useEffect(() => {
    if (imageRegisterOutcome !== "success") {
      resetImageRegisterSuccessToastConsumption()
      return
    }

    const clearOutcomeSearch = () => {
      void navigate({
        to: "/notices",
        search: {},
        replace: true,
      })
    }

    if (!consumeImageRegisterSuccessToast()) {
      clearOutcomeSearch()
      return
    }

    showNoticePrimarySuccessToast(toast, NOTICE_IMAGE_REGISTER_TOAST_MESSAGE)

    clearOutcomeSearch()
  }, [imageRegisterOutcome, navigate, toast])
}
