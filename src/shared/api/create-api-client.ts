import axios, { AxiosError } from "axios"

import type { AxiosInstance } from "axios"

const DEFAULT_TIMEOUT_MS = 15_000

/** 스펙 경로는 `/api/v1/...`이다. base가 오리진만 있으면 `/api`를 붙이고, 이미 `/api`면 유지한다. */
export function resolveApiBaseURL(
  baseURL: string = import.meta.env.VITE_API_BASE_URL || "/api",
) {
  const trimmed = baseURL.replace(/\/+$/, "")
  if (trimmed.endsWith("/api")) {
    return trimmed
  }
  return `${trimmed}/api`
}

export function createApiClient(
  baseURL = import.meta.env.VITE_API_BASE_URL || "/api",
): AxiosInstance {
  const client = axios.create({
    baseURL: resolveApiBaseURL(baseURL),
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
    },
  })

  client.interceptors.response.use((response) => {
    const body = response.data as { success?: boolean; message?: string }
    if (body && typeof body === "object" && body.success === false) {
      return Promise.reject(
        new AxiosError(
          body.message ?? "요청에 실패했습니다.",
          AxiosError.ERR_BAD_RESPONSE,
          response.config,
          response.request,
          response,
        ),
      )
    }
    return response
  })

  return client
}
