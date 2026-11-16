import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MemberRoleCell } from "./MemberRoleCell"

import type { PointsMemberRole } from "../model/types"

const roles: PointsMemberRole[] = [
  { color: "campus", label: "회장" },
  { color: "campus", label: "부회장" },
  { color: "campus", label: "파트장" },
  { color: "campus", label: "총무" },
]

describe("MemberRoleCell", () => {
  it("역할 2개까지만 보이고 나머지는 +N 으로 줄인다", () => {
    render(<MemberRoleCell roles={roles} />)

    expect(screen.getByText("회장")).toBeInTheDocument()
    expect(screen.getByText("부회장")).toBeInTheDocument()
    expect(screen.queryByText("파트장")).toBeNull()
    expect(
      screen.getByRole("button", { name: "운영 역할 2개 더보기" }),
    ).toHaveTextContent("+2")
  })

  it("+N 을 누르면 나머지 역할을 Tooltip 으로 보여준다", async () => {
    render(<MemberRoleCell roles={roles} />)

    fireEvent.click(
      screen.getByRole("button", { name: "운영 역할 2개 더보기" }),
    )

    expect(await screen.findByText("파트장")).toBeInTheDocument()
    expect(screen.getByText("총무")).toBeInTheDocument()
  })
})
