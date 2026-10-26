import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

import { deleteNotice, deleteNoticeVote } from "./notices-command.api"

describe("deleteNotice", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls DELETE /v1/notices/:id", async () => {
    let method: string | undefined
    let url: string | undefined

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await deleteNotice(42)

    expect(method).toBe("delete")
    expect(url).toBe("/v1/notices/42")
  })
})

describe("deleteNoticeVote", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls DELETE /v1/notices/:id/vote", async () => {
    let method: string | undefined
    let url: string | undefined

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await deleteNoticeVote(7)

    expect(method).toBe("delete")
    expect(url).toBe("/v1/notices/7/vote")
  })
})
