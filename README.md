# umc-product-web-operations

UMC 운영 백오피스 프론트엔드. 이 문서는 **어떻게 개발하는지**에 초점을 둡니다.

## 커밋 전 수동 검사

커밋하기 전에 아래를 **순서대로** 실행합니다. 하나라도 실패하면 고친 뒤 다시 돌립니다.

```bash
pnpm lint:fix          # 자동 수정 가능한 린트 이슈 정리
pnpm format              # Prettier 포맷 적용
pnpm lint                # 남은 린트 에러 없는지 확인
pnpm lint:boundaries     # FSD 레이어 경계 검사
pnpm test:run            # 테스트 1회
```

그다음 스테이징·커밋합니다.

```bash
git add .
git commit -m "✨ feat: 예시 메시지"
```

`git commit` 시 Husky가 **자동으로** 한 번 더 검사합니다.

| 시점         | 검사                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | 스테이징된 파일에 **ESLint `--fix` + Prettier `--write`** (`lint-staged`). 전체 `pnpm format`이 아니라 **이번에 올리는 파일만** 포맷합니다. |
| `commit-msg` | **commitlint**로 커밋 메시지 형식 검사. 틀리면 커밋이 만들어지지 않습니다.                                                                  |

Prettier/ESLint가 파일을 수정하면, 그 변경이 스테이징에 안 들어 있을 수 있습니다. 그 경우 `git add` 후 다시 커밋하세요.  
메시지 규칙은 아래 「커밋 메시지」 절을 따릅니다. PowerShell에서는 **`-m`과 메시지 전체를 큰따옴표**로 감싸세요.

### 빌드 검사 (커밋 전과 별개)

`pnpm build`는 커밋 전 필수 절차에 **포함하지 않습니다.**  
타입체크 + 프로덕션 번들이 필요할 때(배포 전, PR 전 최종 확인 등) 따로 실행합니다.

```bash
pnpm build               # tsc -b + vite build
pnpm preview             # (선택) 빌드 결과 미리보기
```

---

## 환경

| 도구    | 버전                    |
| ------- | ----------------------- |
| Node.js | >= 22.12 (`.nvmrc`: 22) |
| pnpm    | 10.28.0 (Corepack 권장) |

```bash
corepack enable
corepack prepare pnpm@10.28.0 --activate
```

### GitHub Packages (`@umc-product/*`)

디자인 시스템 패키지는 GitHub Packages에 있습니다. 설치 전 로컬에 토큰이 필요합니다.

1. GitHub Classic PAT에 `read:packages` 권한을 부여합니다.
2. **사용자 홈** `~/.npmrc`에만 토큰을 넣습니다. 저장소에 커밋하지 마세요.

```
//npm.pkg.github.com/:_authToken=ghp_...
```

3. 프로젝트 `.npmrc`에는 레지스트리만 있습니다 (`@umc-product:registry=...`).

## 시작

```bash
pnpm install
pnpm dev
```

- 개발 서버: Vite HMR
- 기본 화면: `/` (AdminShell), `/login`
- API: 브라우저 `/api/*` → Vite 프록시 → 기본 `https://api-dev.university.neordinary.com`  
  로컬 백엔드는 `.env`에 `VITE_DEV_API_PROXY_TARGET=http://localhost:8080` 후 dev 서버 재시작.

경로 alias: `@/` → `src/`

---

## 코드 품질 검사

코드는 ESLint·Prettier·Vitest로 검사하고, 커밋 메시지는 commitlint로 검사합니다.

- `pnpm lint` / `format` / `test` → **소스 코드** 품질
- `commitlint` (Husky `commit-msg`) → **커밋 메시지** 형식  
  이 둘은 별개입니다. `pnpm lint`만으로는 커밋 메시지 오류를 잡지 않습니다.

### 명령어 자세히

#### `pnpm install`

`package.json` / `pnpm-lock.yaml` 기준으로 의존성을 설치합니다.  
처음 클론했거나 lockfile이 바뀌었을 때 실행합니다. `@umc-product/*` 설치에 GitHub Packages 토큰이 필요합니다.

#### `pnpm dev`

Vite 개발 서버를 띄웁니다. 파일을 저장하면 HMR로 브라우저가 바로 갱신됩니다.  
로컬에서 화면을 보면서 개발할 때 쓰는 기본 명령입니다.

#### `pnpm build`

