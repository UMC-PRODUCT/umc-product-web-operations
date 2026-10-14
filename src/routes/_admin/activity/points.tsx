import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/activity/points")({
  component: PointsPage,
})

function PointsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">상벌점 관리</h1>
      <p className="text-teal-grey-600 text-sm">
        상벌점을 조회하고 관리합니다.
      </p>
    </section>
  )
}
