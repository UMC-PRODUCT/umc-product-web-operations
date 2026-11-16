import { useBlocker } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"

type UseNoticeLeaveConfirmOptions = {
  isDirty: boolean
  /** 확인 후 또는 변경 사항이 없을 때 `requestLeave`로 받은 경로로 이동 */
  navigateTo: (to: string) => void
}

/** 작성·수정 중 이탈 시 확인 Dialog 상태 (라우터 blocker 포함) */
export function useNoticeLeaveConfirm({
  isDirty,
  navigateTo,
}: UseNoticeLeaveConfirmOptions) {
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const allowLeaveRef = useRef(false)
  const pendingLeaveToRef = useRef<string | null>(null)
  const leaveDialogFocusStore = useRef<HTMLElement | null>(null)

  const blocker = useBlocker({
    enableBeforeUnload: isDirty,
    shouldBlockFn: () => {
      if (allowLeaveRef.current) {
        return false
      }
      return isDirty
    },
    withResolver: true,
  })

  useEffect(() => {
    if (blocker.status === "blocked") {
      captureNoticeDialogFocus(leaveDialogFocusStore)
      setLeaveDialogOpen(true)
    }
  }, [blocker.status])

  /** 이후 이동은 확인 없이 허용 (게시·수정 성공, 삭제된 공지 안내 등) */
  const allowLeave = () => {
    allowLeaveRef.current = true
  }

  const dismissLeaveDialog = () => {
    setLeaveDialogOpen(false)
    pendingLeaveToRef.current = null
    if (blocker.status === "blocked") {
      blocker.reset?.()
    }
    restoreNoticeDialogFocus(leaveDialogFocusStore)
  }

  const confirmLeave = () => {
    setLeaveDialogOpen(false)
    leaveDialogFocusStore.current = null
    allowLeaveRef.current = true
    const pendingTo = pendingLeaveToRef.current
    pendingLeaveToRef.current = null

    if (pendingTo != null) {
      navigateTo(pendingTo)
      return
    }

    blocker.proceed?.()
  }

  const requestLeave = (to: string) => {
    if (allowLeaveRef.current || !isDirty) {
      navigateTo(to)
      return
    }
    captureNoticeDialogFocus(leaveDialogFocusStore)
    pendingLeaveToRef.current = to
    setLeaveDialogOpen(true)
  }

  return {
    allowLeave,
    confirmLeave,
    dismissLeaveDialog,
    leaveDialogOpen,
    requestLeave,
  }
}
