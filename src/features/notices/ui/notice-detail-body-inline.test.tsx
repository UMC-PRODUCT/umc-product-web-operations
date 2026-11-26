import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  parseNoticeBodyLine,
  renderNoticeDetailBodyLine,
} from "./notice-detail-body-inline"

describe("renderNoticeDetailBodyLine", () => {
  it("renders highlight inner text instead of color id", () => {
    const line = '<mark data-hl="mint">민트</mark>'
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.textContent).toContain("민트")
    expect(container.textContent).not.toMatch(/^mint$/m)
  })

  it("parses iOS mark color attribute", () => {
    const line = '<mark color="0.000,0.478,1.000,0.350">파랑</mark>'
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.textContent).toContain("파랑")
  })

  it("parses nested bold inside highlight", () => {
    const line = '<mark data-hl="mint">**볼드 + 하이라이트**</mark>'
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.textContent).toContain("볼드 + 하이라이트")
    expect(container.querySelector("strong")).not.toBeNull()
  })

  it("renders markdown link with nested label formatting", () => {
    const line = "안내 [**공식 홈페이지**](https://example.com)"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    const link = container.querySelector('a[href="https://example.com"]')
    expect(link).not.toBeNull()
    expect(link?.querySelector("strong")).not.toBeNull()
    expect(container.textContent).toContain("공식 홈페이지")
  })

  it("renders plain https url as autolink", () => {
    const line = "자세한 내용은 https://example.com/docs 입니다"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(
      container.querySelector('a[href="https://example.com/docs"]'),
    ).not.toBeNull()
  })

  it("does not link javascript scheme", () => {
    const line = "[클릭](javascript:alert(1))"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.querySelector("a")).toBeNull()
    expect(container.textContent).toContain("클릭")
  })

  it("parses bold-italic and underscore italic", () => {
    const line = "**_강조_** 와 _이탤릭_"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    const strongItalics = container.querySelectorAll("strong.italic")
    expect(strongItalics.length).toBeGreaterThanOrEqual(1)
    expect(container.textContent).toContain("강조")
    expect(container.textContent).toContain("이탤릭")
  })

  it("parses triple-star bold italic", () => {
    const line = "***세게***"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.querySelector("strong.italic")).not.toBeNull()
    expect(container.textContent).toBe("세게")
  })

  it("renders escaped bold markers as plain text", () => {
    const line = String.raw`\*\*굵지 않음\*\*`
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.querySelector("strong")).toBeNull()
    expect(container.textContent).toBe("**굵지 않음**")
  })

  it("normalizes legacy bold with inner trailing space", () => {
    const line = "**일시: **"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.querySelector("strong")).not.toBeNull()
    expect(container.textContent).toBe("일시: ")
  })

  it("does not italicize spaced asterisk expressions", () => {
    const line = "2 * 3"
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.querySelector("em")).toBeNull()
    expect(container.textContent).toBe("2 * 3")
  })

  it("does not parse hashtag without space as heading", () => {
    expect(parseNoticeBodyLine("#해시태그").kind).toBe("body")
    const { container } = render(
      <>{renderNoticeDetailBodyLine("#해시태그", "t")}</>,
    )
    expect(container.querySelector(".text-title-1-semibold")).toBeNull()
    expect(container.textContent).toBe("#해시태그")
  })

  it("parses dash and numbered list lines", () => {
    expect(parseNoticeBodyLine("\u2013 항목").kind).toBe("dashList")
    expect(parseNoticeBodyLine("2. 두번째").kind).toBe("numberedList")
    const { container } = render(
      <>
        {renderNoticeDetailBodyLine("\u2013 대시", "a")}
        {renderNoticeDetailBodyLine("3. 번호", "b")}
      </>,
    )
    expect(container.textContent).toContain("대시")
    expect(container.textContent).toContain("3.")
    expect(container.textContent).toContain("번호")
  })
})
