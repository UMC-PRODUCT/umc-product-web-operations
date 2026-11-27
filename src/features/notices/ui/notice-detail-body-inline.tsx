import { Fragment, type ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

import {
  isNoticeContentAllowedInlineLinkUrl,
  normalizeNoticeContentLegacyWhitespaceMarkers,
  NOTICE_CONTENT_DASH_LIST_PREFIX,
  NOTICE_CONTENT_PLAIN_URL_GLOBAL,
  resolveNoticeContentHighlightCssFromMark,
  trimNoticeContentPlainUrlTrailingPunctuation,
  unescapeNoticeContentCodeSpan,
  unescapeNoticeContentPlainTextSegment,
} from "../model/notice-content-markdown"

const INLINE_LINK_CLASS =
  "text-neutral-default-900 underline underline-offset-2"

type InlinePattern = {
  contentGroupIndex?: number
  match: (text: string) => RegExpMatchArray | null
  render: (content: string, key: string, match: RegExpMatchArray) => ReactNode
}

const HIGHLIGHT_MARK_COLOR_PATTERN =
  /^(?<!\\)<mark color="([^"]*)">([\s\S]*?)<\/mark>/

const HIGHLIGHT_MARK_LEGACY_PATTERN =
  /^(?<!\\)<mark data-hl="(purple|pink|orange|mint|blue)">([\s\S]*?)<\/mark>/

function matchHighlightMark(text: string): RegExpMatchArray | null {
  return (
    text.match(HIGHLIGHT_MARK_COLOR_PATTERN) ??
    text.match(HIGHLIGHT_MARK_LEGACY_PATTERN)
  )
}

const PLAIN_URL_AT_START_PATTERN =
  /^(https?:\/\/[^\s<]+|mailto:[^\s<]+|tel:[^\s<]+)/i

/** 라벨 내부 `]`·중첩 `[...](url)` 허용 (iOS markdown link) */
function matchMarkdownInlineLink(text: string): RegExpMatchArray | null {
  if (!text.startsWith("[") || text.startsWith("\\[")) {
    return null
  }

  let depth = 0
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === "\\" && i + 1 < text.length) {
      i += 1
      continue
    }
    if (char === "[") {
      depth += 1
    } else if (char === "]") {
      depth -= 1
      if (depth === 0) {
        const urlMatch = text.slice(i + 1).match(/^\(((?:\\.|[^)\n])+?)\)/)
        if (!urlMatch) {
          return null
        }
        const label = text.slice(1, i)
        const full = text.slice(0, i + 1 + urlMatch[0].length)
        const groups = [full, label, urlMatch[1]] as unknown as RegExpMatchArray
        groups.index = 0
        groups.input = text
        return groups
      }
    } else if (char === "\n" && depth > 0) {
      return null
    }
  }

  return null
}

