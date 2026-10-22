import { useNavigate } from "@tanstack/react-router"
import { CheckCircleIcon } from "@umc-product/icons"
import { useToast } from "@umc-product/react"
import { useEffect } from "react"

import {
  consumeDeleteSuccessToast,
  consumePublishSuccessToast,
  NOTICE_DELETE_TOAST_MESSAGE,
  NOTICE_PUBLISH_TOAST_MESSAGE,
  resetDeleteSuccessToastConsumption,
  resetPublishSuccessToastConsumption,
} from "../model/notice-outcomes"

import type {
  NoticeDeleteOutcome,
  NoticePublishOutcome,
} from "../model/notice-outcomes"

type UseNoticeListOutcomeToastsOptions = {
  deleteOutcome?: NoticeDeleteOutcome
  publishOutcome?: NoticePublishOutcome
}

export function useNoticeListOutcomeToasts({
  deleteOutcome,
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

    toast.show({
      message: NOTICE_PUBLISH_TOAST_MESSAGE,
      color: "primary",
      icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
    })

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

    toast.show({
      message: NOTICE_DELETE_TOAST_MESSAGE,
      color: "primary",
      icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
    })

    clearOutcomeSearch()
  }, [deleteOutcome, navigate, toast])
}
