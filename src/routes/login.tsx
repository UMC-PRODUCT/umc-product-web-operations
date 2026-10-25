import { useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  isRedirect,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { Button, TextField } from "@umc-product/react"
import { type FormEvent, useState } from "react"

import {
  adminSessionQueryKey,
  adminSessionQueryOptions,
  clearAdminSession,
  isOperator,
  loginByEmail,
} from "@/features/auth"
import { getAccessToken, getRefreshToken } from "@/shared/api/access-token"
import { getServerErrorMessage } from "@/shared/api/server-error"

const PERMISSION_DENIED_MESSAGE = "운영진 권한이 없어요"

type LoginSearch = {
  forbidden?: boolean
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const forbidden =
      search.forbidden === true ||
      search.forbidden === "true" ||
      search.forbidden === "1"
    return forbidden ? { forbidden: true } : {}
  },
  beforeLoad: async ({ context, search }) => {
    if (search.forbidden) {
      return
    }
    if (!getAccessToken() && !getRefreshToken()) {
      return
    }
    try {
      const session = await context.queryClient.ensureQueryData(
        adminSessionQueryOptions(),
      )
      if (!isOperator(session)) {
        clearAdminSession(context.queryClient)
        throw redirect({ to: "/login", search: { forbidden: true } })
      }
      throw redirect({ to: "/notices" })
    } catch (error) {
      if (isRedirect(error)) {
        throw error
      }
      if (!getAccessToken() && !getRefreshToken()) {
        clearAdminSession(context.queryClient)
      }
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { forbidden } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const alertMessage =
    errorMessage ?? (forbidden ? PERMISSION_DENIED_MESSAGE : null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setPending(true)
    let signedIn = false
    try {
      await loginByEmail({ email, password })
      signedIn = true
      queryClient.removeQueries({ queryKey: adminSessionQueryKey })
      const session = await queryClient.fetchQuery(adminSessionQueryOptions())
      if (!isOperator(session)) {
        clearAdminSession(queryClient)
        setErrorMessage(PERMISSION_DENIED_MESSAGE)
        return
      }
      await navigate({ to: "/notices" })
    } catch (error) {
      if (signedIn) {
        clearAdminSession(queryClient)
      }
      setErrorMessage(getServerErrorMessage(error) ?? "로그인에 실패했어요")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <h1 className="text-2xl font-semibold">로그인</h1>
        <TextField
          autoComplete="email"
          label="이메일"
          onChange={(event) => {
            setEmail(event.target.value)
          }}
          placeholder="admin@umc.com"
          required
          type="email"
          value={email}
        />
        <TextField
          autoComplete="current-password"
          label="비밀번호"
          onChange={(event) => {
            setPassword(event.target.value)
          }}
          placeholder="••••••••"
          required
          type="password"
          value={password}
        />
        {alertMessage ? (
          <p className="text-body-3-regular text-error" role="alert">
            {alertMessage}
          </p>
        ) : null}
        <Button disabled={pending} size="md" type="submit">
          로그인
        </Button>
      </form>
    </div>
  )
}
