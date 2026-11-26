export type NoticeContentMarkdownFormat =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "list"
  | "dashList"
  | "numberedList"
  | "blockquote"

/** iOS 대시 목록 접두 — EN DASH (U+2013) + 공백 */
export const NOTICE_CONTENT_DASH_LIST_PREFIX = "\u2013 "

export type NoticeContentTextStyle =
  "body" | "heading1" | "heading2" | "heading3"

export type NoticeContentHighlightColor =
  "none" | "purple" | "pink" | "orange" | "mint" | "blue"

type NoticeContentHighlightPaletteColor = Exclude<
  NoticeContentHighlightColor,
  "none"
>

/** iOS SSOT — sRGB `R,G,B,A` (소수 3자리), opacity 0.35 */
export const NOTICE_CONTENT_HIGHLIGHT_IOS_SRGB: Record<
  Exclude<NoticeContentHighlightColor, "none">,
  string
> = {
  purple: "0.686,0.322,0.871,0.350",
  pink: "1.000,0.176,0.333,0.350",
  orange: "1.000,0.584,0.000,0.350",
  mint: "0.000,0.780,0.745,0.350",
  blue: "0.000,0.478,1.000,0.350",
}

/** 툴바·상세 렌더 배경 (iOS 팔레트와 동일 rgba) */
export const NOTICE_CONTENT_HIGHLIGHT_SWATCH: Record<
  Exclude<NoticeContentHighlightColor, "none">,
  { bg: string; label: string }
> = {
  purple: { bg: "rgba(175, 82, 222, 0.35)", label: "보라" },
  pink: { bg: "rgba(255, 45, 85, 0.35)", label: "분홍" },
  orange: { bg: "rgba(255, 149, 0, 0.35)", label: "주황" },
  mint: { bg: "rgba(0, 199, 190, 0.35)", label: "민트" },
  blue: { bg: "rgba(0, 122, 255, 0.35)", label: "파랑" },
}

/** `color` 속성 누락·형식 오류 시 iOS fallback */
export const NOTICE_CONTENT_HIGHLIGHT_MARK_FALLBACK_BG =
  "rgba(255, 255, 0, 0.4)"

const NOTICE_CONTENT_HIGHLIGHT_COLOR_KEYS = Object.keys(
  NOTICE_CONTENT_HIGHLIGHT_IOS_SRGB,
) as Exclude<NoticeContentHighlightColor, "none">[]

const LEGACY_HIGHLIGHT_DATA_HL_PATTERN =
  /<mark\s+data-hl="(purple|pink|orange|mint|blue)">([\s\S]*?)<\/mark>/g

const HIGHLIGHT_MARK_COLOR_PATTERN =
  /<mark\s+color="([^"]*)">([\s\S]*?)<\/mark>/g

const ANY_HIGHLIGHT_MARK_PATTERN =
  /<mark(?:\s+color="[^"]*"|\s+data-hl="(?:purple|pink|orange|mint|blue)")>([\s\S]*?)<\/mark>/g

export function formatNoticeContentHighlightMarkOpen(
  color: Exclude<NoticeContentHighlightColor, "none">,
): string {
  return `<mark color="${NOTICE_CONTENT_HIGHLIGHT_IOS_SRGB[color]}">`
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** iOS: `color="R,G,B,A"` → CSS rgba (clamp [0,1]) */
export function noticeContentHighlightColorAttrToCss(
  colorAttr: string,
): string {
  const parts = colorAttr
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return NOTICE_CONTENT_HIGHLIGHT_MARK_FALLBACK_BG
  }

  const [rawR, rawG, rawB, a] = parts.map(clampUnit)
  const r = rawR ?? 0
  const g = rawG ?? 0
  const b = rawB ?? 0
  const red = Math.round(r * 255)
  const green = Math.round(g * 255)
  const blue = Math.round(b * 255)

  return `rgba(${red}, ${green}, ${blue}, ${a})`
}

