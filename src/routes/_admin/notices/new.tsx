import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/notices/new")({
  component: NoticeCreatePage,
})

function NoticeCreatePage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">공지작성</h1>
      <p className="text-teal-grey-600 text-sm">새 공지를 작성합니다.</p>
    </section>
  )
}
