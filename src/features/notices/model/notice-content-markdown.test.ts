import { describe, expect, it } from "vitest"

import {
  applyNoticeContentHighlightColor,
  applyNoticeContentMarkdownFormat,
  applyNoticeContentTextStyle,
  getNoticeContentHighlightAtIndex,
  getNoticeContentTextStyleAtIndex,
} from "./notice-content-markdown"

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

  it("prefixes lines with list markers", () => {
    const text = "first\nsecond"
    const result = applyNoticeContentMarkdownFormat(text, 0, 11, "list")

    expect(result.value).toBe("- first\n- second")
  })
})

describe("applyNoticeContentTextStyle", () => {
  it("applies heading prefixes", () => {
    const text = "line one\nline two"
    const result = applyNoticeContentTextStyle(text, 0, text.length, "heading2")

    expect(result.value).toBe("## line one\n## line two")
  })

  it("removes heading prefixes for body style", () => {
    const text = "# title\n## subtitle"
    const result = applyNoticeContentTextStyle(text, 0, text.length, "body")

    expect(result.value).toBe("title\nsubtitle")
  })
})

describe("caret toolbar sync", () => {
  it("detects heading style on caret line", () => {
    const text = "plain\n## title\n"
    expect(getNoticeContentTextStyleAtIndex(text, 8)).toBe("heading2")
    expect(getNoticeContentTextStyleAtIndex(text, 0)).toBe("body")
  })

  it("detects highlight only inside mark content", () => {
    const text = 'a <mark data-hl="mint">민트</mark> b'
    const innerStart = text.indexOf("민")
    expect(getNoticeContentHighlightAtIndex(text, innerStart)).toBe("mint")
    expect(getNoticeContentHighlightAtIndex(text, 0)).toBe("none")
    expect(getNoticeContentHighlightAtIndex(text, text.length - 1)).toBe("none")
  })
})

describe("applyNoticeContentHighlightColor", () => {
  it("wraps selection in highlight markup", () => {
    const result = applyNoticeContentHighlightColor("abc", 1, 3, "purple")

    expect(result.value).toBe('a<mark data-hl="purple">bc</mark>')
  })
})