export function resolveNoticeContentHighlightKeyFromMark(
  colorAttr: string | undefined,
  dataHl: string | undefined,
): NoticeContentHighlightPaletteColor | null {
  if (dataHl != null && dataHl.length > 0) {
    if (
      NOTICE_CONTENT_HIGHLIGHT_COLOR_KEYS.includes(
        dataHl as NoticeContentHighlightPaletteColor,
      )
    ) {
      return dataHl as NoticeContentHighlightPaletteColor
    }
    return null
  }

  if (colorAttr == null || colorAttr.trim() === "") {
    return null
  }

  const normalized = colorAttr.trim()
  const matchedKey = NOTICE_CONTENT_HIGHLIGHT_COLOR_KEYS.find(
    (key) => NOTICE_CONTENT_HIGHLIGHT_IOS_SRGB[key] === normalized,
  )
  return matchedKey ?? null
}

export function resolveNoticeContentHighlightCssFromMark(
  colorAttr: string | undefined,
  dataHl: string | undefined,
): string {
  const key = resolveNoticeContentHighlightKeyFromMark(colorAttr, dataHl)
  if (key != null) {
    const swatch = NOTICE_CONTENT_HIGHLIGHT_SWATCH[key]
    return swatch.bg
  }
  if (colorAttr != null && colorAttr.trim() !== "") {
    return noticeContentHighlightColorAttrToCss(colorAttr)
  }
  return NOTICE_CONTENT_HIGHLIGHT_MARK_FALLBACK_BG
}

const NOTICE_CONTENT_ALLOWED_LINK_SCHEME_PATTERN = /^(https?|mailto|tel):/i

/** iOS — `[라벨](url)` 허용 스킴 */
export function isNoticeContentAllowedInlineLinkUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!NOTICE_CONTENT_ALLOWED_LINK_SCHEME_PATTERN.test(trimmed)) {
    return false
  }
  if (/^https?:/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }
  return true
}

/** 상세 본문 plain text 구간의 URL 자동 링크 */
export const NOTICE_CONTENT_PLAIN_URL_GLOBAL =
  /(https?:\/\/[^\s<]+|mailto:[^\s<]+|tel:[^\s<]+)/gi

export function trimNoticeContentPlainUrlTrailingPunctuation(
  url: string,
): string {
  return url.replace(/[.,;:!?)]+$/g, "")
}

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
  dashList: {
    after: "",
    before: NOTICE_CONTENT_DASH_LIST_PREFIX,
    placeholder: "대시",
  },
  numberedList: { after: "", before: "1. ", placeholder: "번호" },
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

