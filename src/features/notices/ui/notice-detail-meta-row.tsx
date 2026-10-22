type NoticeDetailMetaItem = {
  label: string
  showDividerAfter?: boolean
  value: string
}

type NoticeDetailMetaRowProps = {
  items: NoticeDetailMetaItem[]
}

/** Figma `log` (580:14266) — Body/3-Medium 라벨, Body/3-Regular 값, 그룹 gap 12 */
export function NoticeDetailMetaRow({ items }: NoticeDetailMetaRowProps) {
  return (
    <div className="flex w-full flex-nowrap items-start gap-(--umc-spacing-gap-12) whitespace-nowrap">
      {items.map((item) => (
        <div
          className="flex shrink-0 items-start gap-(--umc-spacing-gap-12)"
          key={item.label}
        >
          <span className="text-body-3-medium text-placeholder leading-normal">
            {item.label}
          </span>
          <span className="text-body-3-regular text-neutral-default-900 leading-normal">
            {item.value}
          </span>
          {item.showDividerAfter ? (
            <span
              aria-hidden
              className="text-body-3-regular text-placeholder leading-normal select-none"
            >
              |
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
