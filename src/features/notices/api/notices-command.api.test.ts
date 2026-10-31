import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it } from "vitest"

import { api } from "@/shared/api/client"

function parseRequestBody(data: unknown): unknown {
  if (typeof data === "string") {
    return JSON.parse(data) as unknown
  }
  return data
}

import {
  addNoticeImages,
  addNoticeVote,
  deleteNotice,
  deleteNoticeVote,
  patchNotice,
  postNotice,
  replaceNoticeImages,
  replaceNoticeLinks,
} from "./notices-command.api"

describe("patchNotice", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls PATCH /v1/notices/:id with NOTICE-203 body", async () => {
    let method: string | undefined
    let url: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      body = parseRequestBody(config.data)
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await patchNotice(42, {
      title: "제목",
      content: "본문",
      mustRead: true,
    })

    expect(method).toBe("patch")
    expect(url).toBe("/v1/notices/42")
    expect(body).toEqual({
      title: "제목",
      content: "본문",
      mustRead: true,
    })
  })
})

describe("postNotice", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls POST /v1/notices with NOTICE-201 body", async () => {
    let method: string | undefined
    let url: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      body = config.data
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: { noticeId: 99 },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    const noticeId = await postNotice({
      title: "t",
      content: "c",
      shouldNotify: false,
      targetInfo: {
        targetNoticeTab: "CHALLENGER",
        targetGisuId: 1,
        targetParts: ["WEB"],
      },
    })

    expect(noticeId).toBe(99)
    expect(method).toBe("post")
    expect(url).toBe("/v1/notices")
    expect(parseRequestBody(body)).toMatchObject({
      title: "t",
      shouldNotify: false,
      targetInfo: { targetNoticeTab: "CHALLENGER" },
    })
  })

  it("accepts notice id field from create response", async () => {
    api.defaults.adapter = async (config) => {
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: { id: "42" },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    const noticeId = await postNotice({
      title: "t",
      content: "c",
      shouldNotify: false,
      targetInfo: {
        targetNoticeTab: "CHALLENGER",
        targetGisuId: 1,
        targetParts: [],
      },
    })

    expect(noticeId).toBe(42)
  })
})

describe("replaceNoticeLinks", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls PATCH /v1/notices/:id/links", async () => {
    let method: string | undefined
    let url: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      body = config.data
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await replaceNoticeLinks(5, ["https://example.com"])

    expect(method).toBe("patch")
    expect(url).toBe("/v1/notices/5/links")
    expect(parseRequestBody(body)).toEqual({
      links: ["https://example.com"],
    })
  })

  it("sends empty links array to clear all links", async () => {
    let body: unknown

    api.defaults.adapter = async (config) => {
      body = config.data
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await replaceNoticeLinks(5, [])

    expect(parseRequestBody(body)).toEqual({ links: [] })
  })
})

describe("replaceNoticeImages", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls PATCH /v1/notices/:id/images", async () => {
    let method: string | undefined
    let url: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      body = config.data
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await replaceNoticeImages(5, ["file-a", "file-b"])

    expect(method).toBe("patch")
    expect(url).toBe("/v1/notices/5/images")
    expect(parseRequestBody(body)).toEqual({
      imageIds: ["file-a", "file-b"],
    })
  })

  it("sends empty imageIds array to clear all images", async () => {
    let body: unknown

    api.defaults.adapter = async (config) => {
      body = config.data
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await replaceNoticeImages(5, [])

    expect(parseRequestBody(body)).toEqual({ imageIds: [] })
  })
})

describe("addNoticeImages", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls POST /v1/notices/:id/images", async () => {
    let method: string | undefined
    let url: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      body = config.data
      return {
        data: { success: true, code: "OK", message: "성공", result: null },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    await addNoticeImages(5, ["file-a", "file-b"])

    expect(method).toBe("post")
    expect(url).toBe("/v1/notices/5/images")
    expect(parseRequestBody(body)).toEqual({
      imageIds: ["file-a", "file-b"],
    })
  })
})

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

describe("addNoticeVote", () => {
  afterEach(() => {
    api.defaults.adapter = undefined
  })

  it("calls POST /v1/notices/:id/votes", async () => {
    let method: string | undefined
    let url: string | undefined
    let body: unknown

    api.defaults.adapter = async (config) => {
      method = config.method
      url = config.url
      body = config.data
      return {
        data: {
          success: true,
          code: "OK",
          message: "성공",
          result: { noticeVoteId: 2, voteId: 3 },
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    const result = await addNoticeVote(5, {
      allowMultipleChoice: false,
      endsAtExclusive: "2026-12-01T00:00:00.000Z",
      isAnonymous: true,
      options: ["A", "B"],
      startsAt: "2026-11-01T00:00:00.000Z",
      title: "투표",
    })

    expect(method).toBe("post")
    expect(url).toBe("/v1/notices/5/votes")
    expect(parseRequestBody(body)).toEqual({
      allowMultipleChoice: false,
      endsAtExclusive: "2026-12-01T00:00:00.000Z",
      isAnonymous: true,
      options: ["A", "B"],
      startsAt: "2026-11-01T00:00:00.000Z",
      title: "투표",
    })
    expect(result).toEqual({ noticeVoteId: 2, voteId: 3 })
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
