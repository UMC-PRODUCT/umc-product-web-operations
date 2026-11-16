import { isAxiosError } from "axios"

export function getHttpStatus(error: unknown): number | undefined {
  if (!isAxiosError(error)) {
    return undefined
  }
  return error.response?.status
}

export function isForbiddenError(error: unknown): boolean {
  return getHttpStatus(error) === 403
}

export function isNotFoundError(error: unknown): boolean {
  return getHttpStatus(error) === 404
}

export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response
  }
  return false
}
