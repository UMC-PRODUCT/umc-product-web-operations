import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { NoticeCreateVotePanel } from "./notice-create-vote-panel"

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  )
  vi.stubGlobal("scrollTo", vi.fn())
})

describe("NoticeCreateVotePanel", () => {
  it("열리고 취소 시 onClose 를 부른다", () => {
    const onClose = vi.fn()
    render(<NoticeCreateVotePanel onClose={onClose} onCreate={vi.fn()} open />)

    expect(screen.getByRole("dialog")).toHaveTextContent("투표 만들기")

    fireEvent.click(screen.getByRole("button", { name: "취소" }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("달력을 열어도 투표 모달이 닫히지 않는다", () => {
    const onClose = vi.fn()
    render(<NoticeCreateVotePanel onClose={onClose} onCreate={vi.fn()} open />)

    const dateButton = screen.getAllByText("YYYY-MM-DD")[0]?.closest("button")
    expect(dateButton).not.toBeNull()
    fireEvent.mouseDown(dateButton as HTMLElement)
    fireEvent.click(dateButton as HTMLElement)

    expect(document.body.querySelector(".fixed")).not.toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("open=false 이면 아무것도 그리지 않는다", () => {
    render(
      <NoticeCreateVotePanel
        onClose={vi.fn()}
        onCreate={vi.fn()}
        open={false}
      />,
    )

    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
