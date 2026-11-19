import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NoticeDetailBody } from "./notice-detail-body"

describe("NoticeDetailBody", () => {
  it("splits lines on newline and crlf", () => {
    const body = "첫줄\r\n둘째줄\r셋째줄"
    render(<NoticeDetailBody body={body} />)
    const paragraphs = screen.getAllByText(/줄$/)
    expect(paragraphs).toHaveLength(3)
  })

  it("preserves blank lines between content", () => {
    const body = "1\n\n3"
    const { container } = render(<NoticeDetailBody body={body} />)
    const blocks = container.querySelectorAll("p")
    expect(blocks).toHaveLength(3)
    expect(blocks[0]?.textContent).toBe("1")
    expect(blocks[2]?.textContent).toBe("3")
  })
})
