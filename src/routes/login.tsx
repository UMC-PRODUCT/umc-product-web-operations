import { useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  isRedirect,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { Button, TextFieldBox } from "@umc-product/react"
import { type FormEvent, useState } from "react"

import {
  adminSessionQueryKey,
  adminSessionQueryOptions,
  clearAdminSession,
  loginByEmail,
} from "@/features/auth"
import { getAccessToken, getRefreshToken } from "@/shared/api/access-token"
import { getServerErrorMessage } from "@/shared/api/server-error"

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    if (!getAccessToken() && !getRefreshToken()) {
      return
    }
    try {
      await context.queryClient.ensureQueryData(adminSessionQueryOptions())
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setPending(true)
    let signedIn = false
    try {
      await loginByEmail({ email, password })
      signedIn = true
      queryClient.removeQueries({ queryKey: adminSessionQueryKey })
      try {
        await queryClient.fetchQuery(adminSessionQueryOptions())
      } catch {
        // 로그인 토큰은 유효하므로 세션 조회 실패해도 입장시킨다.
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
        <TextFieldBox
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
        <TextFieldBox
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
        {errorMessage ? (
          <p className="text-body-3-regular text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <Button disabled={pending} size="md" type="submit">
          로그인
        </Button>
      </form>
    </div>
  )
}
