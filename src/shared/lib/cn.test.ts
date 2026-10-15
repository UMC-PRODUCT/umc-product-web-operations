import { describe, expect, it } from "vitest"

import { cn } from "./cn"

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4", "text-teal-600")).toBe("px-4 text-teal-600")
  })

  it("keeps text style utilities when merging color classes", () => {
    expect(
      cn(
        "text-body-2-regular",
        "text-neutral-default-900",
        "text-body-3-medium",
      ),
    ).toBe("text-neutral-default-900 text-body-3-medium")
  })
})
