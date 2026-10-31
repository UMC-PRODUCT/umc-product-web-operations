// FSD 레이어 경계 위반 래칫(ratchet) 체크.
// boundaries/dependencies 위반은 현재 warn이라 빌드를 막지 않는다. 이 스크립트는
// 위반을 방향별로 분류해 두 가지 정책을 적용한다.
//   1) upward(하위 레이어 -> 상위 레이어 역방향): 무조건 실패(무관용).
//   2) lateral(같은 레이어 슬라이스 간 수평 결합): baseline 래칫으로 관리.
//
// 사용: node scripts/check-boundaries.mjs
// lateral 위반을 줄였다면 아래 LATERAL_BASELINE 값을 실제 수치로 낮춰 커밋한다.

import { execSync } from "node:child_process"

const LATERAL_BASELINE = 0
const RULE = "boundaries/dependencies"

const LAYER_RANK = {
  app: 0,
  routes: 1,
  widgets: 2,
  features: 3,
  entities: 4,
  shared: 5,
  lib: 5,
  types: 5,
}

function classifyDirection(message) {
  const match = message.match(
    /from elements of type "([^"]+)".*to elements of type "([^"]+)"/,
  )
  if (!match) return "unknown"

  const fromRank = LAYER_RANK[match[1]]
  const toRank = LAYER_RANK[match[2]]
  if (fromRank === undefined || toRank === undefined) return "unknown"

  if (toRank < fromRank) return "upward"
  if (toRank === fromRank) return "lateral"
  return "downward"
}

let raw
try {
  raw = execSync("npx eslint src --format json", {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
} catch (err) {
  raw = err.stdout
  if (!raw) {
    console.error("eslint 실행 실패:", err.message)
    process.exit(1)
  }
}

const results = JSON.parse(raw)
const buckets = { upward: [], lateral: [], downward: [], unknown: [] }
for (const file of results) {
  for (const msg of file.messages) {
    if (msg.ruleId !== RULE) continue
    const label = `${file.filePath}:${msg.line} ${msg.message}`
    buckets[classifyDirection(msg.message)].push(label)
  }
}

const upward = buckets.upward.length
const lateral = buckets.lateral.length
const unknown = buckets.unknown.length + buckets.downward.length
console.log(
  `FSD 경계 위반: upward ${upward}건 / lateral ${lateral}건 ` +
    `(lateral baseline ${LATERAL_BASELINE})`,
)

let failed = false

if (upward > 0) {
  console.error(
    `\n❌ 역방향(하위->상위) 위반 ${upward}건. 무조건 차단됩니다.\n`,
  )
  for (const v of buckets.upward) console.error(`  - ${v}`)
  failed = true
}

if (unknown > 0) {
  console.error(
    `\n❌ 방향 분류 불가 위반 ${unknown}건. ` +
      `LAYER_RANK/메시지 파싱을 점검해 스크립트를 갱신하세요.\n`,
  )
  for (const v of [...buckets.unknown, ...buckets.downward]) {
    console.error(`  - ${v}`)
  }
  failed = true
}

if (lateral > LATERAL_BASELINE) {
  console.error(
    `\n❌ lateral 위반이 baseline(${LATERAL_BASELINE})보다 ` +
      `${lateral - LATERAL_BASELINE}건 늘었습니다. 신규 수평 결합을 제거하세요.\n`,
  )
  for (const v of buckets.lateral) console.error(`  - ${v}`)
  failed = true
} else if (lateral < LATERAL_BASELINE) {
  console.error(
    `\n❌ lateral 위반이 baseline보다 ${LATERAL_BASELINE - lateral}건 줄었습니다. ` +
      `scripts/check-boundaries.mjs의 LATERAL_BASELINE을 ${lateral}로 낮춰 커밋하세요.\n`,
  )
  failed = true
}

if (failed) process.exit(1)
console.log("✅ 신규 위반 없음.")
