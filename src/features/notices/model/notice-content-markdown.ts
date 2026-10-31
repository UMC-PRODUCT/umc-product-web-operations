export type NoticeContentMarkdownFormat =
  "bold" | "italic" | "underline" | "strikethrough" | "heading"

export type NoticeContentMarkdownEditResult = {
  selectionEnd: number
  selectionStart: number
  value: string
}

const WRAP_FORMATS: Record<
  Exclude<NoticeContentMarkdownFormat, "heading">,
  { after: string; before: string; placeholder: string }
> = {
  bold: { after: "**", before: "**", placeholder: "굵게" },
  italic: { after: "*", before: "*", placeholder: "기울임" },
  underline: { after: "</u>", before: "<u>", placeholder: "밑줄" },
  strikethrough: { after: "~~", before: "~~", placeholder: "취소선" },
}

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
  placeholder: string,
): NoticeContentMarkdownEditResult {
  const selected = value.slice(selectionStart, selectionEnd)
  const inner = selected.length > 0 ? selected : placeholder
  const nextValue =
    value.slice(0, selectionStart) +
    before +
    inner +
    after +
    value.slice(selectionEnd)
  const nextStart = selectionStart + before.length
  const nextEnd = nextStart + inner.length

  return {
    selectionEnd: nextEnd,
    selectionStart: nextStart,
    value: nextValue,
  }
}

function toggleHeadingPrefix(
  value: string,
  selectionStart: number,
  selectionEnd: number,
) {
  const blockStart = value.lastIndexOf("\n", selectionStart - 1) + 1
  const lineBreakAfter = value.indexOf("\n", selectionEnd)
  const blockEnd = lineBreakAfter === -1 ? value.length : lineBreakAfter
  const block = value.slice(blockStart, blockEnd)
  const lines = block.split("\n")
  const allHeading = lines.every((line) => line.startsWith("# "))
  const nextLines = lines.map((line) => {
    if (allHeading) {
      return line.startsWith("# ") ? line.slice(2) : line
    }
    return line.startsWith("# ") ? line : `# ${line}`
  })
  const nextBlock = nextLines.join("\n")
  const nextValue =
    value.slice(0, blockStart) + nextBlock + value.slice(blockEnd)
  const delta = nextBlock.length - block.length

  return {
    selectionEnd: selectionEnd + delta,
    selectionStart: selectionStart,
    value: nextValue,
  }
}

export function applyNoticeContentMarkdownFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: NoticeContentMarkdownFormat,
): NoticeContentMarkdownEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length))
  const end = Math.max(start, Math.min(selectionEnd, value.length))

  if (format === "heading") {
    return toggleHeadingPrefix(value, start, end)
  }

  const { after, before, placeholder } = WRAP_FORMATS[format]
  return wrapSelection(value, start, end, before, after, placeholder)
}
