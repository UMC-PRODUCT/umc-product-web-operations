import { isAxiosError } from "axios"

import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./access-token"
import { createApiClient } from "./create-api-client"
import { unwrapApiResult } from "./unwrap-api-result"

import type { InternalAxiosRequestConfig } from "axios"

const RENEW_PATH = "/v1/auth/token/renew"

type RenewedTokens = {
  accessToken: string
  refreshToken: string
}

export const api = createApiClient()

let renewing: Promise<string> | null = null

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    config.headers.delete("Authorization")
    return config
  }
  const token = getAccessToken()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const config = error.config
    if (!config || isLoginRequest(config)) {
      return Promise.reject(error)
    }
    if (isRenewRequest(config) || config._retry) {
      clearAuthSession()
      redirectToLogin()
      return Promise.reject(error)
    }

    config._retry = true
    try {
      const accessToken = await renewAccessToken()
      config.headers.set("Authorization", `Bearer ${accessToken}`)
      return api.request(config)
    } catch (renewError) {
      clearAuthSession()
      redirectToLogin()
      return Promise.reject(renewError)
    }
  },
)

function renewAccessToken() {
  if (!renewing) {
    renewing = requestRenewedAccessToken().finally(() => {
      renewing = null
    })
  }
  return renewing
}

async function requestRenewedAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("refresh token이 없습니다.")
  }

  const { data } = await api.post<unknown>(
    RENEW_PATH,
    { refreshToken },
    { skipAuth: true },
  )
  const tokens = unwrapApiResult<RenewedTokens>(data)
  setAccessToken(tokens.accessToken)
  setRefreshToken(tokens.refreshToken)
  return tokens.accessToken
}

function requestUrl(config: InternalAxiosRequestConfig) {
  const baseURL = config.baseURL ?? ""
  return `${baseURL}${config.url ?? ""}`
}

function isLoginRequest(config: InternalAxiosRequestConfig) {
  return requestUrl(config).includes("/v1/auth/login/")
}

function isRenewRequest(config: InternalAxiosRequestConfig) {
  return requestUrl(config).includes(RENEW_PATH)
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return
  }
  if (window.location.pathname === "/login") {
    return
  }
  window.location.assign("/login")
}

/** @deprecated `api`를 사용한다 */
export const apiClient = api
