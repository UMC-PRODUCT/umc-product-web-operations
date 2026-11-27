import { describe, expect, it } from "vitest"

import {
  applyNoticeContentHighlightColor,
  applyNoticeContentMarkdownFormat,
  applyNoticeContentTextStyle,
  getNoticeContentHighlightAtIndex,
  getNoticeContentTextStyleAtIndex,
  normalizeNoticeContentLegacyWhitespaceMarkers,
  unescapeNoticeContentPlainTextSegment,
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

  it("keeps trailing spaces outside bold markers", () => {
    const text = "일시: "
    const result = applyNoticeContentMarkdownFormat(
      text,
      0,
      text.length,
      "bold",
    )

    expect(result.value).toBe("**일시:** ")
    expect(result.selectionStart).toBe(2)
    expect(result.selectionEnd).toBe(5)
  })

  it("does not wrap whitespace-only selection", () => {
    const text = "a   b"
    const result = applyNoticeContentMarkdownFormat(text, 1, 4, "bold")

    expect(result.value).toBe(text)
    expect(result.selectionStart).toBe(1)
    expect(result.selectionEnd).toBe(4)
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

  it("prefixes lines with dash list marker", () => {
    const text = "first\nsecond"
    const result = applyNoticeContentMarkdownFormat(text, 0, 11, "dashList")

    expect(result.value).toBe("\u2013 first\n\u2013 second")
  })

  it("prefixes lines with incrementing numbered list markers", () => {
    const text = "first\nsecond"
    const result = applyNoticeContentMarkdownFormat(text, 0, 11, "numberedList")

    expect(result.value).toBe("1. first\n2. second")
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

  it("does not treat hashtag without space as heading", () => {
    const text = "#해시태그"
    expect(getNoticeContentTextStyleAtIndex(text, 1)).toBe("body")
  })

  it("detects highlight only inside mark content", () => {
    const text = 'a <mark color="0.000,0.780,0.745,0.350">민트</mark> b'
    const innerStart = text.indexOf("민")
    expect(getNoticeContentHighlightAtIndex(text, innerStart)).toBe("mint")
    expect(getNoticeContentHighlightAtIndex(text, 0)).toBe("none")
    expect(getNoticeContentHighlightAtIndex(text, text.length - 1)).toBe("none")
  })

  it("detects legacy data-hl highlights at caret", () => {
    const text = 'a <mark data-hl="blue">파랑</mark> b'
    const innerStart = text.indexOf("파")
    expect(getNoticeContentHighlightAtIndex(text, innerStart)).toBe("blue")
  })
})

describe("notice content escape helpers", () => {
  it("unescapes the iOS 15-char plain text set", () => {
    expect(unescapeNoticeContentPlainTextSegment("\\*굵지\\*않음")).toBe(
      "*굵지*않음",
    )
    expect(unescapeNoticeContentPlainTextSegment(String.raw`C:\\Users`)).toBe(
      String.raw`C:\Users`,
    )
  })

  it("normalizes legacy bold trailing spaces", () => {
    expect(normalizeNoticeContentLegacyWhitespaceMarkers("**일시: **")).toBe(
      "**일시:** ",
    )
  })
})

describe("applyNoticeContentHighlightColor", () => {
  it("wraps selection in highlight markup", () => {
    const result = applyNoticeContentHighlightColor("abc", 1, 3, "purple")

    expect(result.value).toBe(
      'a<mark color="0.686,0.322,0.871,0.350">bc</mark>',
    )
  })
})
