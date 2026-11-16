import { describe, expect, it } from "vitest"

import { formatGisuStartYear, toGisuListItems } from "./gisu-list"

describe("toGisuListItems", () => {
  it("keeps numeric strings from the gisu list", () => {
    expect(
      toGisuListItems([
        {
          gisuId: "6",
          generation: "11",
          gisu: "11",
          isActive: true,
          startAt: "2026-03-01T00:00:00Z",
        },
        {
          gisuId: "5",
          generation: "10",
          isActive: false,
          startedAt: "2025-03-01T00:00:00Z",
        },
      ]),
    ).toEqual([
      {
        gisuId: 6,
        generation: 11,
        isActive: true,
        startAt: "2026-03-01T00:00:00Z",
      },
      {
        gisuId: 5,
        generation: 10,
        isActive: false,
        startAt: "2025-03-01T00:00:00Z",
      },
    ])
  })

  it("prefers startAt over startedAt when both exist", () => {
    expect(
      toGisuListItems([
        {
          gisuId: 1,
          generation: 11,
          startAt: "2026-01-01T00:00:00Z",
          startedAt: "2025-01-01T00:00:00Z",
        },
      ]),
    ).toEqual([
      {
        gisuId: 1,
        generation: 11,
        isActive: false,
        startAt: "2026-01-01T00:00:00Z",
      },
    ])
  })
})

describe("formatGisuStartYear", () => {
  it("returns the calendar year from startAt", () => {
    expect(formatGisuStartYear("2026-03-01T00:00:00Z")).toBe("2026")
  })

  it("returns undefined for missing or invalid values", () => {
    expect(formatGisuStartYear(null)).toBeUndefined()
    expect(formatGisuStartYear("")).toBeUndefined()
    expect(formatGisuStartYear("not-a-date")).toBeUndefined()
  })
})
