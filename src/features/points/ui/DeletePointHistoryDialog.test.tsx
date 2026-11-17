import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DeletePointHistoryDialog } from "./DeletePointHistoryDialog"

import type { PointHistoryItem } from "../model/point-history"
import type { PointsMember } from "../model/types"

const member = {
  id: "1",
  name: "홍길동",
  nickname: "길동",
} as PointsMember

const item: PointHistoryItem = {
  id: "10",
  kind: "reward",
  occurredAt: "2026-11-01",
  reason: "사유",
  score: 1,
  typeLabel: "상점",
}

function renderDialog(
  onConfirm: React.ComponentProps<typeof DeletePointHistoryDialog>["onConfirm"],
) {
  const onOpenChange = vi.fn()
  render(
    <DeletePointHistoryDialog
      item={item}
      member={member}
      onAlreadyDeleted={vi.fn()}
      onConfirm={onConfirm}
      onDeleted={vi.fn()}
      onOpenChange={onOpenChange}
      open
    />,
  )
  return { onOpenChange }
}

describe("DeletePointHistoryDialog", () => {
  it("삭제 실패 시 모달을 닫지 않고 오류 안내를 보여준다", async () => {
    const onConfirm = vi.fn().mockResolvedValue("network_error")
    const { onOpenChange } = renderDialog(onConfirm)

    fireEvent.click(screen.getByRole("button", { name: "삭제하기" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "삭제하지 못했어요",
    )
    expect(onConfirm).toHaveBeenCalledWith("10")
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })

  it("성공하면 모달을 닫는다", async () => {
    const onConfirm = vi.fn().mockResolvedValue("success")
    const { onOpenChange } = renderDialog(onConfirm)

    fireEvent.click(screen.getByRole("button", { name: "삭제하기" }))

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("취소하면 모달을 닫는다", () => {
    const { onOpenChange } = renderDialog(vi.fn())

    fireEvent.click(screen.getByRole("button", { name: "취소" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
