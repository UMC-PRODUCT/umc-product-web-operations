import { type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { api } from "@/shared/api/client"

import { uploadStorageFile } from "./storage.api"

function parseRequestBody(data: unknown): unknown {
  if (typeof data === "string") {
    return JSON.parse(data) as unknown
  }
  return data
}

describe("uploadStorageFile", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    api.defaults.adapter = undefined
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it("runs STORAGE-001, signed URL upload, and STORAGE-002", async () => {
    const calls: { method?: string; url?: string; body?: unknown }[] = []

    api.defaults.adapter = async (config) => {
      calls.push({
        method: config.method,
        url: config.url,
        body: config.data,
      })
      const isConfirm = config.url?.includes("/confirm")
      return {
        data: isConfirm
          ? { success: true, code: "OK", message: "성공", result: {} }
          : {
              success: true,
              code: "OK",
              message: "성공",
              result: {
                fileId: "file-abc",
                uploadUrl: "https://storage.example/upload",
                uploadMethod: "PUT",
                headers: { "x-amz-acl": "private" },
              },
            },
        status: 200,
        statusText: "OK",
        headers: {},
        config: config satisfies InternalAxiosRequestConfig,
      }
    }

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
    })

    const file = new File(["image-bytes"], "photo.png", { type: "image/png" })
    const fileId = await uploadStorageFile(file, "NOTICE_ATTACHMENT")

    expect(fileId).toBe("file-abc")
    expect(parseRequestBody(calls[0]?.body)).toEqual({
      category: "NOTICE_ATTACHMENT",
      contentType: "image/png",
      fileName: "photo.png",
      fileSize: file.size,
    })
    expect(calls.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: "post", url: "/v1/storage/prepare-upload" },
      { method: "post", url: "/v1/storage/file-abc/confirm" },
    ])
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.example/upload",
      expect.objectContaining({
        method: "PUT",
        body: file,
      }),
    )
  })
})
