import {
  BoldIcon,
  CheckIcon,
  ExpandMoreIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "@umc-product/icons"
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"

import {
  NOTICE_CONTENT_HIGHLIGHT_SWATCH,
  type NoticeContentHighlightColor,
  type NoticeContentMarkdownFormat,
  type NoticeContentTextStyle,
} from "../../model/notice-content-markdown"
import NoticeContentCodeIcon from "./assets/notice-content-code-icon.svg?react"
import NoticeContentHighlightNoneIcon from "./assets/notice-content-highlight-none-icon.svg?react"
import NoticeContentListIcon from "./assets/notice-content-list-icon.svg?react"
import NoticeContentQuoteIcon from "./assets/notice-content-quote-icon.svg?react"

const TOOLBAR_DROPDOWN_MIN_WIDTH_PX = 160

const FORMAT_ITEMS: {
  format: NoticeContentMarkdownFormat
  Icon: typeof BoldIcon
  label: string
}[] = [
  { format: "bold", Icon: BoldIcon, label: "굵게" },
  { format: "italic", Icon: ItalicIcon, label: "기울임" },
  { format: "underline", Icon: UnderlineIcon, label: "밑줄" },
  { format: "strikethrough", Icon: StrikethroughIcon, label: "취소선" },
]

const TEXT_STYLE_ITEMS: {
  label: string
  previewClassName: string
  style: NoticeContentTextStyle
}[] = [
  {
    label: "제목 1",
    previewClassName: "text-heading-2-semibold",
    style: "heading1",
  },
  {
    label: "제목 2",
    previewClassName: "text-title-2-semibold",
    style: "heading2",
  },
  {
    label: "제목 3",
    previewClassName: "text-title-3-semibold",
    style: "heading3",
  },
  {
    label: "본문",
    previewClassName: "text-label-2-semibold",
    style: "body",
  },
]

const HIGHLIGHT_ITEMS: {
  color: NoticeContentHighlightColor
  label: string
}[] = [
  { color: "purple", label: "보라" },
  { color: "pink", label: "분홍" },
  { color: "orange", label: "주황" },
  { color: "mint", label: "민트" },
  { color: "blue", label: "파랑" },
  { color: "none", label: "없음" },
]

/** Figma TextOption — Hover: Semantic Fill/Neutral Weaker-Hover(Pressed) */
const TOOLBAR_ICON_BUTTON_CLASS = cn(
  "inline-flex shrink-0 items-center justify-center rounded-(--umc-radius-6) p-1",
  "text-icon-neutral-medium-500",
  "hover:bg-fill-neutral-weaker-hover-pressed",
  "active:bg-fill-neutral-weaker-hover-pressed",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--umc-color-border-primary-strong-500)",
)

const TOOLBAR_OPTION_TRIGGER_CLASS = cn(
  "inline-flex shrink-0 items-center gap-1.5 rounded-(--umc-radius-6) py-1 pl-2 pr-1.5",
  "text-body-3-regular text-neutral-medium-600",
  "hover:bg-fill-neutral-weaker-hover-pressed",
  "active:bg-fill-neutral-weaker-hover-pressed",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--umc-color-border-primary-strong-500)",
)

function ToolbarVerticalDivider() {
  return (
    <div
      aria-hidden
      className="border-neutral-disabled box-border w-0 shrink-0 self-stretch border-0 border-l"
      role="separator"
    />
  )
}

type NoticeCreateContentToolbarProps = {
  disabled?: boolean
  highlightAtCaret: NoticeContentHighlightColor
  onFormat: (format: NoticeContentMarkdownFormat) => void
  onHighlight: (color: NoticeContentHighlightColor) => void
  onTextStyle: (style: NoticeContentTextStyle) => void
  textStyleAtCaret: NoticeContentTextStyle
}

type ToolbarDropdownItem<T extends string> = {
  id: T
  label: ReactNode
  onSelect: () => void
  selected: boolean
}

type ToolbarDropdownProps<T extends string> = {
  anchorRef: RefObject<HTMLButtonElement | null>
  disabled?: boolean
  items: ToolbarDropdownItem<T>[]
  listboxId: string
  onClose: () => void
  open: boolean
}

function ToolbarDropdownListItem<T extends string>({
  highlighted,
  item,
  onHighlight,
  onSelect,
}: {
  highlighted: boolean
  item: ToolbarDropdownItem<T>
  onHighlight: () => void
  onSelect: () => void
}) {
  return (
    <button
      aria-selected={item.selected}
      className="umc-dropdown-item"
      data-highlighted={highlighted ? true : undefined}
      data-selected={item.selected ? true : undefined}
      data-size="sm"
      onClick={onSelect}
      onMouseEnter={onHighlight}
      role="option"
      type="button"
    >
      <span className="umc-dropdown-item__content">{item.label}</span>
      {item.selected ? (
        <span aria-hidden className="umc-dropdown-item__indicator">
          <CheckIcon size={16} weight="regular" />
        </span>
      ) : null}
    </button>
  )
}

