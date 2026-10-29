/** Dialog를 trigger 없이 열 때, 닫힌 뒤 포커스를 연 버튼/링크로 되돌립니다. */
export type NoticeDialogFocusStore = {
  current: HTMLElement | null
}

export function captureNoticeDialogFocus(store: NoticeDialogFocusStore) {
  const active = document.activeElement
  store.current = active instanceof HTMLElement ? active : null
}

export function restoreNoticeDialogFocus(store: NoticeDialogFocusStore) {
  const element = store.current
  store.current = null
  if (element?.isConnected) {
    element.focus()
  }
}
