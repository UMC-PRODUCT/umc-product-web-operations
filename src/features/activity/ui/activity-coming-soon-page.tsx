type ActivityComingSoonPageProps = {
  title: string
  description?: string
}

export function ActivityComingSoonPage({
  title,
  description = "곧 제공될 예정이에요",
}: ActivityComingSoonPageProps) {
  return (
    <section className="flex flex-col gap-(--umc-spacing-gap-12) pl-(--umc-spacing-padding-12)">
      <h1 className="text-heading-2-semibold text-neutral-default-900">
        {title}
      </h1>
      <p className="text-body-3-regular text-neutral-medium-600">
        {description}
      </p>
    </section>
  )
}
