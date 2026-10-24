import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { describe, expect, it } from "vitest"

import { getServerErrorMessage } from "./server-error"

function axiosError(data: unknown) {
  return new AxiosError(
    "요청에 실패했습니다.",
    AxiosError.ERR_BAD_REQUEST,
    {} as InternalAxiosRequestConfig,
    undefined,
    {
      data,
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    },
  )
}

describe("getServerErrorMessage", () => {
  it("returns the server message", () => {
    const error = axiosError({
      success: false,
      code: "MEMBER-0001",
      message: "조회할 권한이 없어요",
    })

    expect(getServerErrorMessage(error)).toBe("조회할 권한이 없어요")
  })

  it("returns undefined when the error has no server message", () => {
    expect(getServerErrorMessage(new Error("network"))).toBeUndefined()
    expect(getServerErrorMessage(axiosError({ message: "  " }))).toBeUndefined()
  })
})
