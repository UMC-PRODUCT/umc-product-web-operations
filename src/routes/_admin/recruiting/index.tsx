import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/recruiting/")({
  component: RecruitingPage,
})

function RecruitingPage() {
  return (
    <section className="flex flex-col gap-2">
      <p className="text-teal-grey-600 text-sm">
        리크루팅 메뉴 플레이스홀더입니다.
      </p>
    </section>
  )
}
