const REFRESH_TOKEN_KEY = "umc.operation.refreshToken"

let accessToken: string | null = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

export function getRefreshToken() {
  if (typeof sessionStorage === "undefined") {
    return null
  }
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string | null) {
  if (typeof sessionStorage === "undefined") {
    return
  }
  if (token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
    return
  }
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearAuthSession() {
  clearAccessToken()
  setRefreshToken(null)
}
