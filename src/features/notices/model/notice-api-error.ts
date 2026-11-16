import { isAxiosError } from "axios"

import {
  getHttpStatus,
  isForbiddenError,
  isNetworkError,
  isNotFoundError,
} from "@/shared/lib/http-status"

export { getHttpStatus }

export function isNoticeForbiddenError(error: unknown): boolean {
  return isForbiddenError(error)
}

export function isNoticeNotFoundError(error: unknown): boolean {
  return isNotFoundError(error)
}

export function isNoticeNetworkError(error: unknown): boolean {
  return isNetworkError(error)
}

export function getNoticeApiErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) {
    return null
  }
  const data: unknown = error.response?.data
  if (data === null || typeof data !== "object") {
    return null
  }

  const result = "result" in data ? data.result : null
  if (typeof result === "string" && result.trim()) {
    return result.trim()
  }

  if (!("message" in data)) {
    return null
  }
  const message = data.message
  return typeof message === "string" && message.trim() ? message.trim() : null
}
