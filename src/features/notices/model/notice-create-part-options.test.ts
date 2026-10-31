import { describe, expect, it } from "vitest"

import {
  filterNoticeCreateParts,
  resolveNoticeCreatePartOptions,
} from "./notice-create-part-options"

describe("resolveNoticeCreatePartOptions", () => {
  it("uses legacy track parts before 11기", () => {
    const values = resolveNoticeCreatePartOptions(10).map(
      (option) => option.value,
    )
    expect(values).toContain("WEB")
    expect(values).not.toContain("WEB_PRODUCT_ENGINEER")
  })

  it("uses PE parts from 11기", () => {
    const values = resolveNoticeCreatePartOptions(11).map(
      (option) => option.value,
    )
    expect(values).toEqual([
      "PLAN",
      "DESIGN",
      "WEB_PRODUCT_ENGINEER",
      "MOBILE_PRODUCT_ENGINEER",
    ])
  })
})

describe("filterNoticeCreateParts", () => {
  it("drops legacy parts when generation switches to 11기", () => {
    expect(filterNoticeCreateParts(["WEB", "PLAN"], 11)).toEqual(["PLAN"])
  })
})
