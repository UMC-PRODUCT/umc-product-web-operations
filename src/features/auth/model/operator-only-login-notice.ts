const OPERATOR_ONLY_LOGIN_NOTICE_KEY = "umc.backoffice.operatorOnlyLoginNotice"

export function markOperatorOnlyLoginNotice() {
  sessionStorage.setItem(OPERATOR_ONLY_LOGIN_NOTICE_KEY, "1")
}

export function hasOperatorOnlyLoginNotice() {
  return sessionStorage.getItem(OPERATOR_ONLY_LOGIN_NOTICE_KEY) === "1"
}

export function clearOperatorOnlyLoginNotice() {
  sessionStorage.removeItem(OPERATOR_ONLY_LOGIN_NOTICE_KEY)
}
