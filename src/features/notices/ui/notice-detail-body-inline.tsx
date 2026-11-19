import { Fragment, type ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

import { NOTICE_CONTENT_HIGHLIGHT_SWATCH } from "../model/notice-content-markdown"

type InlinePattern = {
  contentGroupIndex?: number
  match: (text: string) => RegExpMatchArray | null
  render: (content: string, key: string, match: RegExpMatchArray) => ReactNode
}

const HIGHLIGHT_MARK_PATTERN =
  /^<mark data-hl="(purple|pink|orange|mint)">([\s\S]*?)<\/mark>/

const INLINE_PATTERNS: InlinePattern[] = [
  {
    contentGroupIndex: 2,
    match: (text) => text.match(HIGHLIGHT_MARK_PATTERN),
    render: (content, key, match) => {
      const color = match[1] as keyof typeof NOTICE_CONTENT_HIGHLIGHT_SWATCH
      const swatch = NOTICE_CONTENT_HIGHLIGHT_SWATCH[color]

      return (
        <span
          className="rounded-[2px] px-0.5"
          key={key}
          style={{ backgroundColor: swatch.bg }}
        >
          {renderNoticeDetailBodyInline(content, key)}
        </span>
      )
    },
  },
  {
    match: (text) => text.match(/^\*\*(.+?)\*\*/),
    render: (content, key) => (
      <strong className="font-bold" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </strong>
    ),
  },
  {
    match: (text) => text.match(/^~~(.+?)~~/),
    render: (content, key) => (
      <span className="line-through" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </span>
    ),
  },
  {
    match: (text) => text.match(/^<u>(.+?)<\/u>/),
    render: (content, key) => (
      <span className="underline" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </span>
    ),
  },
  {
    match: (text) => text.match(/^`(.+?)`/),
    render: (content, key) => (
      <code
        className="bg-fill-neutral-weaker-hover-pressed text-body-3-regular rounded-[4px] px-1 font-mono"
        key={key}
      >
        {content}
      </code>
    ),
  },
  {
    match: (text) => text.match(/^\*(.+?)\*/),
    render: (content, key) => (
      <em className="italic" key={key}>
        {renderNoticeDetailBodyInline(content, key)}
      </em>
    ),
  },
]

function renderNoticeDetailBodyInline(
  text: string,
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let rest = text
  let index = 0

  while (rest.length > 0) {
    let matched = false

    for (const pattern of INLINE_PATTERNS) {
      const match = pattern.match(rest)
      if (!match) {
        continue
      }

      const contentIndex = pattern.contentGroupIndex ?? 1
      const matchedText = match[contentIndex]
      if (matchedText === undefined || matchedText.length === 0) {
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

    const nextSpecial = rest.search(/(\*\*|~~|<u>|<mark data-hl=|`|\*)/)
    const plainEnd = nextSpecial === -1 ? rest.length : nextSpecial
    if (plainEnd > 0) {
      nodes.push(
        <Fragment key={`${keyPrefix}-plain-${index}`}>
          {rest.slice(0, plainEnd)}
        </Fragment>,
      )
      index += 1
      rest = rest.slice(plainEnd)
      continue
    }

    nodes.push(
      <Fragment key={`${keyPrefix}-plain-${index}`}>{rest[0]}</Fragment>,
    )
    index += 1
    rest = rest.slice(1)
  }

  return nodes
}

function parseNoticeBodyLine(line: string) {
  const headingMatch = line.match(/^(#{1,3})\s*(.*)$/)
  if (headingMatch) {
    const level = headingMatch[1]?.length ?? 0
    return {
      content: headingMatch[2] ?? "",
      kind: "heading" as const,
      level,
    }
  }

  if (line.startsWith("> ")) {
    return { content: line.slice(2), kind: "blockquote" as const, level: 0 }
  }

  if (line.startsWith("- ")) {
    return { content: line.slice(2), kind: "list" as const, level: 0 }
  }

  return { content: line, kind: "body" as const, level: 0 }
}

export function renderNoticeDetailBodyLine(
  line: string,
  lineKey: string,
): ReactNode {
  const parsed = parseNoticeBodyLine(line)

  if (parsed.kind === "blockquote") {
    return (
      <p
        className="border-neutral-weak-200 text-body-1-medium text-neutral-default-900 border-l-2 pl-3"
        key={lineKey}
      >
        {renderNoticeDetailBodyInline(parsed.content, lineKey)}
      </p>
    )
  }

  if (parsed.kind === "list") {
    return (
      <p
        className="text-body-1-medium text-neutral-default-900 flex gap-2"
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
