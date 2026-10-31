import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  TextIcon,
  UnderlineIcon,
} from "@umc-product/icons"

import { cn } from "@/shared/lib/cn"

import type { NoticeContentMarkdownFormat } from "../../model/notice-content-markdown"

const TOOLBAR_ITEMS: {
  format: NoticeContentMarkdownFormat
  Icon: typeof BoldIcon
  label: string
}[] = [
  { format: "bold", Icon: BoldIcon, label: "굵게" },
  { format: "italic", Icon: ItalicIcon, label: "기울임" },
  { format: "underline", Icon: UnderlineIcon, label: "밑줄" },
  { format: "strikethrough", Icon: StrikethroughIcon, label: "취소선" },
  { format: "heading", Icon: TextIcon, label: "글자 크기" },
]

/** Figma TextOption — Hover: Semantic Fill/Neutral Weaker-Hover(Pressed) */
const TOOLBAR_FORMAT_BUTTON_CLASS = cn(
  "inline-flex shrink-0 items-center justify-center rounded-(--umc-radius-6) p-1",
  "text-icon-neutral-medium-500",
  "hover:bg-fill-neutral-weaker-hover-pressed",
  "active:bg-fill-neutral-weaker-hover-pressed",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--umc-color-border-primary-strong-500)",
)

type NoticeCreateContentToolbarProps = {
  disabled?: boolean
  onFormat: (format: NoticeContentMarkdownFormat) => void
}

export function NoticeCreateContentToolbar({
  disabled = false,
  onFormat,
}: NoticeCreateContentToolbarProps) {
  return (
    <div
      aria-label="본문 서식"
      className="flex items-start gap-0.5 px-1"
      role="toolbar"
    >
      {TOOLBAR_ITEMS.map(({ format, Icon, label }) => (
        <button
          aria-label={label}
          className={TOOLBAR_FORMAT_BUTTON_CLASS}
          disabled={disabled}
          key={format}
          onClick={() => {
            onFormat(format)
          }}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          type="button"
        >
          <Icon aria-hidden weight="fill" size={16} />
        </button>
      ))}
    </div>
  )
}
