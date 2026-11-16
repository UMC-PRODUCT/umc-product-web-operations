import { describe, expect, it } from "vitest"

import { resolveAdminShellStaticData } from "./route-static-data"

describe("resolveAdminShellStaticData", () => {
  it("staticData가 없으면 기본값을 반환한다", () => {
    expect(resolveAdminShellStaticData([undefined, {}])).toEqual({
      hideTitleBlock: false,
      shellLayout: "default",
    })
  })

  it("하위 라우트 값이 상위 값을 덮어쓴다", () => {
    expect(
      resolveAdminShellStaticData([
        { hideTitleBlock: true },
        { shellLayout: "contents-area" },
        { shellLayout: "compose" },
      ]),
    ).toEqual({ hideTitleBlock: true, shellLayout: "compose" })
  })
})
