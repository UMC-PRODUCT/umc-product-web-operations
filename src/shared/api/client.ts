import { isAxiosError } from "axios"

import { getSsoClient } from "@/shared/auth/sso-client"

import { createApiClient } from "./create-api-client"

import type { InternalAxiosRequestConfig } from "axios"

const RENEW_PATH = "/v1/auth/token/renew"

export const api = createApiClient(getSsoClient().config.apiBaseUrl || "/api")

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    config.headers.delete("Authorization")
    return config
  }
  const token = getSsoClient().getAccessToken()
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
    if (!config || skipsRenew(config) || config._retry) {
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

function skipsRenew(config: InternalAxiosRequestConfig) {
  const url = requestUrl(config)
  return (
    url.includes(RENEW_PATH) ||
    url.includes("/v1/auth/sso/") ||
    url.includes("/v1/auth/logout")
  )
}

/** @deprecated `api`를 사용한다 */
export const apiClient = api
