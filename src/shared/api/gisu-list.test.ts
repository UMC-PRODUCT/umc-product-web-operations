import { describe, expect, it } from "vitest"

import { toGisuListItems } from "./gisu-list"

describe("toGisuListItems", () => {
  it("keeps numeric strings from the gisu list", () => {
    expect(
      toGisuListItems([
        {
          gisuId: "6",
          generation: "11",
          gisu: "11",
          isActive: true,
        },
        { gisuId: "5", generation: "10", isActive: false },
      ]),
    ).toEqual([
      { gisuId: 6, generation: 11, isActive: true },
      { gisuId: 5, generation: 10, isActive: false },
    ])
  })
})
