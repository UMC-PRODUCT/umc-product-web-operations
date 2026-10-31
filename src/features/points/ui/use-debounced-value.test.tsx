import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDebouncedValue } from "@/shared/lib/use-debounced-value"

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("keeps the latest value until the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "" } },
    )

    rerender({ value: "김" })
    rerender({ value: "김운" })

    expect(result.current).toBe("")

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe("김운")
  })
})
