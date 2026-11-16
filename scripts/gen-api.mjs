// OpenAPI 스펙 -> src/types/api.d.ts 생성.
// 스펙 위치: 첫 번째 인자 > OPENAPI_SPEC 환경변수 > .tmp/openapi.json
// (개발 서버의 /v3/api-docs는 인증이 필요해 파일로 내려받아 사용한다.)
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const DEFAULT_SPEC = ".tmp/openapi.json"
const OUTPUT = "src/types/api.d.ts"

const spec = process.argv[2] ?? process.env.OPENAPI_SPEC ?? DEFAULT_SPEC
const isRemote = /^https?:\/\//.test(spec)

if (!isRemote && !existsSync(resolve(spec))) {
  console.error(
    `OpenAPI 스펙을 찾을 수 없습니다: ${spec}\n` +
      `  - ${DEFAULT_SPEC} 에 스펙(JSON)을 두거나\n` +
      `  - OPENAPI_SPEC=<파일 경로 또는 URL> pnpm gen:api 로 지정하세요.`,
  )
  process.exit(1)
}

const result = spawnSync(
  "pnpm",
  ["exec", "openapi-typescript", spec, "-o", OUTPUT],
  { stdio: "inherit", shell: true },
)

process.exit(result.status ?? 1)