const HEADING_PREFIX_PATTERN = /^(#{1,3})\s+/
const NUMBERED_LIST_LINE_PATTERN = /^(\d+)\.\s+(.*)$/

/** iOS plain text unescape — `\` + 아래 문자만 해제 (`C:\Users` 등 보존) */
const NOTICE_CONTENT_PLAIN_UNESCAPE_PATTERN = /\\([\\ *_[\]()~`<>#.\u2013-])/g

function splitSelectionEdgeWhitespace(selected: string): {
  core: string
  leading: string
  trailing: string
} {
  const leading = selected.match(/^\s*/)?.[0] ?? ""
  const withoutLeading = selected.slice(leading.length)
  const trailing = withoutLeading.match(/\s*$/)?.[0] ?? ""
  const core = withoutLeading.slice(0, withoutLeading.length - trailing.length)

  return { core, leading, trailing }
}

export function unescapeNoticeContentPlainTextSegment(segment: string): string {
  return segment.replace(NOTICE_CONTENT_PLAIN_UNESCAPE_PATTERN, "$1")
}

/** 코드 스팬 내부 — 모든 `\x` → `x` */
export function unescapeNoticeContentCodeSpan(segment: string): string {
  return segment.replace(/\\(.)/g, "$1")
}

/**
 * iOS 읽기 레거시 — `**`/`~~` 닫는 마커 직전 공백을 바깥으로 (`*`/`_` 단독은 제외).
 */
export function normalizeNoticeContentLegacyWhitespaceMarkers(
  text: string,
): string {
  return text
    .replace(/(?<!\\)\*\*((?:\\.|[^*])+?)\s+(?<!\\)\*\*/g, "**$1** ")
    .replace(/(?<!\\)~~((?:\\.|[^~])+?)\s+(?<!\\)~~/g, "~~$1~~ ")
    .replace(/(?<!\\)\*\*\s+(?<!\\)\*\*/g, " ")
    .replace(/(?<!\\)~~\s+(?<!\\)~~/g, " ")
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
  const { core, leading, trailing } = splitSelectionEdgeWhitespace(selected)

  if (selected.length > 0 && core.length === 0) {
    return {
      selectionEnd: selectionEnd,
      selectionStart: selectionStart,
      value,
    }
  }

  const inner = core.length > 0 ? core : placeholder
  const wrapped = before + inner + after
  const nextValue =
    value.slice(0, selectionStart) +
    leading +
    wrapped +
    trailing +
    value.slice(selectionEnd)
  const nextStart = selectionStart + leading.length + before.length
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

function stripBlockLinePrefixes(line: string): string {
  let content = line
  if (content.startsWith("> ")) {
    content = content.slice(2)
  }
  const numbered = content.match(NUMBERED_LIST_LINE_PATTERN)
  if (numbered) {
    content = numbered[2] ?? ""
  }
  if (content.startsWith("- ")) {
    content = content.slice(2)
  }
  if (content.startsWith(NOTICE_CONTENT_DASH_LIST_PREFIX)) {
    content = content.slice(NOTICE_CONTENT_DASH_LIST_PREFIX.length)
  }
  return content
}

function applyLinePrefixFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
): NoticeContentMarkdownEditResult {
  return transformBlockLines(value, selectionStart, selectionEnd, (line) => {
    const stripped = stripBlockLinePrefixes(line)
    return stripped.startsWith(prefix) ? stripped : `${prefix}${stripped}`
  })
}

function applyNumberedListFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): NoticeContentMarkdownEditResult {
  let itemNumber = 1
  return transformBlockLines(value, selectionStart, selectionEnd, (line) => {
    const stripped = stripBlockLinePrefixes(line)
    const next = `${itemNumber}. ${stripped}`
    itemNumber += 1
    return next
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
    const unwrapped = selected
      .replace(HIGHLIGHT_MARK_COLOR_PATTERN, "$2")
      .replace(LEGACY_HIGHLIGHT_DATA_HL_PATTERN, "$2")
    const nextValue = value.slice(0, start) + unwrapped + value.slice(end)

    return {
      selectionEnd: start + unwrapped.length,
      selectionStart: start,
      value: nextValue,
    }
  }

  const inner =
    selected.length > 0
      ? selected.replace(ANY_HIGHLIGHT_MARK_PATTERN, "$1")
      : "하이라이트"
  const before = formatNoticeContentHighlightMarkOpen(color)
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

  if (format === "numberedList") {
    return applyNumberedListFormat(value, start, end)
  }

  if (format === "list" || format === "dashList" || format === "blockquote") {
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

type HighlightMarkSpan = {
  closeTagStart: number
  colorAttr?: string
  dataHl?: string
  index: number
  length: number
  openTagEnd: number
}

function findHighlightMarkSpans(value: string): HighlightMarkSpan[] {
  const spans: HighlightMarkSpan[] = []

  const colorPattern = new RegExp(HIGHLIGHT_MARK_COLOR_PATTERN.source, "g")
  let colorMatch: RegExpExecArray | null = colorPattern.exec(value)
  while (colorMatch !== null) {
    const full = colorMatch[0]
    const openTagEnd = colorMatch.index + full.indexOf(">") + 1
    const closeTagStart = colorMatch.index + full.lastIndexOf("</mark>")
    spans.push({
      closeTagStart,
      colorAttr: colorMatch[1],
      index: colorMatch.index,
      length: full.length,
      openTagEnd,
    })
    colorMatch = colorPattern.exec(value)
  }

  const legacyPattern = new RegExp(LEGACY_HIGHLIGHT_DATA_HL_PATTERN.source, "g")
  let legacyMatch: RegExpExecArray | null = legacyPattern.exec(value)
  while (legacyMatch !== null) {
    const full = legacyMatch[0]
    const openTagEnd = legacyMatch.index + full.indexOf(">") + 1
    const closeTagStart = legacyMatch.index + full.lastIndexOf("</mark>")
    spans.push({
      closeTagStart,
      dataHl: legacyMatch[1],
      index: legacyMatch.index,
      length: full.length,
      openTagEnd,
    })
    legacyMatch = legacyPattern.exec(value)
  }

  return spans.sort((a, b) => a.index - b.index)
}

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
  const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)

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

  for (const span of findHighlightMarkSpans(value)) {
    if (safeIndex >= span.openTagEnd && safeIndex <= span.closeTagStart) {
      const key = resolveNoticeContentHighlightKeyFromMark(
        span.colorAttr,
        span.dataHl,
      )
      return key ?? "none"
    }
  }

  return "none"
}
