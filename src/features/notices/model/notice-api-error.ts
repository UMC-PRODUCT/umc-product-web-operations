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
