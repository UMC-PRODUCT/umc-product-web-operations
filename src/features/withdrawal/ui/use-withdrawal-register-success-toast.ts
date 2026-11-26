import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useToast } from "@umc-product/react"
import { useEffect, useRef } from "react"

import { showPrimarySuccessToast } from "@/shared/ui/show-primary-success-toast"

import {
  buildWithdrawalLocationState,
  parseWithdrawalLocationState,
} from "../model/withdrawal-location-state"

/** 등록 화면 → 목록 이동 후 history state로 전달된 성공 토스트를 1회 표시 */
export function useWithdrawalRegisterSuccessToast() {
  const toast = useToast()
  const navigate = useNavigate()
  const locationState = useRouterState({
    select: (state) => parseWithdrawalLocationState(state.location.state),
  })
  const registerSuccessToast = locationState.registerSuccessToast
  const listSearch = locationState.withdrawalListSearch
  const consumedRef = useRef<string | null>(null)

  useEffect(() => {
    if (registerSuccessToast == null) {
      return
    }
    if (consumedRef.current === registerSuccessToast) {
      return
    }
    consumedRef.current = registerSuccessToast
    showPrimarySuccessToast(toast, registerSuccessToast)
    void navigate({
      replace: true,
      search: (previous) => ({ mock: previous.mock }),
      state: buildWithdrawalLocationState(
        listSearch == null ? {} : { withdrawalListSearch: listSearch },
      ),
      to: "/activity/withdrawal",
    })
  }, [listSearch, navigate, registerSuccessToast, toast])
}