1. `tsc -b` — TypeScript 프로젝트 참조로 **타입 검사** (통과해야 다음 단계)
2. `vite build` — 프로덕션 번들을 `dist/`에 생성

배포 전에 “타입·번들이 깨지지 않는지” 확인할 때 사용합니다. `dev`보다 느리고, 실제 배포에 가까운 결과물입니다.

#### `pnpm preview`

`pnpm build`로 만든 `dist/`를 로컬 정적 서버로 미리봅니다.  
개발 서버(`dev`)가 아니라 **빌드 결과**가 정상인지 확인할 때 사용합니다.

#### `pnpm lint`

ESLint로 프로젝트 전체(주로 `*.ts` / `*.tsx`)를 검사합니다. 파일을 수정하지는 않습니다.

잡는 것 예시:

- 사용하지 않는 변수, 잘못된 hooks 사용
- import / export 정렬 (perfectionist)
- FSD 레이어 의존 방향 위반 (boundaries, 기본은 warn)

터미널에 문제 목록만 보고 싶을 때, CI·커밋 전에 “규칙 위반이 있는지” 확인할 때 씁니다.

#### `pnpm lint:fix`

`pnpm lint`와 같되, **자동 수정 가능한 항목을 파일에 직접 고칩니다.**  
예: import 정렬, 일부 포맷성 규칙.  
고치지 못하는 에러(로직/타입 관련 등)는 그대로 남아 손으로 수정해야 합니다.

#### `pnpm lint:boundaries`

FSD 레이어 경계를 **래칫(ratchet)** 방식으로 검사하는 스크립트입니다 (`scripts/check-boundaries.mjs`).

- ESLint `boundaries/dependencies` 위반을 모읍니다.
- **upward**(하위 레이어 → 상위 레이어)는 0건이어야 하며, 있으면 실패합니다.
- **lateral**(같은 레이어 슬라이스 간 수평 결합)은 baseline 수치를 넘으면 실패합니다.  
  새 프로젝트 baseline은 `0`입니다.

`pnpm lint`만으로는 warn이라 놓칠 수 있는 구조 위반을, 커밋/PR 전에 확실히 막을 때 사용합니다.

#### `pnpm format`

Prettier로 프로젝트 파일을 **포맷을 적용해 저장**합니다.  
세미콜론 없음, double quote, 줄 길이 80, Tailwind class 정렬 등이 맞춰집니다.  
코드 “스타일(들여쓰기·따옴표·줄바꿈)”만 다루며, 버그/타입 오류는 잡지 않습니다.

#### `pnpm format:check`

포맷만 **검사**하고 파일은 바꾸지 않습니다.  
규칙과 다른 파일이 있으면 실패합니다. CI나 “내가 포맷을 안 건드렸는지” 확인할 때 씁니다.  
어긋나면 `pnpm format`으로 고치면 됩니다.

#### `pnpm test`

Vitest를 **watch 모드**로 실행합니다. 테스트 파일이 바뀌면 관련 테스트를 다시 돌립니다.  
테스트 코드를 작성·수정하는 동안 켜 두는 명령입니다.

#### `pnpm test:run`

Vitest를 **한 번만** 실행하고 종료합니다.  
커밋 전·CI처럼 “지금 테스트가 전부 통과하는지” 확인할 때 사용합니다.  
대상: `src/**/*.{test,spec}.{ts,tsx}` (setup: `src/test/setup.ts`).

#### `pnpm exec commitlint` (메시지 사전 검증)

커밋 메시지 문자열이 gitmoji 규칙에 맞는지 **미리** 검사합니다.  
실제로 커밋하지 않고 형식만 확인합니다.

```bash
echo "🎉 chore: umc-product-web-operations 초기 스캐폴드 구성" | pnpm exec commitlint
```

통과하면 아무 에러 없이 끝나고, 형식이 틀리면 어떤 규칙에 걸렸는지 출력합니다.

### 일상 루프

```bash
pnpm install      # (최초·의존성 변경 시)
pnpm dev          # 화면 보며 개발
# …코드 작성…
# 커밋 직전 → 문서 최상단 「커밋 전 수동 검사」 참고
# 배포·최종 확인 시 → 「빌드 검사」의 pnpm build
```

### Git hooks (자동)

`git commit` 할 때 Husky가 아래를 **자동으로** 실행합니다. 실패하면 커밋이 취소됩니다.

