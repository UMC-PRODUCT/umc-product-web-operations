import { createFileRoute, Link } from "@tanstack/react-router"
import { Button, TextField } from "@umc-product/react"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <h1 className="text-2xl font-semibold">로그인</h1>
        <TextField label="이메일" placeholder="admin@umc.com" type="email" />
        <TextField label="비밀번호" placeholder="••••••••" type="password" />
        <Button size="md" type="submit">
          로그인
        </Button>
        <Link className="text-sm text-teal-600 underline" to="/">
          대시보드로 돌아가기
        </Link>
      </form>
    </div>
  )
}
