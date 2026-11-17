import { QueryClient } from "@tanstack/react-query"
import { isRedirect } from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"
import { ApiError } from "@umc-product/auth-client"
import { AxiosError } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  AdminGateError,
  adminSessionQueryKey,
  hasOperatorOnlyLoginNotice,
} from "@/features/auth"

import { Route } from "./route"

import type { ReactElement } from "react"

const mocks = vi.hoisted(() => ({
  accessToken: null as string | null,
  refreshToken: null as string | null,
  clearSession: vi.fn(),
  logout: vi.fn(() => Promise.resolve()),
  apiGet: vi.fn(),
}))

vi.mock("@/shared/auth/sso-client", () => ({
  getSsoClient: () => ({
    getAccessToken: () => mocks.accessToken,
    getRefreshToken: () => mocks.refreshToken,
    clearSession: mocks.clearSession,
    logout: mocks.logout,
  }),
}))

vi.mock("@/shared/api/client", () => ({
  api: { get: mocks.apiGet },
}))

vi.mock("@/widgets/admin-shell/AdminShell", () => ({
  AdminShell: () => <div data-testid="admin-shell" />,
}))

type GuardArgs = {
  context: { queryClient: QueryClient }
  location: { href: string }
}

const beforeLoad = Route.options.beforeLoad as unknown as (
  args: GuardArgs,
) => Promise<{ session: { isAdmin: boolean; isSuperAdmin: boolean } }>

function memberResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      success: true,
      result: {
        id: 1,
        name: "운영자",
        isSuperAdmin: false,
        currentGisuMemberInfo: {
          gisuId: 9,
          generation: 9,
          isAdmin: true,
          roleTypes: ["CENTRAL_PRESIDENT"],
        },
        ...overrides,
      },
    },
  }
}

function axiosError(status: number) {
  return new AxiosError("request failed", undefined, undefined, undefined, {
    status,
  } as never)
}

async function runGuard(queryClient = new QueryClient()) {
  return beforeLoad({
    context: { queryClient },
    location: { href: "/notices?page=2" },
  })
}

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error("guard가 throw 하지 않았습니다")
}

function redirectOptions(error: unknown) {
  expect(isRedirect(error)).toBe(true)
  return (error as { options: Record<string, unknown> }).options
}

describe("_admin beforeLoad guard", () => {
  beforeEach(() => {
    mocks.accessToken = "access"
    mocks.refreshToken = "refresh"
    mocks.apiGet.mockReset()
    mocks.clearSession.mockReset()
    mocks.logout.mockClear()
    sessionStorage.clear()
  })

  describe("허용 경로", () => {
    it("운영진 세션이면 session을 context로 넘기고 캐시한다", async () => {
      mocks.apiGet.mockResolvedValue(memberResponse())
      const queryClient = new QueryClient()

      const result = await runGuard(queryClient)

      expect(result.session).toMatchObject({
        isAdmin: true,
        isSuperAdmin: false,
      })
      expect(queryClient.getQueryData(adminSessionQueryKey)).toBeDefined()
      expect(mocks.logout).not.toHaveBeenCalled()
    })

    it("슈퍼 관리자는 isAdmin이 아니어도 통과한다", async () => {
      mocks.apiGet.mockResolvedValue(
        memberResponse({
          isSuperAdmin: true,
          currentGisuMemberInfo: null,
        }),
      )

      const result = await runGuard()

      expect(result.session.isSuperAdmin).toBe(true)
    })

    it("access token이 없어도 refresh token이 있으면 세션 조회를 시도한다", async () => {
      mocks.accessToken = null
      mocks.apiGet.mockResolvedValue(memberResponse())

      await expect(runGuard()).resolves.toBeDefined()
      expect(mocks.apiGet).toHaveBeenCalledTimes(1)
    })
  })

  describe("차단 경로", () => {
    it("토큰이 전혀 없으면 현재 위치를 담아 /login으로 redirect한다", async () => {
      mocks.accessToken = null
      mocks.refreshToken = null

      const options = redirectOptions(await catchError(runGuard()))

      expect(options).toMatchObject({
        replace: true,
        search: { redirect: "/notices?page=2" },
        to: "/login",
      })
      expect(mocks.apiGet).not.toHaveBeenCalled()
    })

    it("운영진이 아니면 로그아웃·안내 플래그 후 /login으로 redirect한다", async () => {
      mocks.apiGet.mockResolvedValue(
        memberResponse({
          currentGisuMemberInfo: {
            gisuId: 9,
            generation: 9,
            isAdmin: false,
            roleTypes: [],
          },
        }),
      )
      const queryClient = new QueryClient()

      const options = redirectOptions(await catchError(runGuard(queryClient)))

      expect(options).toMatchObject({ replace: true, to: "/login" })
      expect(mocks.logout).toHaveBeenCalledTimes(1)
      expect(hasOperatorOnlyLoginNotice()).toBe(true)
      expect(queryClient.getQueryData(adminSessionQueryKey)).toBeUndefined()
    })

    it("403이면 AdminGateError(forbidden)를 던진다", async () => {
      mocks.apiGet.mockRejectedValue(axiosError(403))

      const error = await catchError(runGuard())

      expect(error).toBeInstanceOf(AdminGateError)
      expect((error as AdminGateError).gate).toBe("forbidden")
    })

    it("인증 클라이언트 ApiError면 AdminGateError(signing-in)를 던진다", async () => {
      mocks.apiGet.mockRejectedValue(new ApiError("expired", 401))

      const error = await catchError(runGuard())

      expect(error).toBeInstanceOf(AdminGateError)
      expect((error as AdminGateError).gate).toBe("signing-in")
    })

    it("조회 실패 중 토큰이 사라졌다면 세션을 정리하고 /login으로 보낸다", async () => {
      mocks.apiGet.mockImplementation(() => {
        mocks.accessToken = null
        mocks.refreshToken = null
        return Promise.reject(axiosError(401))
      })

      const options = redirectOptions(await catchError(runGuard()))

      expect(options).toMatchObject({
        search: { redirect: "/notices?page=2" },
        to: "/login",
      })
      expect(mocks.clearSession).toHaveBeenCalledTimes(1)
    })

    it("토큰이 남아 있는 그 외 오류는 그대로 던진다", async () => {
      const failure = axiosError(500)
      mocks.apiGet.mockRejectedValue(failure)

      await expect(runGuard()).rejects.toBe(failure)
    })
  })
})

describe("_admin errorComponent (AdminGate 화면)", () => {
  const AdminError = Route.options.errorComponent as unknown as (props: {
    error: Error
  }) => ReactElement

  it("forbidden 게이트는 권한 없음 안내를 보여준다", () => {
    render(<AdminError error={new AdminGateError("forbidden")} />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "이 작업을 수행할 권한이 없습니다.",
    )
  })

  it("signing-in 게이트는 로그인 중 상태를 보여준다", () => {
    render(<AdminError error={new AdminGateError("signing-in")} />)

    expect(screen.getByRole("status")).toHaveTextContent("로그인 중")
  })

  it("게이트 오류가 아니면 다시 던진다", () => {
    const failure = new Error("boom")
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    expect(() => render(<AdminError error={failure} />)).toThrow(failure)
  })
})
