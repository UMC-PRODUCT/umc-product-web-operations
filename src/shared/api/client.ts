import { isAxiosError } from "axios"

import { isAuthEndpoint } from "@/lib/auth-client"
import { getSsoClient } from "@/shared/auth/sso-client"

import { createApiClient, resolveApiBaseURL } from "./create-api-client"

import type { InternalAxiosRequestConfig } from "axios"

// baseURL은 첫 요청 때 정한다. 모듈 로드 시 SSO 설정을 읽으면 등록되지 않은
// origin에서 import만으로 앱 전체가 죽는다.
export const api = createApiClient()

api.interceptors.request.use((config) => {
  const client = getSsoClient()
  config.baseURL ??= resolveApiBaseURL(client.config.apiBaseUrl || "/api")
  if (config.skipAuth) {
    config.headers.delete("Authorization")
    return config
  }
  const token = client.getAccessToken()
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
    if (!config || isAuthEndpoint(requestUrl(config)) || config._retry) {
      return Promise.reject(error)
    }

    config._retry = true
    try {
      const accessToken = await getSsoClient().recoverFromUnauthorized()
      config.headers.set("Authorization", `Bearer ${accessToken}`)
      return api.request(config)
    } catch (renewError) {
      return Promise.reject(renewError)
    }
  },
)

function requestUrl(config: InternalAxiosRequestConfig) {
  const baseURL = config.baseURL ?? ""
  return `${baseURL}${config.url ?? ""}`
}

/** @deprecated `api`를 사용한다 */
export const apiClient = api
