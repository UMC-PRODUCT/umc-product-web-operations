# Issue #46 — 코드 리뷰 기반 리팩토링 정리

이 문서는 GitHub Issue [#46](https://github.com/UMC-PRODUCT/umc-product-web-operations/issues/46)의 체크리스트를 `refactor/#46-code-review-cleanup` 브랜치에서 1단계부터 7단계까지 수행한 결과를 한곳에 모은 기록입니다. 단계별 임시 메모는 `.tmp/refactor-46-stageN-changelog.mdx`에 남아 있으나, 온보딩·리뷰·후속 PR을 위해 **의도·변경 전후·남겨 둔 결정**을 문장 중심으로 다시 풀어 적었습니다.

- **작업 브랜치:** `refactor/#46-code-review-cleanup`
- **문서 작성 시점 기준 HEAD (참고):** `f905ece` 부근 (6단계 DS 정리 커밋까지 포함; 7단계 품질 도구 커밋은 같은 브랜치에 선행·교차 배치됨)
- **최종 검증 스냅샷:** `tsc -b` 통과, Vitest 약 **56 files / 264 tests**, FSD `lint:boundaries` 위반 0, ESLint **0 errors**(파일명 kebab 관련 warn 일부 유지), `knip` 통과

이슈의 큰 줄기는 “운영 백오피스에서 버그와 가짜 성공 경로를 먼저 끊고, 데드 코드와 중복 도메인을 걷어낸 뒤, 데이터 흐름과 화면 구조를 React Query·URL·FSD 관례에 맞게 맞추고, 디자인 시스템과 품질 도구로 되돌림을 막는 것”입니다. 아래는 그 흐름을 단계 순서대로 설명합니다.

---

## 전체 방향

리팩토링을 한 번에 섞지 않고 단계를 나눈 이유는, 코드 리뷰에서 지적된 항목의 성격이 서로 달랐기 때문입니다. 1단계는 **사용자가 틀린 데이터를 믿거나, URL만으로 성공 화면을 만들 수 있는 위험**을 제거하는 일이고, 2단계는 **죽은 코드와 미사용 의존성**을 치우는 일이며, 3단계는 **같은 개념이 feature마다 복제된 상태**를 entities·shared로 모으는 일입니다. 4단계는 **쓰기·캐시·필터·재시도**를 수동 state와 클라이언트 전량 조회에서 벗어나 React Query와 서버 필터로 옮기는 일이고, 5단계는 **필터·폼 잠금·대형 JSX·셸 경로 판별**을 URL과 순수 함수·라우트 선언으로 단순화하는 일입니다. 6단계는 **디자인 시스템 버전과 공개 컴포넌트**에 맞추는 일이며, 7단계는 **경계·린트·OpenAPI·통합 테스트**로 앞선 결정을 도구로 고정하는 일입니다.

단계 중간에 “의도적으로 하지 않은 것”도 문서에 남겼습니다. 예를 들어 파일명 kebab-case 일괄 변경, 운영진 `staffRecipient`의 완전한 서버 필터, OpenAPI 생성 타입으로의 일괄 치환, DS 내부 클래스를 완전히 없애는 작업은 비용·API 한계·시각 회귀 때문에 **단독 PR 또는 백엔드·디자인 협의 이후**로 미뤘습니다.

---

## 1단계 — 버그·위험 제거

1단계의 목표는 “기능이 대충 보이더라도 운영자가 잘못된 판단을 하거나, 프로덕션 URL만으로 QA용 가짜 상태를 재현할 수 있는 구멍”을 막는 것이었습니다. 당시 검증에서는 Vitest **51 files / 203 tests**가 통과했고, CI에는 Format check와 Test 단계가 추가되어 테스트 실패나 Prettier 드리프트가 PR에 섞여도 빌드만으로 통과하던 상태를 줄였습니다.

### CI와 로컬 스크래치

이전에는 CI가 Lint와 Build(타입 포함) 위주였고, 단위 테스트와 포맷 검사는 로컬 습관에 기대는 편이었습니다. `.github/workflows/ci.yml`에 Format check와 Test를 넣고 job 이름을 `Lint, Test & Build`로 바꾼 이유는, 리팩토링이 길어질수록 “로컬에서만 깨지는” 회귀를 막기 위해서입니다. 같은 맥락에서 작업 중 생기는 임시 메모가 저장소에 섞이지 않도록 `.tmp/`를 `.gitignore`에 추가했습니다.

### QA용 search param의 프로덕션 노출

`?deleteOutcome=success`, `?awardOutcome=…`, `?mock=…` 같은 파라미터는 개발·스토리 검증에는 편했지만, **프로덕션 URL만으로도** 가짜 성공 토스트나 에러 UI를 열 수 있었습니다. `shared/lib/dev-only.ts`의 `onlyInDev()`로 파싱을 감싸, 개발 모드가 아니면 이런 값을 해석하지 않게 했고, 실사용 성공 토스트는 create/delete 페이지에서 API 성공 직후에 띄우도록 옮겼습니다. 이후 4단계에서 outcome 파라미터 자체를 대부분 제거하면서, 1단계의 DEV 가드는 “남은 DEV 전용 QA 파라미터”를 위한 안전망으로 남았습니다.

### 공지: mock 403, 작성자 판정, 지부장 권한

공지 상세에는 ID 문자열이 `"403"`이면 API와 무관하게 권한 없음 화면을 띄우는 mock이 있었습니다. 정상 공지 PK가 403인 경우 상세를 **영원히 열 수 없는 버그**였기 때문에 mock과 AdminShell의 관련 헤더 숨김 헬퍼를 제거했고, 권한 없음은 실제 HTTP 403만으로 처리하도록 바꿨습니다.

수정·삭제 버튼은 작성자 **이름 문자열 비교**와 QA용 `viewerAuthor` 폴백에 의존하고 있어, 동명이인이나 mock 작성자명으로 타인 공지에 관리 버튼이 노출될 수 있었습니다. 이후에는 `authorMemberId === session.id`이거나 SUPER_ADMIN인 경우에만 관리할 수 있게 했습니다.

지부장의 지부 추정은 매칭 실패 시 `chapters[0]`으로 아무 지부나 잠근 것처럼 보이는 경로가 있었습니다. 틀린 지부로 잠긴 UI는 “열어 두기(fail-open)”보다 위험하다고 보고, `not-applicable` / `locked` / `unresolved` 세 상태로 나눴습니다. unresolved이면 작성 화면은 안내와 함께 게시를 비활성화하고, 목록에서는 잘못된 지부 락을 걸지 않습니다. 세션에 chapter `organizationId`가 안정적으로 내려오면 unresolved는 근본적으로 줄어들 여지가 있으며, 이는 백엔드 협의 영역으로 남겨 두었습니다.

지부장이 운영진 탭에서 `CENTRAL_MEMBER` 대상처럼 `noticeTab`을 요청하던 경로도 고쳤습니다. `CHAPTER_PRESIDENT`를 중앙 역할 집합에서 제외하고, 지부장 단독은 운영진 탭을 forbidden으로 처리합니다. 명세상 지부장은 중앙 운영진 대상 공지를 열람할 수 없기 때문입니다.

### 공지 상세 preload와 조회수

글로벌 `defaultPreload: "intent"` 때문에 링크 hover만으로 상세 GET이 나가고, 수정 화면에 들어가면 같은 GET이 또 나갔습니다. 상세 GET이 **조회수를 올리는** 전제에서는 hover만으로도 조회수가 부풀어 오릅니다. `$noticeId`와 edit 라우트에 `preload: false`를 두고, `notice-detail-query` 키로 loader가 `ensureQueryData`를 공유하도록 바꿔 네트워크 이중 호출과 조회수 부풀림을 줄였습니다.

### 상벌점: 가짜 outcome, 삭제 로딩, 상태·파트 필터

`?awardOutcome` / `?deleteOutcome`만으로 API 없이 성공 토스트를 띄우던 분기를 제거했고, 삭제는 항상 API를 타게 했습니다. 삭제 후 이력 재조회가 실패하면 다이얼로그가 `loading`에 고정되던 문제는 try/catch로 닫히도록 고쳤습니다.

목록·프로필의 상태 열은 사실상 항상 “활동”처럼 보이던 구간이 있어, 서버의 `challengerStatus`(`ACTIVE` / `GRADUATED` / `EXPELLED` / `WITHDRAWN`)를 `활동` / `수료` / `제적` / `탈퇴`로 매핑해 표시하도록 바꿨습니다.

10기 이하 파트 필터는 UI가 11기 이후 PE 체계(PM/Design/Web PE 등)만 제공해 레거시 기수 검색이 사실상 깨져 있었습니다. 기수가 11 미만이면 `WEB` / `NODEJS` / `SPRINGBOOT` / `ANDROID` / `IOS` 옵션을 쓰고, `toMemberSearchPart(part, generation)`으로 API enum에 맞게 변환하도록 분리했습니다.

---

## 2단계 — 정리 (데드 코드·의존성·문서)

2단계는 “런타임에 안 타는데도 레포에 남아 검색·리뷰·경계를 흐리는 코드”와 “설치만 되고 import가 없는 의존성”을 치우는 단계입니다. 1단계 끝 커밋에서 이어져 2단계 끝 `52f86f4`까지 진행했고, 데드 코드에 묶인 테스트가 빠지면서 Vitest는 **45 files / 190 tests** 수준으로 줄었다가, 이후 단계에서 통합·컴포넌트 테스트가 다시 늘었습니다.

### 데드 코드와 HTTP 진입점

`OperatorGisuProvider`, auth 쪽 미사용 `gisu-*.api`, 공지·상벌점 mock·필터 잔여, 미사용 `apiClient` 별칭 등은 실제 UI가 `SelectedGisu`와 `shared/api`의 `api`만 쓰는데도 살아 있었습니다. 이런 경로를 삭제해 “죽은 코드가 산 코드처럼 보이는” 상태를 줄였습니다.

### 미사용 의존성

`zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `react-day-picker` 등은 `package.json`에 있었지만 소스 import가 없었습니다. 패키지를 제거하고 lockfile을 갱신한 이유는 설치 시간·공급망·번들 분석 노이즈만 늘리고 실질 이득이 없었기 때문입니다. “나중에 쓸지도”는 knip과 명시적 도입 결정으로 다루기로 했습니다.

### mock 추정 헬퍼

`guessSchool` / `guessRegion`으로 지부·학교명을 추정해 `MemberSchool` / `MemberRegion`에 넣던 로직은, 추정값이 “서울 지부”처럼 확신 있게 보이면 운영 오판으로 이어질 수 있어 제거했습니다. 목록·상세는 API가 준 `schoolName` 등 필드를 그대로 쓰고, 없으면 비우는 편이 안전하다는 판단입니다.

### knip과 README

미사용 파일·의존성을 눈으로만 찾던 상태를 줄이기 위해 `knip.json`으로 files / dependencies / binaries를 검사하도록 했고, CI에 Knip 단계와 `pnpm knip` 스크립트를 넣었습니다. 의도적 export까지 전부 실패시키지는 않도록 범위를 좁혔습니다. README는 실제 라우트, `api` 진입점, 제거된 라이브러리, knip 사용법을 반영해 온보딩 문서가 데드 패턴을 다시 심지 않도록 맞췄습니다.

### 의도적으로 미룬 파일명 통일

PascalCase 파일의 kebab-case 일괄 rename은 **단독 PR**로 분리하기로 했습니다. 대량 rename은 blame·리뷰·충돌 비용이 크고 “데드 코드 정리”와 성격이 다르며, 신규 파일은 kebab-case를 쓰고 기존 `points/ui`·`admin-shell` 등은 7단계 ESLint **warn**으로 추적합니다.

---

## 3단계 — 공통화 (entities · shared · 쿼리 키)

3단계는 feature 사이에 같은 개념(기수·조직·역할·파트·HTTP 판별·쿼리 키·상벌점 enum)이 복사돼 있던 상태를 FSD `entities`와 `shared`로 모은 단계입니다. 검증은 Vitest, `tsc -b`, FSD boundaries upward/lateral 0을 기준으로 했습니다.

### entities/gisu · organization · member

기수 목록 fetch와 라벨, `SelectedGisuProvider`는 원래 `shared`와 notices 쪽에 흩어져 있었고, 쿼리 키 문자열도 `["gisu","list"]`처럼 인라인으로 쓰였습니다. 기수는 도메인 엔티티이므로 `entities/gisu`로 옮겼고, `SelectedGisu`를 shared에 두면 entities를 import해 **FSD 역방향**이 되므로 provider도 entities에 두었습니다.

조직(지부·학교)은 notices와 points가 같은 `/v2/gisu`를 **서로 다른 쿼리 키**로 캐시하던 중복이 있었습니다. `entities/organization`의 단일 fetch·정규화와 공유 키 `["gisu","organization", id]`로 합쳤고, notices는 `toOrganizationLists` / alias로 기존 UI 타입을 유지했습니다. 기수를 바꿀 때마다 나던 중복 요청과 캐시 불일치를 줄이기 위한 변경입니다.

역할·파트 유니온과 PE 기준 기수(11) 상수는 auth·notices·points에 거의 같은 형태로 재정의돼 있었습니다. `entities/member`에 `ROLE_TYPES` / `RoleType`, `MemberPart`, `PE_PART_GENERATION`을 두고 feature가 import·재export하도록 맞춰, 한쪽만 enum을 고치면 다른 feature가 깨지는 상황을 줄였습니다.

### shared 헬퍼와 쿼리 키 팩토리

`getHttpStatus`, `toPositiveInt` / `readNumber` / `toId`, 빈 응답 본문 검사 같은 로직이 notices/points/command/vote/storage에 복제돼 있었습니다. `shared/lib/http-status.ts`, `to-positive-int.ts`, `shared/api/has-response-body.ts`로 모으고 feature는 thin re-export만 남겼습니다.

쿼리 키는 `["notices","list", …]`, `["notices","detail", id]`와 오타성 `["notice-detail", id]`(수정 화면 투표 삭제 무효화)가 공존해 invalidate가 캐시를 못 지우는 위험이 있었습니다. `noticeKeys` / `challengerKeys` 팩토리로 통일하고 수정 화면도 `noticeKeys.detail`을 쓰도록 바꿨습니다.

### 상벌점 유형과 벌점 범위

UI 옵션이 `{ id, label, score }`만 있고 부여 시 `LABEL_TO_POINT_TYPE[label]`로 역매핑하던 구조에서는, 「업무 불이행」처럼 맵에 없는 라벨이 `CUSTOM`으로 저장되는 버그가 있었습니다. `PointTypeOption.pointType`에 enum을 직접 두고 역매핑을 삭제했으며, API에 없는 유형은 옵션에 `CUSTOM`을 **명시**했습니다. 라벨 문구 변경·오타에 타입이 흔들리지 않게 하기 위한 결정입니다.

벌점 범위는 `RoleTagColor` primary 하나만 보고 campus/presidency를 켜서, 회장+파트장처럼 다중 역할이면 첫 색만 반영됐습니다. `getPenaltyScopesForRoleTypes(roleTypes[])`와 `PointsMember.roleTypes`의 원본 `RoleType[]`로 바꿔, 교내·회장단 벌점 유형이 함께 보이도록 했습니다.

---

## 4단계 — 데이터 흐름

4단계는 쓰기·캐시·필터·재시도·오류 메시지를 “수동 state + 클라이언트 전량 조회 + URL로 성공 흉내”에서 **React Query mutation·ensureQueryData·서버 필터·mutation 성공 경로**로 옮긴 단계입니다. 최종 브랜치 기준으로 테스트는 다시 **56 files / 264 tests** 규모로 늘었습니다.

### useMutation과 캐시

create/edit/delete/vote/award/delete-point마다 `useState(isSubmitting)`과 `try/finally`로 플래그를 관리하던 패턴은, 예외 경로에서 플래그가 안 풀리거나 navigate 중 버튼이 다시 살아나 중복 제출을 만들 수 있었습니다. `useMutation`의 `isPending`에 로딩 UI를 연결하고, 성공 토스트·navigate는 `onSuccess`(또는 mutateAsync 성공 직후)로 옮겼습니다.

상세 loader가 `fetchGisuList()` / 조직 fetch를 캐시 우회로 호출하고, 수정 성공 시 `invalidateQueries(noticeKeys.all)`와 `router.invalidate`를 **둘 다** 하던 경로는 같은 데이터를 두 갈래로 다시 긁었습니다. loader·목록이 `ensureQueryData(gisuListQueryOptions)` / `gisuOrganizationQueryOptions`를 쓰도록 바꾸고, 수정 후에는 `lists()`와 `detail(id)`만 invalidate한 뒤 navigate하도록 단순화했습니다.

기수 목록은 `page` 루프에 `size=20`, 최대 10페이지를 돌리던 방식을 `GET /v1/gisu?page=0&size=200&sort=generation,desc` 한 번으로 바꿨습니다. 헤더 기수 셀렉트마다 여러 왕복이 나가던 비용을 줄이기 위한 변경이며, 기수 개수는 보통 200 미만이라는 전제입니다.

스토리지 이미지 업로드는 순차 `uploadStorageFiles`를 `Promise.all` 병렬(입력 순서 유지)로 바꿔, 첨부 여러 장일 때 체감 지연을 줄였습니다.

### 공지 목록 서버 필터와 등록 재시도

공지 목록은 API에 `gisuId` / `noticeTab` / `keyword` 정도만 보내고 chapter/school/part는 **전 페이지를 순차 fetch**한 뒤 `targetInfo`로 클라이언트 필터·재페이지네이션을 했습니다. 필터가 걸린 목록에서 N페이지를 다 받아오면 느리고 totals가 왜곡됩니다. `chapterId` / `schoolId` / `part`를 요청에 넣고 **요청한 page 한 장**만 쓰도록 바꿨고, 전체 순차 조회 헬퍼는 삭제했습니다.

다만 `staffRecipient`(받는 사람)는 API가 아직 지원하지 않아 **현재 페이지에만** 클라이언트 필터를 유지합니다. totals는 서버 값이라 화면에 10건 미만처럼 보일 수 있다는 한계를 문서로 남깁니다.

등록 실패 후 재시도 시 `postNotice`부터 전부 다시 실행되면 공지가 중복 생성될 수 있고, 빈 links/images에도 replace API를 호출하거나 수정 시 미변경인데 NOTICE-104/105를 항상 치는 낭비가 있었습니다. `progress`(imageIds, noticeIds, attached, voted)로 끝난 단계를 건너뛰고, 빈·미변경 replace는 생략하되 “비우기”는 반드시 호출하도록 바꿨습니다. 첨부 실패 후 재시도가 흔한 실패 모드이고 중복 공지는 복구가 어렵기 때문입니다.

### outcome URL 제거와 오류 구분

목록이 `?publishOutcome=` 등을 읽어 토스트를 띄우고, 모듈 전역 `*ToastConsumed` 플래그로 Strict Mode 이중 실행을 막던 구조는 1단계 DEV 가드 이후에도 QA 부채와 이중 경로로 남아 있었습니다. 해당 search·훅·mock을 제거하고, 성공 토스트는 mutation 성공 시점에만 띄우도록 정리했습니다. (이미지 로딩 QA `imageLoadState` 등은 DEV 전용으로 잠시 남았으며, 후속 정리 후보입니다.)

axios 오류를 대개 `network_error`(“네트워크를 확인해 주세요”) 한 가지로 묶으면 4xx 서버 메시지가 무시됩니다. 응답이 없으면 `network_error`, HTTP 응답이 있으면 `server_error { message }`로 나누고 UI가 문구를 분기하도록 바꿔, 권한·검증 실패를 네트워크 문제로 오인해 재시도만 반복하는 상황을 줄였습니다.

의도적 보류로는 운영진 `staffRecipient` / 지부 범위 서버 전송, `patchNotice` 미변경 생략, 투표 mutation 오류 세분화 등이 있습니다.

---

## 5단계 — 화면 구조

5단계는 URL·로컬 state·effect가 같은 필터를 이중으로 들고, 대형 JSX·경로 정규식·deep import가 구조를 복잡하게 만들던 부분을 정리한 단계입니다. 4단계 작업과 커밋이 시간상 교차 배치된 구간이 있으므로, 아래 항목이 이슈 체크리스트상 5단계 범위입니다.

### 목록 필터를 URL 단일 출처로

공지 목록은 `useState(filters/page)`와 라우트 `search`를 양방향 sync하는 `useEffect`가 많고, 지부→학교 연쇄·락·권한 보정도 필터 컴포넌트 안 effect가 약 10개에 달해 새로고침·공유 URL과 화면 state가 어긋나기 쉬웠습니다. `Route.useSearch()` / `navigate({ search })`를 유일한 소스로 두고, `normalizeNoticeListFilters(...)` 순수 함수가 옵션·락 대비 유효성을 한 번에 맞추도록 바꿨습니다. 조직 옵션 **로딩 중**에는 URL 값을 지우지 않고, 옵션이 준비된 뒤에만 검증해 성급한 reset을 막았습니다. effect 체인은 순서·타이밍 버그의 온상이고, URL이 “지금 보고 있는 필터”여야 북마크·뒤로가기가 맞다는 이유입니다.

상벌점 목록은 chapter/school/part/query/page가 전부 컴포넌트 local state라 새로고침하면 필터가 날아갔습니다. `points.index`에 `validateSearch`를 추가해 필터·페이지를 search param으로 관리하고, 공지와 같은 UX 일관성·공유 가능한 목록 URL을 맞췄습니다.

### 작성 폼 잠금과 대형 모듈 분리

create 페이지의 기수 기본값·챌린저 전용·지부/학교 락·org clear·파트 필터 등 lock 관련 `useEffect` 6~7개와, create/edit에 복붙된 이탈 확인·투표 초안 로직은 `normalizeNoticeCreateForm(form, locks, generation)` 한 경로와 `use-notice-compose-blocker` / 투표 초안 공유 훅으로 정리했습니다. effect가 form을 뒤늦게 고치면 한 프레임 잘못된 값이나 무한 루프 위험이 있고, 순수 정규화가 테스트·추론에 유리합니다.

`AwardPointsModal`(약 600줄 이상), `notice-create-form-fields` / `notice-create-vote-panel`(각 약 850줄)은 동작 변경 없이 `award-points/`, `notice-create/` 하위 모듈로 분리해 리뷰·충돌·이후 DS 교체 단위를 줄였습니다.

### 상벌점 상세 경로, AdminShell staticData, feature 공개 API

경로는 `/activity/points/$memberId`인데 API·쿼리는 challengerId 중심이었고, search에 challengerId를 또 실어 혼선이 났으며 로딩 중에는 `null`로 빈 화면이었습니다. `/activity/points/$challengerId`로 맞추고, 잘못된 id면 “찾을 수 없어요”, 로딩은 `MemberDetailSkeleton`(DS `Skeleton`)을 쓰며, challengerId 없는 행은 상세로 보내지 않도록 했습니다.

AdminShell이 pathname/`RegExp`로 공지·상벌점 표면을 판별해 헤더/배경을 끄던 방식은 경로 rename에 깨지기 쉽습니다. 각 라우트에 `staticData: { shell: { hideTitleBlock, shellLayout, … } }`를 두고 셸이 `useMatches()`의 leaf 데이터를 읽도록 바꿨습니다. 레이아웃 정책을 **라우트 선언**에 두는 편이 `$challengerId` rename과 함께 검증하기에도 안전합니다.

routes/widgets가 `@/features/notices/model/...`, `ui/...` 등 내부 경로를 직접 import하던 약 20건은 `features/notices/index.ts`로 loader·타입·페이지를 re-export하고, ESLint `no-restricted-imports`로 `@/features/notices`만 쓰게 강제했습니다. index가 UI까지 끌어와 번들 스플리팅 이득은 줄 수 있지만, FSD에서 feature 내부는 구현 상세이므로 공개 표면을 우선했습니다. app 레이어 deep import 제한과 PascalCase rename은 이월했습니다.

---

## 6단계 — 디자인 시스템

6단계는 앱이 DS **0.11.1**과 수제 포털·Bone·내부 클래스에 묶여 있던 부분을 **0.14.2 + 공개 컴포넌트**로 맞춘 단계입니다. `@umc-product/react`, `icons`, `design-tokens`를 함께 `pnpm up`했고, 이 앱은 `HeaderHomeLink context="operation"`, Toast `brand`라 0.12 브레이킹의 큰 영향 없이 `tsc`를 통과했습니다. 세 패키지 버전을 어긋나게 올리면 스타일/피어가 깨지기 쉽고, 0.12~0.14 Field/헤더/Select의 미세 시각 변화는 **실기기 Figma 대조**를 권장합니다(로그인·API 의존).

### Dialog·Panel·Tooltip과 딤

`app.css`에서 `.umc-dialog__backdrop`에 `!important`로 색을 덮고, 공지 create/edit/detail/vote에 `NoticeDialogDimmed` 수제 딤을 덧대던 방식은 DS 업그레이드마다 깨지기 쉬워 `--umc-dialog-backdrop-bg` CSS 변수로 통일하고 `NoticeDialogDimmed`를 삭제했습니다. Panel 위 Dialog 스택용 `body.award-discard-open` 조정은 변수만으로 불가해 유지했습니다.

상벌점 삭제의 `createPortal` 수제 모달은 DS `Dialog`로, 투표 패널은 DS `Panel`로, 역할 셀의 좌표 계산 수제 메뉴는 `Tooltip openOn="click"`으로 옮겼습니다. 투표 달력은 body 포털이면 outside-press로 Panel이 닫혀 Panel 안 `fixed`로 두었습니다. 삭제 Dialog는 DS가 확인 시 항상 close하므로, 비동기 중에는 `close-press`를 무시하고 성공/`onCancel`에서만 닫도록 테스트를 고정했습니다.

### Skeleton · Divider · ErrorPage · shared/ui

로컬 `Bone`, 수제 `<hr>`, 페이지마다 다른 권한/네트워크/삭제됨 마크업은 DS `Skeleton` / `Divider` / `ErrorPageContainer`(+`FullPageError` 래퍼)로 통일했습니다. Skeleton 색·radius나 ErrorPage의 공사 중 일러스트가 예전 아이콘형 Figma와 다를 수 있어 디자인 확인이 필요합니다.

빈 목록·인라인 알림·테이블 바깥 틀이 파일마다 복붙되던 부분은 `EmptyState`, `InlineAlert`, `DataTableShell` / `DataTableBody`로 이관했습니다. 오류 알림에 성공용 `CheckCircleIcon`을 쓰던 곳은 `WarningIcon`으로 바꾸고, 투표 제목의 `.umc-text-field-box-field__*` 직접 조작은 DS `TextFieldBox`로 교체했습니다.

### 이월 (DS 한계)

TextArea/본문/링크/옵션 행의 `.umc-*__*` 직접 조작, PageHeader 제목 숨김 셀렉터, 삭제 Dialog 버튼 `disabled`, 이미지 라이트박스 포털 등은 DS에 대응 API·컴포넌트가 없거나 prop이 없어 유지·핸들러 가드·별도 제안이 필요합니다. 브라우저 Figma 대조는 jsdom만으로는 끝나지 않아 DEFERRED로 적었습니다.

---

## 7단계 — 품질 도구

7단계는 린트·경계·API 타입·핵심 라우트 흐름을 도구로 고정해, 1~6단계에서 맞춘 구조가 다시 무너지지 않게 한 단계입니다.

### FSD boundaries와 typed ESLint

`boundaries/dependencies`가 **warn**이면 CI가 통과해도 FSD 역방향·수평 import가 쌓일 수 있어 **error**로 격상했습니다. 전환 직전 위반이 0건이라 추가 코드 수정은 없었습니다. 3단계에서 entities를 넣은 뒤에도 warn이면 features끼리 다시 붙기 쉽다는 판단입니다.

`typescript-eslint` recommended(타입 미인식)만 쓰던 설정에 `recommendedTypeChecked` + `projectService`를 `src/**`에 적용하고, `jsx-a11y` recommended와 `check-file` kebab-case를 넣었습니다. 테스트의 `no-unsafe-*`는 mock 노이즈, routes의 `only-throw-error`는 TanStack `redirect()` throw가 공식 패턴, JSX의 `no-misused-promises`는 이벤트 핸들러와 충돌해 범위를 조정했습니다. `features/points/ui`, `widgets/admin-shell` 등 PascalCase **약 33건은 warn**으로 두고 rename 단독 PR 전까지 예외로 둡니다. typed lint로 `client.ts`의 `Promise.reject`→`throw`, `notice-api-error`의 any 제거, 불필요 `as` 정리 등을 맞췄습니다.

### openapi-typescript와 통합 테스트

API 타입이 feature마다 수기(`notice-api.types.ts` 등)로 있어 OpenAPI와 어긋나도 컴파일이 모를 수 있었습니다. `pnpm gen:api` → `scripts/gen-api.mjs` → `src/types/api.d.ts` 파이프라인을 두고, 스펙은 CLI 인자 → `OPENAPI_SPEC` → `.tmp/openapi.json` 순으로 찾도록 했으며 README에 사용법을 적었습니다. 수기 타입을 `components["schemas"]`로 **일괄 교체하지는 않았고**(점진 이관), `/v3/api-docs`는 401이라 URL 기본값 없이 스펙 파일 수동 배치를 전제로 했습니다.

단위 테스트 위주였던 상태에서 `_admin` beforeLoad(허용/redirect/logout/403/ApiError/토큰 소실/errorComponent), 공지·상벌점 `validateSearch`, 공지 URL→parse→normalize→build 흐름을 통합 테스트로 잠갔습니다. 5단계에서 URL 단일 출처와 가드 경로를 바꿨으므로 **라우트 계약**을 회귀에서 지키려는 목적입니다.

---

## 공지 상세 URL 파라미터에 대한 후속 논의

리팩토링 이후에도 공지 상세 라우트(`src/routes/_admin/notices/$noticeId.tsx`)에는 목록 탭 복원용 `listAudience`와, DEV QA용 `imageLoadState` / `imageLoadPause`가 search에 남아 있습니다. 이슈 본문의 필수 체크리스트와는 별도로, 리뷰에서 “없앨 수 있는지”를 물을 때 참고할 분석을 아래에 붙입니다.

### `listAudience` (유지 후보 · 대안 논의)

챌린저/운영진 목록 탭을 상세·수정 왕복 후에도 복원하기 위해 목록 → 상세 진입 시 현재 탭을 넘기고, 상세→수정→상세→목록으로 돌아올 때도 같은 값을 이어 갑니다. URL에 두면 새로고침·공유·수정 화면을 거쳐도 탭이 유지되는 장점이 있지만, 상세 URL에 “목록 UI 상태”가 노출되고 북마크·공유 수신자에게는 불필요할 수 있습니다.

대안으로는 `navigate({ state: { listAudience } })`처럼 **history state**에 두면 URL은 `/notices/:id`만 유지되지만 새로고침·새 탭·외부 공유 시 탭 정보가 사라져 기본 탭으로 돌아갑니다. **sessionStorage**에 두면 같은 탭 세션에서는 새로고침 후에도 복원 가능하지만, 탭·기기 간 공유가 안 되고 암묵적 상태라 디버깅·다중 창에서 어긋날 수 있습니다. 제품적으로 “상세 URL을 깨끗이 유지할지”와 “새로고침·공유까지 탭 복원을 보장할지” 중 무엇을 우선할지에 따라 현재 URL search를 유지하거나 히스토리/세션으로 옮길 수 있습니다.

### `imageLoadState` / `imageLoadPause` (제거·로컬 상태 전환 후보)

이 파라미터는 공지 본문·메타가 이미 로드된 상태에서 “이미지만 못 불러왔다”는 인라인 경고 UI를 Figma 상태처럼 **URL로 흉내 내는 DEV QA 상태머신**입니다. 프로덕션에서는 `onlyInDev` 때문에 파싱되지 않으며, 코드에도 API 연동 시 제거 취지의 TODO가 있습니다. 실제 이미지 fetch/재시도 API가 아니라 mock이므로, 라우트 search에서 키를 빼고 컴포넌트 `useState`로 pending/loading/success를 돌리거나, 제품 UX가 필요하면 갤러리 `<img onError>` / refetch로 로컬 status만 다루는 편이 URL 부채를 줄입니다.

---

## 단계별로 남긴 과제 (요약)

| 영역     | 남겨 둔 내용                                                   | 이유                       |
| -------- | -------------------------------------------------------------- | -------------------------- |
| 파일명   | PascalCase → kebab 일괄 rename                                 | blame·충돌 비용, 단독 PR   |
| API 필터 | `staffRecipient` 등 서버 전송                                  | API·정규화 한계            |
| OpenAPI  | `api.d.ts` 생성만, 수기 타입 점진 치환                         | 일괄 교체 리스크, 스펙 401 |
| DS       | `.umc-*__*` 일부, PageHeader 숨김, Dialog disabled, 라이트박스 | DS API/컴포넌트 부재       |
| 시각 QA  | 0.14.2 + ErrorPage 일러스트 Figma 대조                         | 로그인·API·실기기 필요     |
| 공지 URL | `listAudience` 보관 방식, `imageLoad*` 제거                    | 제품 결정·DEV mock 정리    |

---

## 참고 — 단계별 임시 changelog

작업 중 커밋 단위로 쌓인 짧은 기록은 아래 파일에 남아 있습니다. 본 문서가 서술형 정본에 가깝고, `.tmp`는 커밋 해시·표 형식의 작업 메모에 가깝습니다.

| 단계            | 파일                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| 1 버그·위험     | [`.tmp/refactor-46-stage1-changelog.mdx`](../.tmp/refactor-46-stage1-changelog.mdx) |
| 2 정리          | [`.tmp/refactor-46-stage2-changelog.mdx`](../.tmp/refactor-46-stage2-changelog.mdx) |
| 3 공통화        | [`.tmp/refactor-46-stage3-changelog.mdx`](../.tmp/refactor-46-stage3-changelog.mdx) |
| 4 데이터 흐름   | [`.tmp/refactor-46-stage4-changelog.mdx`](../.tmp/refactor-46-stage4-changelog.mdx) |
| 5 화면 구조     | [`.tmp/refactor-46-stage5-changelog.mdx`](../.tmp/refactor-46-stage5-changelog.mdx) |
| 6 디자인 시스템 | [`.tmp/refactor-46-stage6-changelog.mdx`](../.tmp/refactor-46-stage6-changelog.mdx) |
| 7 품질 도구     | [`.tmp/refactor-46-stage7-changelog.mdx`](../.tmp/refactor-46-stage7-changelog.mdx) |

`.tmp/`는 gitignore 대상이므로 원격 클론에는 없을 수 있습니다. PR·위키·온보딩에는 이 `docs/refactor-46-code-review-cleanup.md`를 기준으로 링크하는 것을 권장합니다.
