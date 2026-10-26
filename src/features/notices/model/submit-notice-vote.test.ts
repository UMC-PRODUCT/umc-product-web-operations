import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { afterEach, describe, expect, it, vi } from "vitest"

import * as voteApi from "../api/notices-vote.api"
import {
  cancelNoticeVoteResponse,
  saveNoticeVoteResponse,
} from "./submit-notice-vote"

describe("saveNoticeVoteResponse", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("uses PUT when the user already voted", async () => {
    const update = vi
      .spyOn(voteApi, "updateNoticeVoteResponse")
      .mockResolvedValue(undefined)
    const submit = vi.spyOn(voteApi, "submitNoticeVoteResponse")

    await saveNoticeVoteResponse({
      noticeId: 1,
      optionIds: [2],
      hasExistingResponse: true,
    })

    expect(update).toHaveBeenCalledWith(1, { optionIds: [2] })
    expect(submit).not.toHaveBeenCalled()
  })

  it("falls back to PUT when POST reports an existing response", async () => {
    const submit = vi
      .spyOn(voteApi, "submitNoticeVoteResponse")
      .mockRejectedValue(
        new AxiosError(
          "exists",
          AxiosError.ERR_BAD_REQUEST,
          {} as InternalAxiosRequestConfig,
          {},
          {
            status: 409,
            data: {
              success: false,
              code: "FORM_RESPONSE_ALREADY_EXISTS",
              message: "already",
            },
          } as never,
        ),
      )
    const update = vi
      .spyOn(voteApi, "updateNoticeVoteResponse")
      .mockResolvedValue(undefined)

    await saveNoticeVoteResponse({
      noticeId: 1,
      optionIds: [4],
      hasExistingResponse: false,
    })

    expect(submit).toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(1, { optionIds: [4] })
  })
})

describe("cancelNoticeVoteResponse", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("sends empty optionIds with PUT", async () => {
    const update = vi
      .spyOn(voteApi, "updateNoticeVoteResponse")
      .mockResolvedValue(undefined)

    await cancelNoticeVoteResponse(9)

    expect(update).toHaveBeenCalledWith(9, { optionIds: [] })
  })
})
