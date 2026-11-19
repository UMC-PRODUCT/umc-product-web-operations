export type NoticeContentMarkdownFormat =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "list"
  | "blockquote"

export type NoticeContentTextStyle =
  "body" | "heading1" | "heading2" | "heading3"

export type NoticeContentHighlightColor =
  "none" | "purple" | "pink" | "orange" | "mint"

export type NoticeContentMarkdownEditResult = {
  selectionEnd: number
  selectionStart: number
  value: string
}

const WRAP_FORMATS: Record<
  NoticeContentMarkdownFormat,
  {
    after: string
    before: string
    placeholder: string
  }
> = {
  bold: { after: "**", before: "**", placeholder: "굵게" },
  italic: { after: "*", before: "*", placeholder: "기울임" },
  underline: { after: "</u>", before: "<u>", placeholder: "밑줄" },
  strikethrough: { after: "~~", before: "~~", placeholder: "취소선" },
  code: { after: "`", before: "`", placeholder: "코드" },
  list: { after: "", before: "- ", placeholder: "목록" },
  blockquote: { after: "", before: "> ", placeholder: "인용" },
}

const TEXT_STYLE_PREFIX: Record<
  Exclude<NoticeContentTextStyle, "body">,
  string
> = {
  heading1: "# ",
  heading2: "## ",
  heading3: "### ",
}

const HEADING_PREFIX_PATTERN = /^(#{1,3})\s/

export const NOTICE_CONTENT_HIGHLIGHT_SWATCH: Record<
  Exclude<NoticeContentHighlightColor, "none">,
  { bg: string; label: string }
> = {
  purple: { bg: "#e5c7fa", label: "보라" },
  pink: { bg: "#fcc7d1", label: "분홍" },
  orange: { bg: "#ffdbad", label: "주황" },
  mint: { bg: "#b8edeb", label: "민트" },
}

const HIGHLIGHT_MARK_PATTERN =
  /^<mark data-hl="(purple|pink|orange|mint)">([\s\S]*?)<\/mark>/

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

function getBlockRange(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): { blockEnd: number; blockStart: number } {
  const blockStart = value.lastIndexOf("\n", selectionStart - 1) + 1
  const lineBreakAfter = value.indexOf("\n", selectionEnd)
  const blockEnd = lineBreakAfter === -1 ? value.length : lineBreakAfter

  return { blockEnd, blockStart }
}

function transformBlockLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  transformLine: (line: string) => string,
): NoticeContentMarkdownEditResult {
  const { blockEnd, blockStart } = getBlockRange(
    value,
    selectionStart,
    selectionEnd,
  )
  const block = value.slice(blockStart, blockEnd)
  const lines = block.split("\n")
  const nextLines = lines.map(transformLine)
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

function stripLinePrefixes(line: string, prefixes: string[]) {
  for (const prefix of prefixes) {
    if (line.startsWith(prefix)) {
      return line.slice(prefix.length)
    }
  }
  return line
}

function applyLinePrefixFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
): NoticeContentMarkdownEditResult {
  return transformBlockLines(value, selectionStart, selectionEnd, (line) => {
    const stripped = stripLinePrefixes(line, ["> ", "- "])
    return stripped.startsWith(prefix) ? stripped : `${prefix}${stripped}`
  })
}

function applyTextStyleToBlock(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  style: NoticeContentTextStyle,
): NoticeContentMarkdownEditResult {
  return transformBlockLines(value, selectionStart, selectionEnd, (line) => {
    const content = line.replace(HEADING_PREFIX_PATTERN, "")

    if (style === "body") {
      return content
    }

    return `${TEXT_STYLE_PREFIX[style]}${content}`
  })
}

function applyHighlight(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  color: NoticeContentHighlightColor,
): NoticeContentMarkdownEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length))
  const end = Math.max(start, Math.min(selectionEnd, value.length))
  const selected = value.slice(start, end)

  if (color === "none") {
    const unwrapped = selected.replace(
      /<mark data-hl="(?:purple|pink|orange|mint)">([\s\S]*?)<\/mark>/g,
      "$1",
    )
    const nextValue = value.slice(0, start) + unwrapped + value.slice(end)

    return {
      selectionEnd: start + unwrapped.length,
      selectionStart: start,
      value: nextValue,
    }
  }

  const inner =
    selected.length > 0
      ? selected.replace(
          HIGHLIGHT_MARK_PATTERN,
          (_match, _color: string, content: string) => content,
        )
      : "하이라이트"
  const before = `<mark data-hl="${color}">`
  const after = "</mark>"

  return wrapSelection(value, start, end, before, after, inner)
}

export function applyNoticeContentMarkdownFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: NoticeContentMarkdownFormat,
): NoticeContentMarkdownEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length))
  const end = Math.max(start, Math.min(selectionEnd, value.length))

  if (format === "list" || format === "blockquote") {
    const { before } = WRAP_FORMATS[format]
    return applyLinePrefixFormat(value, start, end, before)
  }

  const { after, before, placeholder } = WRAP_FORMATS[format]
  return wrapSelection(value, start, end, before, after, placeholder)
}

export function applyNoticeContentTextStyle(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  style: NoticeContentTextStyle,
): NoticeContentMarkdownEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length))
  const end = Math.max(start, Math.min(selectionEnd, value.length))

  return applyTextStyleToBlock(value, start, end, style)
}

export function applyNoticeContentHighlightColor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  color: NoticeContentHighlightColor,
): NoticeContentMarkdownEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length))
  const end = Math.max(start, Math.min(selectionEnd, value.length))

  return applyHighlight(value, start, end, color)
}

const HIGHLIGHT_AT_INDEX_PATTERN =
  /<mark data-hl="(purple|pink|orange|mint)">([\s\S]*?)<\/mark>/g

function getLineAtIndex(value: string, index: number): string {
  const safeIndex = Math.max(0, Math.min(index, value.length))
  const lineStart = value.lastIndexOf("\n", safeIndex - 1) + 1
  const lineBreakAfter = value.indexOf("\n", safeIndex)
  const lineEnd = lineBreakAfter === -1 ? value.length : lineBreakAfter

  return value.slice(lineStart, lineEnd)
}

/** 커서가 있는 줄의 블록 제목 접두를 툴바 표시용 스타일로 반환 */
export function getNoticeContentTextStyleAtIndex(
  value: string,
  index: number,
): NoticeContentTextStyle {
  const line = getLineAtIndex(value, index)
  const headingMatch = line.match(/^(#{1,3})\s*(.*)$/)

  if (!headingMatch) {
    return "body"
  }

  const level = headingMatch[1]?.length ?? 0
  if (level === 1) {
    return "heading1"
  }
  if (level === 2) {
    return "heading2"
  }
  return "heading3"
}

/** 커서가 하이라이트 마크업 안이면 해당 색, 아니면 없음 */
export function getNoticeContentHighlightAtIndex(
  value: string,
  index: number,
): NoticeContentHighlightColor {
  const safeIndex = Math.max(0, Math.min(index, value.length))
  const pattern = new RegExp(HIGHLIGHT_AT_INDEX_PATTERN.source, "g")
  let match: RegExpExecArray | null = pattern.exec(value)

  while (match !== null) {
    const openTagEnd = match.index + match[0].indexOf(">") + 1
    const closeTagStart = match.index + match[0].lastIndexOf("</mark>")

    if (safeIndex >= openTagEnd && safeIndex <= closeTagStart) {
      return match[1] as NoticeContentHighlightColor
    }

    match = pattern.exec(value)
  }

  return "none"
}
