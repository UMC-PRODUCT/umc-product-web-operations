import { isAxiosError } from "axios"

type ServerErrorBody = {
  success?: boolean
  code?: string
  message?: string
}

function getErrorBody(error: unknown): ServerErrorBody | undefined {
  if (!isAxiosError(error)) {
    return undefined
  }
  const body = error.response?.data as ServerErrorBody | undefined
  if (!body || typeof body !== "object") {
    return undefined
  }
  return body
}

export function getServerErrorMessage(error: unknown): string | undefined {
  const message = getErrorBody(error)?.message
  return message && message.trim() !== "" ? message : undefined
}

export function getServerErrorCode(error: unknown): string | undefined {
  const code = getErrorBody(error)?.code
  return code && code.trim() !== "" ? code : undefined
}
