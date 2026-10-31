import { describe, expect, it } from "vitest"

import {
  isValidVoteTime,
  normalizeVoteTimeForSubmit,
} from "./notice-create-vote-validation"

describe("normalizeVoteTimeForSubmit", () => {
  it("pads single-digit hours and minutes", () => {
    expect(normalizeVoteTimeForSubmit("5:3")).toBe("05:03")
    expect(normalizeVoteTimeForSubmit("5:30")).toBe("05:30")
  })

  it("treats hour-only input as HH:00", () => {
    expect(normalizeVoteTimeForSubmit("5")).toBe("05:00")
  })
})

describe("isValidVoteTime", () => {
  it("accepts single-digit hour and minute parts", () => {
    expect(isValidVoteTime("5:30")).toBe(true)
    expect(isValidVoteTime("05:30")).toBe(true)
  })
})
