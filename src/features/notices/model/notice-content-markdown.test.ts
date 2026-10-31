import { describe, expect, it } from "vitest"

import { applyNoticeContentMarkdownFormat } from "./notice-content-markdown"

describe("applyNoticeContentMarkdownFormat", () => {
  it("wraps selection in bold markers", () => {
    const result = applyNoticeContentMarkdownFormat(
      "hello world",
      6,
      11,
      "bold",
    )

    expect(result.value).toBe("hello **world**")
    expect(result.selectionStart).toBe(8)
    expect(result.selectionEnd).toBe(13)
  })

  it("inserts placeholder when nothing is selected", () => {
    const result = applyNoticeContentMarkdownFormat("abc", 1, 1, "italic")

    expect(result.value).toBe("a*기울임*bc")
    expect(result.selectionStart).toBe(2)
    expect(result.selectionEnd).toBe(5)
  })

  it("toggles heading prefix on selected lines", () => {
    const text = "first\nsecond"
    const on = applyNoticeContentMarkdownFormat(text, 0, 11, "heading")

    expect(on.value).toBe("# first\n# second")

    const off = applyNoticeContentMarkdownFormat(
      on.value,
      0,
      on.value.length,
      "heading",
    )

    expect(off.value).toBe("first\nsecond")
  })
})
