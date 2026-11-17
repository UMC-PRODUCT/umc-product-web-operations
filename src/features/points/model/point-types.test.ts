import { describe, expect, it } from "vitest"

import {
  getPenaltyScopesForRoleTypes,
  getPointTypeOptions,
  MOCK_PENALTY_TYPES_ALL,
  MOCK_PENALTY_TYPES_CAMPUS,
  MOCK_PENALTY_TYPES_PRESIDENCY,
  MOCK_REWARD_TYPES,
} from "./point-types"

describe("getPenaltyScopesForRoleTypes", () => {
  it("always includes all-scope for challengers", () => {
    expect(getPenaltyScopesForRoleTypes([])).toEqual(["all"])
  })

  it("adds campus scope for 교내 운영진 roles", () => {
    expect(getPenaltyScopesForRoleTypes(["SCHOOL_PART_LEADER"])).toEqual([
      "all",
      "campus",
    ])
    expect(getPenaltyScopesForRoleTypes(["SCHOOL_ETC_ADMIN"])).toEqual([
      "all",
      "campus",
    ])
  })

  it("adds presidency scope for 회장단·중앙·지부 roles", () => {
    expect(getPenaltyScopesForRoleTypes(["CHAPTER_PRESIDENT"])).toEqual([
      "all",
      "presidency",
    ])
    expect(getPenaltyScopesForRoleTypes(["CENTRAL_PRESIDENT"])).toEqual([
      "all",
      "presidency",
    ])
    expect(getPenaltyScopesForRoleTypes(["SCHOOL_PRESIDENT"])).toEqual([
      "all",
      "presidency",
    ])
  })

  it("unions scopes across multiple role types", () => {
    expect(
      getPenaltyScopesForRoleTypes(["SCHOOL_PRESIDENT", "SCHOOL_PART_LEADER"]),
    ).toEqual(["all", "campus", "presidency"])
  })
})

describe("getPointTypeOptions", () => {
  it("returns reward list for any role set", () => {
    expect(getPointTypeOptions("reward", ["SCHOOL_PART_LEADER"])).toEqual(
      MOCK_REWARD_TYPES,
    )
    expect(getPointTypeOptions("reward", [])).toEqual(MOCK_REWARD_TYPES)
  })

  it("returns only all-scope penalties for challengers", () => {
    expect(getPointTypeOptions("penalty", [])).toEqual(MOCK_PENALTY_TYPES_ALL)
  })

  it("includes campus penalties for campus staff", () => {
    expect(getPointTypeOptions("penalty", ["SCHOOL_PART_LEADER"])).toEqual([
      ...MOCK_PENALTY_TYPES_ALL,
      ...MOCK_PENALTY_TYPES_CAMPUS,
    ])
  })

  it("includes presidency penalties for chapter", () => {
    expect(getPointTypeOptions("penalty", ["CHAPTER_PRESIDENT"])).toEqual([
      ...MOCK_PENALTY_TYPES_ALL,
      ...MOCK_PENALTY_TYPES_PRESIDENCY,
    ])
  })
})
