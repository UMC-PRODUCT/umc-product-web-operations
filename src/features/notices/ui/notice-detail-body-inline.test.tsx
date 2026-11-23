import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderNoticeDetailBodyLine } from "./notice-detail-body-inline"

describe("renderNoticeDetailBodyLine", () => {
  it("renders highlight inner text instead of color id", () => {
    const line = '<mark data-hl="mint">민트</mark>'
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.textContent).toContain("민트")
    expect(container.textContent).not.toMatch(/^mint$/m)
  })

  it("parses nested bold inside highlight", () => {
    const line = '<mark data-hl="mint">**볼드 + 하이라이트**</mark>'
    const { container } = render(<>{renderNoticeDetailBodyLine(line, "t")}</>)
    expect(container.textContent).toContain("볼드 + 하이라이트")
    expect(container.querySelector("strong")).not.toBeNull()
  })
})