| 훅           | 실행 내용                        | 하는 일                                                                           |
| ------------ | -------------------------------- | --------------------------------------------------------------------------------- |
| `pre-commit` | `pnpm lint-staged`               | **스테이징된 파일만** 검사·수정합니다. 전체 프로젝트를 다시 포맷하지 않습니다.    |
| `commit-msg` | `pnpm exec commitlint --edit $1` | 커밋 메시지가 gitmoji 형식인지 검사합니다. 실패하면 **커밋이 생성되지 않습니다.** |

`lint-staged` 대상 (`package.json`):

| 파일              | 실행                                |
| ----------------- | ----------------------------------- |
| `*.{ts,tsx}`      | `eslint --fix` → `prettier --write` |
| `*.{json,md,css}` | `prettier --write`                  |

즉 커밋할 때도 **Prettier가 돌아갑니다.** (스테이징된 해당 확장자 파일에 한함)  
훅이 파일을 고친 뒤에는 `git status`로 확인한 다음, 필요하면 `git add` 후 다시 커밋하세요.

로컬에서 hook을 끄고 커밋하는 것은 권장하지 않습니다. 팀 규칙을 우회하게 됩니다.

### 커밋 메시지

`commitlint-config-gitmoji` 규칙을 따릅니다. 형식:

```
<gitmoji> <type>: <subject>
```

