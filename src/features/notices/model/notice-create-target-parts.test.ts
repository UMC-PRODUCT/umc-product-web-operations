import { describe, expect, it } from "vitest"

import { normalizeNoticeCreateTargetParts } from "./notice-create-target-parts"

describe("normalizeNoticeCreateTargetParts", () => {
  it("maps legacy track parts to PE enums for generations before 11기", () => {
    expect(
      normalizeNoticeCreateTargetParts(["WEB", "ANDROID", "PLAN"], 10),
    ).toEqual(["WEB_PRODUCT_ENGINEER", "MOBILE_PRODUCT_ENGINEER", "PLAN"])
  })

  it("dedupes mapped parts", () => {
    expect(
      normalizeNoticeCreateTargetParts(["WEB", "NODEJS", "SPRINGBOOT"], 10),
    ).toEqual(["WEB_PRODUCT_ENGINEER"])
  })

  it("passes through modern parts for 11기 and later", () => {
    expect(
      normalizeNoticeCreateTargetParts(["WEB_PRODUCT_ENGINEER", "PLAN"], 11),
    ).toEqual(["WEB_PRODUCT_ENGINEER", "PLAN"])
  })
})
