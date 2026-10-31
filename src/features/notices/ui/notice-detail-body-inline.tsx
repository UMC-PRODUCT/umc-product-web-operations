import { Fragment, type ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

type InlinePattern = {
  match: (text: string) => RegExpMatchArray | null
  render: (content: string, key: string) => ReactNode
}

const INLINE_PATTERNS: InlinePattern[] = [
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

      const matchedText = match[1]
      if (!matchedText) {
        continue
      }

      matched = true
      const key = `${keyPrefix}-inline-${index}`
      index += 1
      nodes.push(pattern.render(matchedText, key))
      rest = rest.slice(match[0].length)
      break
    }

    if (matched) {
      continue
    }

    const nextSpecial = rest.search(/(\*\*|~~|<u>|\*)/)
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

export function renderNoticeDetailBodyLine(
  line: string,
  lineKey: string,
): ReactNode {
  const isHeading = line.startsWith("# ")
  const content = isHeading ? line.slice(2) : line

  return (
    <p
      className={cn(
        "text-neutral-default-900",
        isHeading ? "text-label-1-semibold" : "text-body-1-medium",
      )}
      key={lineKey}
    >
      {renderNoticeDetailBodyInline(content, lineKey)}
    </p>
  )
}
