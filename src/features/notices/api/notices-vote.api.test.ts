import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

import {
  submitNoticeVoteResponse,
  updateNoticeVoteResponse,
} from "./notices-vote.api"

describe("notice vote responses", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("POST submit vote response", async () => {
    let method: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      body = config.data
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await submitNoticeVoteResponse(10, { optionIds: [1, 2] })

    expect(method).toBe("post")
    expect(JSON.parse(String(body))).toEqual({ optionIds: [1, 2] })
  })

  it("PUT update vote response", async () => {
    let method: string | undefined

    api.defaults.adapter = async (config) => {
      method = config.method
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await updateNoticeVoteResponse(10, { optionIds: [3] })

    expect(method).toBe("put")
  })
})
