import { describe, expect, it } from "vitest"

import { getLegacyPartTagStyle, LEGACY_PART_FILLED_BG } from "./legacy-part-tag"

describe("legacy part tag colors", () => {
  it("matches Figma Tag/Product Part filled backgrounds", () => {
    expect(LEGACY_PART_FILLED_BG.WEB).toBe("#fff0c2")
    expect(LEGACY_PART_FILLED_BG.ANDROID).toBe("#daf1e5")
    expect(LEGACY_PART_FILLED_BG.IOS).toBe("#e0e8ff")
    expect(LEGACY_PART_FILLED_BG.SPRINGBOOT).toBe("#ede3d9")
    expect(LEGACY_PART_FILLED_BG.DESIGN).toBe("#ffe0f1")
    expect(LEGACY_PART_FILLED_BG.PLAN).toBe("#eee3fc")
  })

  it("gives Node.js the same color as Spring", () => {
    expect(LEGACY_PART_FILLED_BG.NODEJS).toBe(LEGACY_PART_FILLED_BG.SPRINGBOOT)
  })

  it("exposes the background as a PartTag CSS variable", () => {
    expect(getLegacyPartTagStyle("ANDROID")).toEqual({
      "--umc-part-tag-bg": "#daf1e5",
    })
  })
})
