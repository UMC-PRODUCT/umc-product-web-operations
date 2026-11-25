import { describe, expect, it } from "vitest"

import { buildRegisterChallengerDeactivationBody } from "./map-withdrawal-register-reason-api"
import { INITIAL_WITHDRAWAL_REGISTER_FORM } from "./withdrawal-register-form"

describe("buildRegisterChallengerDeactivationBody", () => {
  it("maps fixed voluntary reason without reasonDetail", () => {
    const body = buildRegisterChallengerDeactivationBody({
      ...INITIAL_WITHDRAWAL_REGISTER_FORM,
      reasonType: "voluntary",
      reasonId: "career",
    })
    expect(body).toEqual({
      reason: "VOLUNTARY_CAREER_PREPARATION",
    })
  })

  it("requires reasonDetail for VOLUNTARY_OTHER", () => {
    const body = buildRegisterChallengerDeactivationBody({
      ...INITIAL_WITHDRAWAL_REGISTER_FORM,
      reasonType: "voluntary",
      reasonId: "other-voluntary",
      otherReasonDetail: "  팀 활동 조율 어려움  ",
    })
    expect(body).toEqual({
      reason: "VOLUNTARY_OTHER",
      reasonDetail: "팀 활동 조율 어려움",
    })
  })

  it("includes trimmed memo when adminMemo is present", () => {
    const body = buildRegisterChallengerDeactivationBody({
      ...INITIAL_WITHDRAWAL_REGISTER_FORM,
      reasonType: "involuntary",
      reasonId: "event-no-show",
      adminMemo: "  운영 메모  ",
    })
    expect(body).toEqual({
      reason: "INVOLUNTARY_EVENT_NO_SHOW",
      memo: "운영 메모",
    })
  })

  it("maps involuntary point threshold reason", () => {
    const body = buildRegisterChallengerDeactivationBody({
      ...INITIAL_WITHDRAWAL_REGISTER_FORM,
      reasonType: "involuntary",
      reasonId: "points-total-minus-20",
    })
    expect(body).toEqual({
      reason: "INVOLUNTARY_POINT_THRESHOLD",
    })
  })
})
