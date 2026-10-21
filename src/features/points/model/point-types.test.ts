import { describe, expect, it } from "vitest"

import {
  getPenaltyScopesForMemberRole,
  getPointTypeOptions,
  MOCK_PENALTY_TYPES_ALL,
  MOCK_PENALTY_TYPES_CAMPUS,
  MOCK_PENALTY_TYPES_PRESIDENCY,
  MOCK_REWARD_TYPES,
} from "./point-types"

describe("getPenaltyScopesForMemberRole", () => {
  it("always includes all-scope for challengers", () => {
    expect(getPenaltyScopesForMemberRole("challenger-super-admin")).toEqual([
      "all",
    ])
  })

  it("adds campus scope for 교내 운영진", () => {
    expect(getPenaltyScopesForMemberRole("campus")).toEqual(["all", "campus"])
  })

  it("adds presidency scope for 회장단 roles", () => {
    expect(getPenaltyScopesForMemberRole("chapter")).toEqual([
      "all",
      "presidency",
    ])
    expect(getPenaltyScopesForMemberRole("central")).toEqual([
      "all",
      "presidency",
    ])
    expect(getPenaltyScopesForMemberRole("product")).toEqual([
      "all",
      "presidency",
    ])
  })
})

describe("getPointTypeOptions", () => {
  it("returns reward list for any role", () => {
    expect(getPointTypeOptions("reward", "campus")).toEqual(MOCK_REWARD_TYPES)
    expect(getPointTypeOptions("reward", "challenger-super-admin")).toEqual(
      MOCK_REWARD_TYPES,
    )
  })

  it("returns only all-scope penalties for challengers", () => {
    expect(getPointTypeOptions("penalty", "challenger-super-admin")).toEqual(
      MOCK_PENALTY_TYPES_ALL,
    )
  })

  it("includes campus penalties for campus staff", () => {
    expect(getPointTypeOptions("penalty", "campus")).toEqual([
      ...MOCK_PENALTY_TYPES_ALL,
      ...MOCK_PENALTY_TYPES_CAMPUS,
    ])
  })

  it("includes presidency penalties for chapter", () => {
    expect(getPointTypeOptions("penalty", "chapter")).toEqual([
      ...MOCK_PENALTY_TYPES_ALL,
      ...MOCK_PENALTY_TYPES_PRESIDENCY,
    ])
  })
})