/** iOS 인라인 파싱 우선순위 (code → link → u → s → mark → mixed bold/italic → bold → italic) */
const INLINE_PATTERNS: InlinePattern[] = [
  {
    match: (text) => text.match(/^(?<!\\)`((?:\\.|[^`\n])+?)`/),
    render: (content, key) => (
      <code
        className="bg-fill-neutral-weaker-hover-pressed text-body-3-regular rounded-[4px] px-1 font-mono"
        key={key}
      >
        {unescapeNoticeContentCodeSpan(content)}
      </code>
    ),
  },
  {
    contentGroupIndex: 1,
    match: matchMarkdownInlineLink,
    render: (_content, key, match) => {
      const label = match[1] ?? ""
      const rawUrl = unescapeNoticeContentCodeSpan((match[2] ?? "").trim())
      const labelNode = renderNoticeDetailBodyInline(label, `${key}-label`)

      if (!isNoticeContentAllowedInlineLinkUrl(rawUrl)) {
        return <Fragment key={key}>{labelNode}</Fragment>
      }

      const openInNewTab = /^https?:/i.test(rawUrl)
      return (
        <a
          className={INLINE_LINK_CLASS}
          href={rawUrl}
          key={key}
          rel={openInNewTab ? "noreferrer" : undefined}
          target={openInNewTab ? "_blank" : undefined}
        >
          {labelNode}
        </a>
      )
    },
  },
  {
    match: (text) => text.match(/^(?<!\\)<u>(.+?)<\/u>/),
    render: (content, key) => (
      <span className="underline" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </span>
    ),
  },
  {
    match: (text) => text.match(/^(?<!\\)~~(?=\S)(.+?)(?<=\S)~~/),
    render: (content, key) => (
      <span className="line-through" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </span>
    ),
  },
  {
    contentGroupIndex: 2,
    match: matchHighlightMark,
    render: (content, key, match) => {
      const isLegacy = match[0].includes('data-hl="')
      const colorAttr = isLegacy ? undefined : match[1]
      const dataHl = isLegacy ? match[1] : undefined
      const backgroundColor = resolveNoticeContentHighlightCssFromMark(
        colorAttr,
        dataHl,
      )

      return (
        <span className="px-0.5" key={key} style={{ backgroundColor }}>
          {renderNoticeDetailBodyInline(content, key)}
        </span>
      )
    },
  },
  {
    match: (text) => text.match(/^(?<!\\)\*\*_(.+?)_\*\*/),
    render: (content, key) => (
      <strong className="font-bold italic" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </strong>
    ),
  },
  {
    match: (text) => text.match(/^(?<!\\)\*\*\*(.+?)\*\*\*/),
    render: (content, key) => (
      <strong className="font-bold italic" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </strong>
    ),
  },
  {
    match: (text) => text.match(/^(?<!\\)\*\*(?=\S)(.+?)(?<=\S)\*\*/),
    render: (content, key) => (
      <strong className="font-bold" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </strong>
    ),
  },
  {
    match: (text) => text.match(/^(?<!\\)(?<!\*)\*(?=\S)(.+?)(?<=\S)\*(?!\*)/),
    render: (content, key) => (
      <em className="italic" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </em>
    ),
  },
  {
    match: (text) => text.match(/^(?<!\\)(?<!_)_(?=\S)(.+?)(?<=\S)_(?!_)/),
    render: (content, key) => (
      <em className="italic" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </em>
    ),
  },
]

const INLINE_SPECIAL_AT_OFFSET_PATTERN =
  /^(?:`|\[|~~|<u>|<mark\s+color=|<mark\s+data-hl=|\*\*\*|\*\*_|~~|\*\*|(?<!_)_(?!_)|(?<!\*)\*(?!\*))/

function findNextUnescapedSpecialIndex(text: string): number {
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\\") {
      i += 1
      continue
    }
    const slice = text.slice(i)
    if (PLAIN_URL_AT_START_PATTERN.test(slice)) {
      return i
    }
    if (INLINE_SPECIAL_AT_OFFSET_PATTERN.test(slice)) {
      return i
    }
  }
  return -1
}

function consumePlainTextChunk(rest: string): {
  consumed: number
  text: string
} {
  if (rest.startsWith("\\") && rest.length >= 2) {
    const unescaped = unescapeNoticeContentPlainTextSegment(rest.slice(0, 2))
    if (unescaped.length === 1) {
      return { consumed: 2, text: unescaped }
    }
  }
  return {
    consumed: 1,
    text: unescapeNoticeContentPlainTextSegment(rest[0] ?? ""),
  }
}

