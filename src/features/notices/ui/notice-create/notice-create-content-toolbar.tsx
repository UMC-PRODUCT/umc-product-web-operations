import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  TextIcon,
  UnderlineIcon,
} from "@umc-product/icons"

const TOOLBAR_ITEMS = [
  { Icon: BoldIcon, label: "굵게" },
  { Icon: ItalicIcon, label: "기울임" },
  { Icon: UnderlineIcon, label: "밑줄" },
  { Icon: StrikethroughIcon, label: "취소선" },
  { Icon: TextIcon, label: "글자 크기" },
] as const

type NoticeCreateContentToolbarProps = {
  disabled?: boolean
}

export function NoticeCreateContentToolbar({
  disabled = false,
}: NoticeCreateContentToolbarProps) {
  return (
    <div
      aria-label="본문 서식"
      className="flex items-start gap-0.5 px-1"
      role="toolbar"
    >
      {TOOLBAR_ITEMS.map(({ Icon, label }) => (
        <button
          aria-label={label}
          className="text-icon-neutral-medium-500 hover:text-icon-default rounded-(--umc-radius-6) p-1 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disabled}
          key={label}
          type="button"
        >
          <Icon aria-hidden weight="fill" size={16} />
        </button>
      ))}
    </div>
  )
}
