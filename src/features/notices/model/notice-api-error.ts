import { isAxiosError } from "axios"

export function getHttpStatus(error: unknown): number | undefined {
  if (!isAxiosError(error)) {
    return undefined
  }
  return error.response?.status
}

export function isNoticeForbiddenError(error: unknown): boolean {
  return getHttpStatus(error) === 403
}

export function isNoticeNotFoundError(error: unknown): boolean {
  return getHttpStatus(error) === 404
}

export function isNoticeNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response
  }
  return false
}

export function getNoticeApiErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) {
    return null
  }
  const data = error.response?.data
  if (data === null || typeof data !== "object") {
    return null
  }

  const result = "result" in data ? (data as { result: unknown }).result : null
  if (typeof result === "string" && result.trim()) {
    return result.trim()
  }

  if (!("message" in data)) {
    return null
  }
  const message = (data as { message: unknown }).message
  return typeof message === "string" && message.trim() ? message.trim() : null
}
