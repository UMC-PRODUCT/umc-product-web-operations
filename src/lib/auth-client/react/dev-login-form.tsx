import { type FormEvent, useState } from "react"

import { ApiError } from "../api-error"

export function DevLoginForm({
  onSubmit,
}: {
  onSubmit: (input: { email: string; password: string }) => Promise<void>
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorCode(null)
    try {
      await onSubmit({ email, password })
    } catch (error) {
      setErrorCode(
        error instanceof ApiError ? (error.code ?? "UNKNOWN") : "UNKNOWN",
      )
    }
  }

  return (
    <form
      className="flex flex-col gap-2"
      data-testid="sso-dev-login-form"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <input
        aria-label="이메일"
        autoComplete="email"
        className="border px-2 py-1"
        onChange={(event) => {
          setEmail(event.target.value)
        }}
        type="email"
        value={email}
      />
      <input
        aria-label="비밀번호"
        autoComplete="current-password"
        className="border px-2 py-1"
        onChange={(event) => {
          setPassword(event.target.value)
        }}
        type="password"
        value={password}
      />
      {errorCode ? <p role="alert">{errorCode}</p> : null}
      <button type="submit">로그인</button>
    </form>
  )
}