| 요소       | 규칙                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| gitmoji    | **맨 앞 필수.** 이모지(`✨`) 또는 숏코드(`:sparkles:`). [gitmoji](https://gitmoji.dev/) 참고 |
| 공백       | gitmoji와 type 사이 공백 1개                                                                 |
| type       | **필수, 소문자.** 아래 표만 허용. `init` 등은 불가                                           |
| `:` + 공백 | type 뒤에 `:` 그리고 공백 1개                                                                |
| subject    | **필수.** 짧은 설명. 끝에 `.` 금지. header 전체 최대 100자                                   |

#### 허용 type

| type       | 용도                                 |
| ---------- | ------------------------------------ |
| `feat`     | 새 기능                              |
| `fix`      | 버그 수정                            |
| `refactor` | 동작은 그대로인 구조 개선            |
| `chore`    | 빌드·설정·의존성·스캐폴드 등         |
| `docs`     | 문서만 변경                          |
| `test`     | 테스트 추가·수정                     |
| `style`    | 포맷·스타일만 (로직 변경 없음)       |
| `build`    | 빌드 시스템·번들 관련                |
| `ci`       | CI 설정                              |
| `perf`     | 성능 개선                            |
| `revert`   | 이전 커밋 되돌림                     |
| `wip`      | 작업 중 (가급적 PR 머지 전에는 지양) |

#### 올바른 예

```
✨ feat: 회원 목록 페이지 추가
🐛 fix: 로그인 폼 검증 오류 수정
📝 docs: README 개발 가이드 수정
🎉 chore: umc-product-web-operations 초기 스캐폴드 구성
:tada: chore: umc-product-web-operations 초기 스캐폴드 구성
```

PowerShell:

```powershell
git commit -m ":tada: chore: umc-product-web-operations 초기 스캐폴드 구성"
```

`-m` 없이 쓰거나 따옴표를 빼면 Git이 메시지를 파일 경로로 오인해 `pathspec` 에러가 납니다.

#### 잘못된 예 (commitlint 실패 → 커밋 안 됨)

```
🎉 umc-product-web-operations 초기 스캐폴드 구성   # type 없음
init: 프로젝트 생성                                 # gitmoji 없음, init은 허용 type 아님
✨ feat: 회원 목록 추가.                            # subject 끝 마침표
feat: 회원 목록 추가                                # gitmoji 없음
```

커밋 전에 메시지만 미리 검사:

```bash
echo ":tada: chore: umc-product-web-operations 초기 스캐폴드 구성" | pnpm exec commitlint
```

---

## 코드를 어디에 둘까 (FSD)

의존 방향은 **위에서 아래만** 허용합니다.

```
app → routes → widgets → features → entities → shared
```

| 레이어      | 역할                                                         | 예시                              |
| ----------- | ------------------------------------------------------------ | --------------------------------- |
| `app/`      | 앱 진입, Provider, 전역 CSS                                  | `main.tsx`, `app.css`             |
| `routes/`   | URL ↔ 페이지 조립. 비즈니스 로직을 두껍게 쓰지 않음          | `_admin.tsx`, `login.tsx`         |
| `widgets/`  | 여러 페이지가 공유하는 큰 UI 블록                            | `admin-shell`                     |
| `features/` | 사용자 시나리오 단위 기능 (`ui` / `api` / `model` / `hooks`) | `features/members/...`            |
| `entities/` | 화면 간 공유 도메인 모델·표시                                | `entities/member/...`             |
| `shared/`   | 도메인에 묶이지 않는 공용 자원                               | `api/client`, `lib/cn`, DS 어댑터 |
| `types/`    | 공유 타입                                                    | OpenAPI 생성물 등                 |

새 기능을 추가할 때 권장 순서:

1. `features/<이름>/`에 UI·API·상태를 만든다.
2. 여러 feature가 같이 쓰는 모델이면 `entities/`로 올린다.
3. `routes/`에서는 feature/widget을 가져와 페이지로 조립만 한다.
4. 레이아웃(사이드바·헤더)은 `widgets/`에 둔다.

레이어 위반은 ESLint `boundaries` + `pnpm lint:boundaries`로 검사합니다.  
하위 → 상위 참조(upward)는 허용하지 않습니다.

---

## 라우트 작성법

TanStack Router **파일 기반 라우팅**입니다. `src/routes/`에 파일을 추가하면 `src/routeTree.gen.ts`가 자동 생성됩니다. **생성 파일은 직접 수정하지 마세요.**

| 파일명 패턴             | 의미                                       |
| ----------------------- | ------------------------------------------ |
| `__root.tsx`            | 앱 전체 루트 (Provider, Head 등)           |
| `_admin.tsx`            | pathless 레이아웃 — URL에 안 붙음          |
| `_admin.index.tsx`      | `_admin` 아래 인덱스 → 실제 URL `/`        |
| `login.tsx`             | `/login`                                   |
| `members.tsx`           | `/members`                                 |
| `members.$memberId.tsx` | `/members/:memberId` (`$` = 동적 파라미터) |

백오피스 페이지는 보통 `_admin` 레이아웃 아래에 둡니다.

```
src/routes/
├── __root.tsx
├── login.tsx                 # 레이아웃 밖
├── _admin.tsx                # AdminShell
├── _admin.index.tsx          # /
└── _admin.members.tsx        # /members  (추가 예시)
```

라우트 파일에서는 `createFileRoute("...")`의 경로 문자열이 파일 위치와 일치해야 합니다. 플러그인이 타입을 맞춰 줍니다.

---

## UI / 디자인 시스템

shadcn·radix를 쓰지 않습니다. UMC Design System을 사용합니다.

```tsx
import { Button, TextField, SideNavigation } from "@umc-product/react"
import { SearchIcon } from "@umc-product/icons"
```

전역 CSS (`src/app/app.css`):

```css
@import "tailwindcss";
@import "@umc-product/react/styles.css";
@import "@umc-product/design-tokens/tailwind.css";
```

- 토큰 유틸: `text-teal-600`, `bg-teal-grey-50` 등 (팔레트는 DS `tailwind.css` 기준, `grey` 철자 주의)
- 셸 링크: `__root`의 `LinkProvider` + `shared/lib/router-link`가 TanStack Router와 연결됨
- 문서: https://umc-product.github.io/umc-product-design-system/getting-started/installation/

---

## API 호출

`shared/api/client.ts`의 axios 인스턴스를 사용합니다. `baseURL`은 `/api`입니다.

```ts
import { apiClient } from "@/shared/api/client"

const { data } = await apiClient.get("/members")
```

도메인별 요청 함수는 `features/<domain>/api/` 또는 `entities/<domain>/api/`에 둡니다.  
서버 상태는 `@tanstack/react-query`, 클라이언트 UI 상태는 `zustand`를 사용합니다.  
폼은 `react-hook-form` + `zod` (`@hookform/resolvers`) 패턴을 따릅니다.

---

## 자주 하는 작업 체크리스트

**새 페이지**

1. `src/routes/`에 파일 추가 (필요하면 `_admin.` 접두)
2. 화면 로직은 `features/`에 구현 후 라우트에서 import
3. 사이드바 메뉴가 필요하면 `widgets/admin-shell`의 nav items 갱신
4. `pnpm lint`로 타입·경계 확인

**새 공유 컴포넌트**

- 도메인 무관 → `shared/`
- 여러 페이지 레이아웃 → `widgets/`
- 특정 기능 전용 → 해당 `features/<slice>/ui/`

**SVG**

- `vite-plugin-svgr` 사용. React 컴포넌트로 import 가능합니다.
