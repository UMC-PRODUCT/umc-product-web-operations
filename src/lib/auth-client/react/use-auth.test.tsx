import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createAuthClient } from "../create-auth-client"
import { AuthClientProvider, useAuth } from "./auth-provider"

import type { AuthClientConfig } from "../types"

const CONFIG: AuthClientConfig = {
  apiBaseUrl: "",
  authAppUrl: "http://localhost:5174",
  clientId: "local",
  loginMode: "direct",
  redirectUri: "http://localhost:5173/auth/callback",
}

function Status() {
  const { status } = useAuth()
  return <div data-testid="status">{status}</div>
}

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe("useAuth", () => {
  it("becomes authenticated when a refresh token can be renewed", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            result: { accessToken: "access-2", refreshToken: "refresh-2" },
            success: true,
          }),
          { status: 200 },
        ),
    )
    const client = createAuthClient(
      CONFIG,
      { onUnauthenticated: "ignore" },
      {
        fetch: fetchMock,
        location: {
          assign: vi.fn(),
          href: "http://localhost:5173/",
          origin: "http://localhost:5173",
        },
      },
    )
    client.setTokens({ accessToken: "expired", refreshToken: "refresh-1" })

    render(
      <AuthClientProvider client={client}>
        <Status />
      </AuthClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated")
    })
  })

  it("stays anonymous when there is no refresh token", async () => {
    const fetchMock = vi.fn()
    const client = createAuthClient(
      CONFIG,
      { onUnauthenticated: "ignore" },
      {
        fetch: fetchMock,
        location: {
          assign: vi.fn(),
          href: "http://localhost:5173/",
          origin: "http://localhost:5173",
        },
      },
    )

    render(
      <AuthClientProvider client={client}>
        <Status />
      </AuthClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous")
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("becomes anonymous when renew fails", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 401 }))
    const client = createAuthClient(
      CONFIG,
      { onUnauthenticated: "login" },
      {
        fetch: fetchMock,
        location: {
          assign: vi.fn(),
          href: "http://localhost:5173/",
          origin: "http://localhost:5173",
        },
      },
    )
    client.setTokens({ accessToken: "expired", refreshToken: "refresh-1" })

    render(
      <AuthClientProvider client={client}>
        <Status />
      </AuthClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous")
    })
  })
})