function ToolbarDropdown<T extends string>({
  anchorRef,
  disabled,
  items,
  listboxId,
  onClose,
  open,
}: ToolbarDropdownProps<T>) {
  const positionerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  })
  const [anchorWidth, setAnchorWidth] = useState(TOOLBAR_DROPDOWN_MIN_WIDTH_PX)
  const [highlightedId, setHighlightedId] = useState<T | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    const anchor = anchorRef.current
    const positioner = positionerRef.current
    if (!anchor) {
      return
    }

    const anchorRect = anchor.getBoundingClientRect()
    const popupWidth = Math.max(anchorRect.width, TOOLBAR_DROPDOWN_MIN_WIDTH_PX)
    setAnchorWidth(popupWidth)

    const panelHeight = positioner?.getBoundingClientRect().height ?? 0
    const pad = 8
    let left = anchorRect.left
    let top = anchorRect.bottom + 4

    left = Math.min(left, window.innerWidth - popupWidth - pad)
    left = Math.max(pad, left)

    if (panelHeight > 0) {
      top = Math.min(top, window.innerHeight - panelHeight - pad)
      top = Math.max(pad, top)
    }

    setPosition({ left, top })
  }, [anchorRef, items.length, open])

  useEffect(() => {
    if (!open) {
      setHighlightedId(null)
      return
    }

    const selected = items.find((item) => item.selected)
    setHighlightedId(selected?.id ?? items[0]?.id ?? null)

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (positionerRef.current?.contains(target)) {
        return
      }
      if (anchorRef.current?.contains(target)) {
        return
      }
      onClose()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [anchorRef, items, onClose, open])

  if (!open || disabled) {
    return null
  }

  return createPortal(
    <div
      className="umc-dropdown-list__positioner"
      ref={positionerRef}
      style={{
        left: position.left,
        position: "fixed",
        top: position.top,
      }}
    >
      <div
        className="umc-dropdown-list umc-select__popup"
        style={
          {
            "--anchor-width": `${anchorWidth}px`,
            minWidth: TOOLBAR_DROPDOWN_MIN_WIDTH_PX,
          } as CSSProperties
        }
      >
        <div
          aria-labelledby={listboxId}
          className="umc-select__list"
          id={listboxId}
          role="listbox"
        >
          {items.map((item) => (
            <ToolbarDropdownListItem
              highlighted={highlightedId === item.id}
              item={item}
              key={item.id}
              onHighlight={() => {
                setHighlightedId(item.id)
              }}
              onSelect={() => {
                item.onSelect()
                onClose()
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function NoticeCreateContentToolbar({
  disabled = false,
  highlightAtCaret,
  onFormat,
  onHighlight,
  onTextStyle,
  textStyleAtCaret,
}: NoticeCreateContentToolbarProps) {
  const textStyleTriggerRef = useRef<HTMLButtonElement>(null)
  const highlightTriggerRef = useRef<HTMLButtonElement>(null)
  const [textStyleOpen, setTextStyleOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [selectedTextStyle, setSelectedTextStyle] =
    useState<NoticeContentTextStyle>(textStyleAtCaret)
  const [selectedHighlight, setSelectedHighlight] =
    useState<NoticeContentHighlightColor>(highlightAtCaret)
  const toolbarId = useId()

  useEffect(() => {
    setSelectedTextStyle(textStyleAtCaret)
  }, [textStyleAtCaret])

  useEffect(() => {
    setSelectedHighlight(highlightAtCaret)
  }, [highlightAtCaret])
  const textStyleListboxId = `${toolbarId}-text-style`
  const highlightListboxId = `${toolbarId}-highlight`

  const selectedTextStyleLabel =
    TEXT_STYLE_ITEMS.find((item) => item.style === selectedTextStyle)?.label ??
    "본문"

  const selectedHighlightSwatch =
    selectedHighlight === "none"
      ? null
      : NOTICE_CONTENT_HIGHLIGHT_SWATCH[selectedHighlight].bg

  const handleTextStyleSelect = useCallback(
    (style: NoticeContentTextStyle) => {
      onTextStyle(style)
    },
    [onTextStyle],
  )

  const handleHighlightSelect = useCallback(
    (color: NoticeContentHighlightColor) => {
      onHighlight(color)
    },
    [onHighlight],
  )

  return (
    <div
      aria-label="본문 서식"
      className={cn(
        "border-neutral-disabled flex w-full flex-col rounded-(--umc-radius-8) border border-solid py-1",
      )}
      id={toolbarId}
      role="toolbar"
    >
      <div className="flex min-h-[29px] items-stretch gap-(--umc-spacing-gap-4) px-(--umc-spacing-padding-4)">
        <button
          aria-controls={textStyleOpen ? textStyleListboxId : undefined}
          aria-expanded={textStyleOpen}
          aria-haspopup="listbox"
          aria-label="텍스트 스타일"
          className={cn(TOOLBAR_OPTION_TRIGGER_CLASS, "self-center")}
          disabled={disabled}
          id={`${toolbarId}-text-style-trigger`}
          onClick={() => {
            setHighlightOpen(false)
            setTextStyleOpen((isOpen) => !isOpen)
          }}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          ref={textStyleTriggerRef}
          type="button"
        >
          <span>{selectedTextStyleLabel}</span>
          <ExpandMoreIcon aria-hidden size={16} />
        </button>

        <ToolbarVerticalDivider />

        <button
          aria-controls={highlightOpen ? highlightListboxId : undefined}
          aria-expanded={highlightOpen}
          aria-haspopup="listbox"
          aria-label="배경 색"
          className={cn(TOOLBAR_OPTION_TRIGGER_CLASS, "self-center")}
          disabled={disabled}
          id={`${toolbarId}-highlight-trigger`}
          onClick={() => {
            setTextStyleOpen(false)
            setHighlightOpen((isOpen) => !isOpen)
          }}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          ref={highlightTriggerRef}
          type="button"
        >
          {selectedHighlightSwatch ? (
            <span
              aria-hidden
              className="size-3.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: selectedHighlightSwatch }}
            />
          ) : (
            <NoticeContentHighlightNoneIcon
              aria-hidden
              className="size-3.5 shrink-0"
            />
          )}
          <span>배경</span>
          <ExpandMoreIcon aria-hidden size={16} />
        </button>

        <ToolbarVerticalDivider />

        <div className="flex items-center gap-(--umc-spacing-gap-2) self-center px-(--umc-spacing-padding-2)">
          {FORMAT_ITEMS.map(({ format, Icon, label }) => (
            <button
              aria-label={label}
              className={TOOLBAR_ICON_BUTTON_CLASS}
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
          <button
            aria-label="코드"
            className={TOOLBAR_ICON_BUTTON_CLASS}
            disabled={disabled}
            onClick={() => {
              onFormat("code")
            }}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            type="button"
          >
            <NoticeContentCodeIcon aria-hidden className="size-4" />
          </button>
        </div>

        <ToolbarVerticalDivider />

        <div className="flex items-center gap-(--umc-spacing-gap-4) self-center px-(--umc-spacing-padding-2)">
          <button
            aria-label="목록"
            className={TOOLBAR_ICON_BUTTON_CLASS}
            disabled={disabled}
            onClick={() => {
              onFormat("list")
            }}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            type="button"
          >
            <NoticeContentListIcon aria-hidden className="size-4" />
          </button>
          <button
            aria-label="인용"
            className={TOOLBAR_ICON_BUTTON_CLASS}
            disabled={disabled}
            onClick={() => {
              onFormat("blockquote")
            }}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            type="button"
          >
            <NoticeContentQuoteIcon aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      <ToolbarDropdown
        anchorRef={textStyleTriggerRef}
        disabled={disabled}
        items={TEXT_STYLE_ITEMS.map((item) => ({
          id: item.style,
          label: (
            <span
              className={cn("text-neutral-defult-900", item.previewClassName)}
            >
              {item.label}
            </span>
          ),
          onSelect: () => {
            handleTextStyleSelect(item.style)
          },
          selected: item.style === selectedTextStyle,
        }))}
        listboxId={textStyleListboxId}
        onClose={() => {
          setTextStyleOpen(false)
        }}
        open={textStyleOpen}
      />

      <ToolbarDropdown
        anchorRef={highlightTriggerRef}
        disabled={disabled}
        items={HIGHLIGHT_ITEMS.map((item) => ({
          id: item.color,
          label:
            item.color === "none" ? (
              item.label
            ) : (
              <span
                className="text-body-2-regular text-neutral-default-900 inline-flex px-1"
                style={{
                  backgroundColor:
                    NOTICE_CONTENT_HIGHLIGHT_SWATCH[item.color].bg,
                }}
              >
                {item.label}
              </span>
            ),
          onSelect: () => {
            handleHighlightSelect(item.color)
          },
          selected: item.color === selectedHighlight,
        }))}
        listboxId={highlightListboxId}
        onClose={() => {
          setHighlightOpen(false)
        }}
        open={highlightOpen}
      />
    </div>
  )
}
