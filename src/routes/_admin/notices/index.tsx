import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/notices/")({
  component: NoticesPage,
})

function NoticesPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">공지목록</h1>
      <p className="text-teal-grey-600 text-sm">
        등록된 공지를 확인하고 관리합니다.
      </p>
    </section>
  )
}
