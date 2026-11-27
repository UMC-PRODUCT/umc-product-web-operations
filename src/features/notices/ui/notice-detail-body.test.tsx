import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NoticeDetailBody, splitNoticeBodyLines } from "./notice-detail-body"

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

  it("keeps literal backslash-n in a single line", () => {
    expect(splitNoticeBodyLines(String.raw`줄1\n줄2`)).toEqual(["줄1\\n줄2"])
    render(<NoticeDetailBody body={String.raw`줄1\n줄2`} />)
    expect(screen.getByText(String.raw`줄1\n줄2`)).toBeTruthy()
  })

  it("groups consecutive blockquote lines under one vertical rule", () => {
    const body = "> 첫 인용\n> 둘째 인용"
    const { container } = render(<NoticeDetailBody body={body} />)
    expect(container.querySelectorAll("blockquote")).toHaveLength(1)
    expect(
      container.querySelector("blockquote")?.querySelectorAll("p"),
    ).toHaveLength(2)
  })
})