function renderPlainWithAutoLinks(
  segment: string,
  keyPrefix: string,
  indexRef: { value: number },
): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = new RegExp(NOTICE_CONTENT_PLAIN_URL_GLOBAL.source, "gi")
  let lastIndex = 0
  let urlMatch: RegExpExecArray | null = pattern.exec(segment)

  while (urlMatch !== null) {
    const start = urlMatch.index
    const rawUrl = urlMatch[0]
    if (start > lastIndex) {
      const text = segment.slice(lastIndex, start)
      nodes.push(
        <Fragment key={`${keyPrefix}-plain-${indexRef.value}`}>
          {unescapeNoticeContentPlainTextSegment(text)}
        </Fragment>,
      )
      indexRef.value += 1
    }

    const normalized = trimNoticeContentPlainUrlTrailingPunctuation(rawUrl)
    const suffix = rawUrl.slice(normalized.length)

    if (isNoticeContentAllowedInlineLinkUrl(normalized)) {
      const openInNewTab = /^https?:/i.test(normalized)
      nodes.push(
        <a
          className={INLINE_LINK_CLASS}
          href={normalized}
          key={`${keyPrefix}-autolink-${indexRef.value}`}
          rel={openInNewTab ? "noreferrer" : undefined}
          target={openInNewTab ? "_blank" : undefined}
        >
          {normalized}
        </a>,
      )
      indexRef.value += 1
    } else {
      nodes.push(
        <Fragment key={`${keyPrefix}-plain-${indexRef.value}`}>
          {unescapeNoticeContentPlainTextSegment(rawUrl)}
        </Fragment>,
      )
      indexRef.value += 1
    }

    if (suffix.length > 0) {
      nodes.push(
        <Fragment key={`${keyPrefix}-plain-${indexRef.value}`}>
          {unescapeNoticeContentPlainTextSegment(suffix)}
        </Fragment>,
      )
      indexRef.value += 1
    }

    lastIndex = start + rawUrl.length
    urlMatch = pattern.exec(segment)
  }

  if (lastIndex < segment.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}-plain-${indexRef.value}`}>
        {unescapeNoticeContentPlainTextSegment(segment.slice(lastIndex))}
      </Fragment>,
    )
    indexRef.value += 1
  }

  return nodes
}

function renderNoticeDetailBodyInline(
  text: string,
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let rest = normalizeNoticeContentLegacyWhitespaceMarkers(text)
  let index = 0
  const indexRef = { value: 0 }

  while (rest.length > 0) {
    let matched = false

    for (const pattern of INLINE_PATTERNS) {
      const match = pattern.match(rest)
      if (!match) {
        continue
      }

      const contentIndex = pattern.contentGroupIndex ?? 1
      const matchedText = match[contentIndex]
      if (matchedText === undefined) {
        continue
      }
      const isMarkdownLink = match[0].startsWith("[")
      if (!isMarkdownLink && matchedText.length === 0) {
        continue
      }

      matched = true
      const key = `${keyPrefix}-inline-${index}`
      index += 1
      nodes.push(pattern.render(matchedText, key, match))
      rest = rest.slice(match[0].length)
      break
    }

    if (matched) {
      continue
    }

    const nextSpecial = findNextUnescapedSpecialIndex(rest)
    const plainEnd = nextSpecial === -1 ? rest.length : nextSpecial
    if (plainEnd > 0) {
      const segment = rest.slice(0, plainEnd)
      indexRef.value = index
      nodes.push(...renderPlainWithAutoLinks(segment, keyPrefix, indexRef))
      index = indexRef.value
      rest = rest.slice(plainEnd)
      continue
    }

    if (PLAIN_URL_AT_START_PATTERN.test(rest)) {
      indexRef.value = index
      nodes.push(...renderPlainWithAutoLinks(rest, keyPrefix, indexRef))
      index = indexRef.value
      rest = ""
      continue
    }

    const { consumed, text: plainChunk } = consumePlainTextChunk(rest)
    nodes.push(
      <Fragment key={`${keyPrefix}-plain-${index}`}>{plainChunk}</Fragment>,
    )
    index += 1
    rest = rest.slice(consumed)
  }

  return nodes
}

export type NoticeDetailBodyLineKind =
  "body" | "heading" | "blockquote" | "list" | "dashList" | "numberedList"

export type ParsedNoticeDetailBodyLine = {
  content: string
  kind: NoticeDetailBodyLineKind
  level: number
  listMarker?: string
}

const NOTICE_BODY_HEADING_PATTERN = /^(#{1,3})\s+(.*)$/
const NOTICE_BODY_NUMBERED_LIST_PATTERN = /^(\d+)\.\s+(.*)$/

/** iOS 블록 접두 판별 — 인용 > 제목 > 글머리 > 대시 > 번호 > 본문 */
export function parseNoticeBodyLine(line: string): ParsedNoticeDetailBodyLine {
  const headingMatch = line.match(NOTICE_BODY_HEADING_PATTERN)
  if (headingMatch) {
    const level = headingMatch[1]?.length ?? 0
    return {
      content: headingMatch[2] ?? "",
      kind: "heading",
      level,
    }
  }

  if (line.startsWith("> ")) {
    return { content: line.slice(2), kind: "blockquote", level: 0 }
  }

  if (line.startsWith("- ")) {
    return { content: line.slice(2), kind: "list", level: 0 }
  }

  if (line.startsWith(NOTICE_CONTENT_DASH_LIST_PREFIX)) {
    return {
      content: line.slice(NOTICE_CONTENT_DASH_LIST_PREFIX.length),
      kind: "dashList",
      level: 0,
    }
  }

  const numberedMatch = line.match(NOTICE_BODY_NUMBERED_LIST_PATTERN)
  if (numberedMatch) {
    return {
      content: numberedMatch[2] ?? "",
      kind: "numberedList",
      level: 0,
      listMarker: `${numberedMatch[1]}.`,
    }
  }

  return { content: line, kind: "body", level: 0 }
}

export function renderNoticeDetailBlockquoteGroup(
  contents: string[],
  groupKey: string,
): ReactNode {
  return (
    <blockquote
      className="border-neutral-weak-200 text-body-1-medium text-neutral-default-900 m-0 flex flex-col gap-(--umc-spacing-gap-8) border-l-2 pl-3"
      key={groupKey}
    >
      {contents.map((content, index) => (
        <p className="m-0 min-w-0" key={`${groupKey}-bq-${index}`}>
          {renderNoticeDetailBodyInline(content, `${groupKey}-bq-${index}`)}
        </p>
      ))}
    </blockquote>
  )
}

export function renderNoticeDetailBodyLine(
  line: string,
  lineKey: string,
): ReactNode {
  const parsed = parseNoticeBodyLine(line)

  if (parsed.kind === "list") {
    return (
      <p
        className="text-body-1-medium text-neutral-default-900 m-0 flex gap-2"
        key={lineKey}
      >
        <span aria-hidden className="shrink-0">
          •
        </span>
        <span className="min-w-0 flex-1">
          {renderNoticeDetailBodyInline(parsed.content, lineKey)}
        </span>
      </p>
    )
  }

  if (parsed.kind === "dashList") {
    return (
      <p
        className="text-body-1-medium text-neutral-default-900 m-0 flex gap-2"
        key={lineKey}
      >
        <span aria-hidden className="shrink-0">
          –
        </span>
        <span className="min-w-0 flex-1">
          {renderNoticeDetailBodyInline(parsed.content, lineKey)}
        </span>
      </p>
    )
  }

  if (parsed.kind === "numberedList") {
    return (
      <p
        className="text-body-1-medium text-neutral-default-900 m-0 flex gap-2"
        key={lineKey}
      >
        <span aria-hidden className="shrink-0 tabular-nums">
          {parsed.listMarker ?? "1."}
        </span>
        <span className="min-w-0 flex-1">
          {renderNoticeDetailBodyInline(parsed.content, lineKey)}
        </span>
      </p>
    )
  }

  return (
    <p
      className={cn(
        "text-neutral-default-900",
        parsed.kind === "heading"
          ? parsed.level === 1
            ? "text-title-1-semibold"
            : parsed.level === 2
              ? "text-title-2-semibold"
              : "text-label-1-semibold"
          : "text-body-1-medium",
      )}
      key={lineKey}
    >
      {renderNoticeDetailBodyInline(parsed.content, lineKey)}
    </p>
  )
}
