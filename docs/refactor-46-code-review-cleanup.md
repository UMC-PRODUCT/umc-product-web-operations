# Issue #46 — 코드 리뷰 기반 리팩토링 정리

이 문서는 GitHub Issue [#46](https://github.com/UMC-PRODUCT/umc-product-web-operations/issues/46)의 체크리스트를 `refactor/#46-code-review-cleanup` 브랜치에서 1단계부터 7단계까지 수행한 결과를 한곳에 정리한 기록입니다. 온보딩과 코드 리뷰, 후속 PR을 위해 각 단계의 의도, 변경 전후, 의도적으로 남긴 결정을 문장으로 풀어 적었습니다.

- **작업 브랜치:** `refactor/#46-code-review-cleanup`
- **문서 작성 시점 기준 HEAD (참고):** `f905ece` 부근입니다. 6단계 디자인 시스템 정리 커밋까지 포함하며, 7단계 품질 도구 커밋은 같은 브랜치에서 시간상 앞뒤로 교차 배치되어 있습니다.
- **최종 검증 스냅샷:** `tsc -b`가 통과했고, Vitest는 약 **56 files / 264 tests**가 통과했으며, FSD `lint:boundaries` 위반은 0건, ESLint **error는 0건**(파일명 kebab-case 관련 warn은 일부 유지), `knip`도 통과했습니다.

이슈의 큰 줄기는 다음과 같습니다. 운영 백오피스에서 버그와 가짜 성공 경로를 먼저 끊고, 실행되지 않는 코드와 feature마다 복제된 도메인 개념을 걷어낸 뒤, 데이터 흐름과 화면 구조를 React Query·URL·FSD 관례에 맞게 정리하고, 디자인 시스템과 품질 도구로 그 결정이 다시 무너지지 않게 고정하는 것입니다. 아래는 그 흐름을 단계 순서대로 설명합니다.

---

## 전체 방향

리팩토링을 한 번에 섞지 않고 단계를 나눈 이유는, 코드 리뷰에서 지적된 항목의 성격이 서로 달랐기 때문입니다. 1단계는 운영자가 틀린 데이터를 믿게 만들거나, 프로덕션 URL만으로 성공 화면을 재현할 수 있는 위험을 제거하는 일입니다. 2단계는 실행되지 않는 코드와 미사용 의존성을 제거하는 일입니다. 3단계는 같은 개념이 feature마다 복제되어 있던 상태를 `entities`와 `shared`로 모으는 일입니다. 4단계는 쓰기·캐시·필터·재시도를 수동 `useState`와 클라이언트 전량 조회에서 React Query와 서버 필터로 옮기는 일입니다. 5단계는 필터·폼 잠금·대형 JSX·셸 경로 판별을 URL과 순수 함수·라우트 선언으로 단순화하는 일입니다. 6단계는 디자인 시스템 버전과 공개 컴포넌트에 맞추는 일입니다. 7단계는 경계·린트·OpenAPI·통합 테스트로 앞선 결정을 도구로 고정하는 일입니다.

단계 중간에 의도적으로 하지 않은 항목도 이 문서에 남겼습니다. 예를 들어 파일명 kebab-case 일괄 변경, 운영진 `staffRecipient`의 완전한 서버 필터, OpenAPI 생성 타입으로의 일괄 치환, DS 내부 클래스를 모두 제거하는 작업은 비용·API 한계·시각 회귀 때문에 단독 PR 또는 백엔드·디자인 협의 이후로 미뤘습니다.

---

## 1단계 — 버그·위험 제거

1단계의 목표는, 화면이 대충 동작해 보여도 운영자가 잘못된 판단을 하거나, 프로덕션 URL만으로 QA용 가짜 상태를 재현할 수 있는 구멍을 막는 것이었습니다. 당시 검증에서는 Vitest **51 files / 203 tests**가 통과했습니다. CI에는 Format check와 Test 단계를 추가해, 테스트 실패나 Prettier 드리프트가 PR에 섞여도 빌드만으로 통과하던 상태를 줄였습니다.

### CI와 로컬 스크래치

이전에는 CI가 Lint와 Build(타입 검사 포함) 위주였고, 단위 테스트와 포맷 검사는 로컬에서만 돌리는 습관에 기대고 있었습니다. `.github/workflows/ci.yml`에 Format check와 Test를 넣고 job 이름을 `Lint, Test & Build`로 바꾼 이유는, 리팩토링이 길어질수록 로컬에서만 깨지는 회귀를 막기 위해서입니다. 같은 맥락에서 작업 중 생기는 임시 메모가 저장소에 섞이지 않도록 `.tmp/` 경로를 `.gitignore`에 추가했습니다.

### QA용 search param의 프로덕션 노출

`?deleteOutcome=success`, `?awardOutcome=…`, `?mock=…` 같은 파라미터는 개발·스토리 검증에는 편했지만, 프로덕션 URL만으로도 가짜 성공 토스트나 에러 UI를 열 수 있었습니다. `shared/lib/dev-only.ts`의 `onlyInDev()`로 파싱을 감싸, 개발 모드가 아니면 이런 값을 해석하지 않게 했습니다. 실사용 성공 토스트는 create/delete 페이지에서 API 성공 직후에 띄우도록 옮겼습니다. 이후 4단계에서 outcome 파라미터 자체를 대부분 제거하면서, 1단계의 DEV 가드는 남은 DEV 전용 QA 파라미터를 위한 안전망으로 남았습니다.

### 공지: mock 403, 작성자 판정, 지부장 권한

공지 상세에는 ID 문자열이 `"403"`이면 API 응답과 무관하게 권한 없음 화면을 띄우는 mock이 있었습니다. 정상 공지 PK가 403인 경우에도 상세를 열 수 없는 버그였기 때문에, 해당 mock과 AdminShell의 관련 헤더 숨김 헬퍼를 제거했고, 권한 없음은 실제 HTTP 403 응답만으로 처리하도록 바꿨습니다.

수정·삭제 버튼은 작성자 이름 문자열 비교와 QA용 `viewerAuthor` 폴백에 의존하고 있어, 동명이인이나 mock 작성자명만으로 타인 공지에 관리 버튼이 노출될 수 있었습니다. 이후에는 `authorMemberId === session.id`이거나 SUPER_ADMIN인 경우에만 관리할 수 있게 했습니다.

지부장의 지부 추정은 매칭에 실패했을 때 `chapters[0]`으로 아무 지부나 잠근 것처럼 보이는 경로가 있었습니다. 틀린 지부로 잠긴 UI는 지부를 열어 두는 fail-open보다 위험하다고 보고, `not-applicable` / `locked` / `unresolved` 세 상태로 나눴습니다. `unresolved`이면 작성 화면은 안내 문구와 함께 게시를 비활성화하고, 목록에서는 잘못된 지부 락을 걸지 않습니다. 세션에 chapter `organizationId`가 안정적으로 내려오면 `unresolved`는 근본적으로 줄어들 여지가 있으며, 이는 백엔드 협의 영역으로 남겨 두었습니다.

지부장(`CHAPTER_PRESIDENT`)의 운영진 탭 `noticeTab`은 develop과 같이 `CENTRAL_MEMBER`로 유지합니다. 겸임(학교 회장 등)이어도 중앙 역할 매칭이 학교 회장단(`SCHOOL_CORE`)보다 우선합니다. (한때 중앙 역할에서 제외했다가 제품 동작에 맞춰 되돌렸습니다.)

### 공지 상세 preload와 조회수

글로벌 `defaultPreload: "intent"` 설정 때문에, 상세 링크에 마우스를 올리는 것만으로도 상세 GET이 나갔고, 수정 화면에 들어가면 같은 GET이 한 번 더 나갔습니다. 상세 GET이 조회수를 올리는 전제에서는, hover만으로도 조회수가 증가합니다. `$noticeId`와 edit 라우트에 `preload: false`를 두고, 상세·수정 loader가 같은 `notice-detail-query` 키로 `ensureQueryData`를 공유하도록 바꿔, 중복 네트워크 호출과 조회수 부풀림을 줄였습니다.

### 상벌점: 가짜 outcome, 삭제 로딩, 상태·파트 필터

`?awardOutcome` / `?deleteOutcome`만으로 API를 호출하지 않고 성공 토스트를 띄우던 분기를 제거했고, 삭제는 항상 API를 호출하도록 바꿨습니다. 삭제 후 이력 재조회가 실패하면 다이얼로그가 `loading` 상태에 고정되던 문제는, 재조회 실패를 try/catch로 잡아 다이얼로그를 닫도록 고쳤습니다.

목록·프로필의 상태 열은 사실상 항상 “활동”처럼 보이던 구간이 있어, 서버의 `challengerStatus`(`ACTIVE` / `GRADUATED` / `EXPELLED` / `WITHDRAWN`)를 `활동` / `수료` / `제적` / `탈퇴`로 매핑해 표시하도록 바꿨습니다.

10기 이하 파트 필터는 UI가 11기 이후 PE 체계(PM/Design/Web PE 등)만 제공해, 레거시 기수 멤버 검색이 사실상 동작하지 않았습니다. 기수가 11 미만이면 `WEB` / `NODEJS` / `SPRINGBOOT` / `ANDROID` / `IOS` 옵션을 쓰고, `toMemberSearchPart(part, generation)`으로 API enum에 맞게 변환하도록 분리했습니다.

---

## 2단계 — 정리 (데드 코드·의존성·문서)

2단계는 런타임에서 실행되지 않는데도 저장소에 남아 검색·리뷰·계층 경계를 헷갈리게 만드는 코드와, 설치만 되어 있고 소스에서 import하지 않는 의존성을 제거하는 단계입니다. 1단계 끝 커밋에서 이어져 2단계 끝 `52f86f4`까지 진행했습니다. 데드 코드에 묶여 있던 테스트가 빠지면서 Vitest는 **45 files / 190 tests** 수준으로 줄었다가, 이후 단계에서 통합·컴포넌트 테스트가 다시 늘었습니다.

### 데드 코드와 HTTP 진입점

`OperatorGisuProvider`, auth 쪽 미사용 `gisu-*.api`, 공지·상벌점 mock·필터 잔여, 미사용 `apiClient` 별칭 등은 실제 UI가 `SelectedGisu`와 `shared/api`의 `api`만 쓰는데도 남아 있었습니다. 이런 경로를 삭제해, 실행되지 않는 코드가 현행 코드처럼 보이는 상태를 줄였습니다.

### 미사용 의존성

`zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `react-day-picker` 등은 `package.json`에 있었지만 소스에서 import하지 않았습니다. 해당 패키지를 제거하고 lockfile을 갱신한 이유는, 설치 시간과 공급망·번들 분석 노이즈만 늘리고 실질 이득이 없었기 때문입니다. 나중에 쓸 가능성이 있다는 이유만으로는 유지하지 않기로 했고, 필요해지면 knip과 명시적 도입 결정으로 다루기로 했습니다.

### mock 추정 헬퍼

`guessSchool` / `guessRegion`으로 지부·학교명을 추정해 `MemberSchool` / `MemberRegion`에 넣던 로직은, 추정값이 “서울 지부”처럼 확정된 데이터처럼 보이면 운영 오판으로 이어질 수 있어 제거했습니다. 목록·상세는 API가 내려준 `schoolName` 등 필드를 그대로 쓰고, 값이 없으면 비워 두는 편이 안전하다는 판단입니다.

### knip과 README

미사용 파일·의존성을 사람이 눈으로만 찾던 상태를 줄이기 위해, `knip.json`으로 files / dependencies / binaries를 검사하도록 했고, CI에 Knip 단계와 `pnpm knip` 스크립트를 넣었습니다. 의도적으로 export만 해 둔 심볼까지 전부 실패시키지는 않도록 검사 범위를 좁혔습니다. README에는 실제 라우트, `api` 진입점, 제거된 라이브러리, knip 사용법을 반영해, 온보딩 문서가 이미 제거한 패턴을 다시 심지 않도록 맞췄습니다.

### 의도적으로 미룬 파일명 통일

PascalCase 파일의 kebab-case 일괄 rename은 단독 PR로 분리하기로 했습니다. 대량 rename은 blame·리뷰·충돌 비용이 크고 “데드 코드 정리”와 성격이 다르며, 신규 파일은 kebab-case를 쓰고 기존 `points/ui`·`admin-shell` 등은 7단계 ESLint warn으로 추적합니다.

---

## 3단계 — 공통화 (entities · shared · 쿼리 키)

3단계는 feature 사이에 같은 개념(기수·조직·역할·파트·HTTP 판별·쿼리 키·상벌점 enum)이 복사되어 있던 상태를 FSD `entities`와 `shared`로 모은 단계입니다. 검증은 Vitest, `tsc -b`, FSD boundaries upward/lateral 위반 0건을 기준으로 했습니다.

### entities/gisu · organization · member

기수 목록 fetch와 라벨, `SelectedGisuProvider`는 원래 `shared`와 notices 쪽에 흩어져 있었고, 쿼리 키 문자열도 `["gisu","list"]`처럼 인라인으로 쓰였습니다. 기수는 도메인 엔티티이므로 `entities/gisu`로 옮겼습니다. `SelectedGisu`를 `shared`에 두면 `entities`를 import하게 되어 FSD 의존 방향이 역전되므로, provider도 `entities`에 두었습니다.

조직(지부·학교)은 notices와 points가 같은 `/v2/gisu` API를 서로 다른 쿼리 키로 각각 캐시하던 중복이 있었습니다. `entities/organization`의 단일 fetch·정규화와 공유 키 `["gisu","organization", id]`로 합쳤고, notices는 `toOrganizationLists`와 alias로 기존 UI 타입을 유지했습니다. 기수를 바꿀 때마다 생기던 중복 요청과 캐시 불일치를 줄이기 위한 변경입니다.

역할·파트 유니온과 PE 기준 기수(11) 상수는 auth·notices·points에 거의 같은 형태로 재정의되어 있었습니다. `entities/member`에 `ROLE_TYPES` / `RoleType`, `MemberPart`, `PE_PART_GENERATION`을 두고 feature가 이를 import·재export하도록 맞춰, 한쪽 feature만 enum을 고치면 다른 feature가 깨지는 상황을 줄였습니다.

### shared 헬퍼와 쿼리 키 팩토리

`getHttpStatus`, `toPositiveInt` / `readNumber` / `toId`, 빈 응답 본문 검사 같은 로직이 notices/points/command/vote/storage에 복제되어 있었습니다. `shared/lib/http-status.ts`, `to-positive-int.ts`, `shared/api/has-response-body.ts`로 모으고, feature에서는 thin re-export만 남겼습니다.

쿼리 키는 `["notices","list", …]`, `["notices","detail", id]`와, 수정 화면 투표 삭제 무효화에 쓰이던 오타성 `["notice-detail", id]`가 공존해, `invalidateQueries`가 의도한 캐시를 지우지 못하는 위험이 있었습니다. `noticeKeys` / `challengerKeys` 팩토리로 키를 통일하고, 수정 화면도 `noticeKeys.detail`을 쓰도록 바꿨습니다.

### 상벌점 유형과 벌점 범위

UI 옵션이 `{ id, label, score }`만 있고 부여 시 `LABEL_TO_POINT_TYPE[label]`로 라벨을 enum에 역매핑하던 구조에서는, 「업무 불이행」처럼 맵에 없는 라벨이 `CUSTOM`으로 저장되는 버그가 있었습니다. `PointTypeOption.pointType`에 enum을 직접 두고 역매핑을 삭제했으며, API에 없는 유형은 옵션에 `CUSTOM`을 명시했습니다. 라벨 문구가 바뀌거나 오타가 나도 저장되는 타입이 흔들리지 않게 하기 위한 결정입니다.

벌점 범위는 `RoleTagColor`의 primary 색 하나만 보고 campus/presidency 스코프를 켜서, 회장과 파트장을 동시에 가진 구성원이면 첫 색만 반영됐습니다. `getPenaltyScopesForRoleTypes(roleTypes[])`와 `PointsMember.roleTypes`의 원본 `RoleType[]`로 바꿔, 교내·회장단 벌점 유형이 함께 보이도록 했습니다.

---

## 4단계 — 데이터 흐름

4단계는 쓰기·캐시·필터·재시도·오류 메시지를, 수동 state와 클라이언트 전량 조회와 URL로 성공을 흉내 내는 방식에서, React Query의 `useMutation`·`ensureQueryData`·서버 필터·mutation 성공 경로로 옮긴 단계입니다. 최종 브랜치 기준으로 테스트는 다시 **56 files / 264 tests** 규모로 늘었습니다.

### useMutation과 캐시

create/edit/delete/vote/award/delete-point마다 `useState(isSubmitting)`과 `try/finally`로 제출 중 플래그를 관리하던 패턴은, 예외 경로에서 플래그가 풀리지 않거나 navigate 도중에 버튼이 다시 살아나 중복 제출을 만들 수 있었습니다. `useMutation`의 `isPending`에 로딩 UI를 연결하고, 성공 토스트와 navigate는 `onSuccess`(또는 `mutateAsync` 성공 직후)로 옮겼습니다.

공지 상세 라우트 loader는 React Query 캐시를 거치지 않고 `fetchGisuList()`와 조직 fetch를 직접 호출하고 있었습니다. 그 결과 목록·헤더가 이미 같은 기수·조직 데이터를 캐시에 갖고 있어도, 상세에 들어갈 때마다 API를 다시 호출했습니다. 또한 공지 수정이 성공하면 `invalidateQueries(noticeKeys.all)`로 React Query 캐시를 무효화하는 동시에 `router.invalidate`로 라우트 loader까지 다시 실행해, 같은 공지·기수·조직 데이터를 서로 다른 경로로 두 번 다시 요청했습니다. 이후에는 loader와 목록이 `ensureQueryData(gisuListQueryOptions)`와 `gisuOrganizationQueryOptions`로 기존 캐시를 재사용하도록 바꿨고, 수정 성공 후에는 `noticeKeys.lists()`와 `noticeKeys.detail(id)`만 무효화한 뒤 navigate하도록 단순화했습니다.

기수 목록은 `page`를 올리며 `size=20`으로 최대 10페이지를 순차 요청하던 방식을, `GET /v1/gisu?page=0&size=200&sort=generation,desc` 한 번으로 바꿨습니다. 헤더 기수 셀렉트를 열 때마다 여러 번의 HTTP 왕복이 나가던 비용을 줄이기 위한 변경이며, 기수 개수는 보통 200개 미만이라는 전제입니다.

스토리지 이미지 업로드는 파일을 하나씩 순차 올리던 `uploadStorageFiles`를 `Promise.all`로 병렬 업로드하되 입력 순서는 유지하도록 바꿔, 첨부 여러 장일 때 체감 지연을 줄였습니다.

### 공지 목록 서버 필터와 등록 재시도

공지 목록은 API에 `gisuId` / `noticeTab` / `keyword` 정도만 보내고, chapter/school/part는 목록 전체 페이지를 순차 fetch한 뒤 `targetInfo`로 클라이언트에서 필터하고 다시 페이지를 나누고 있었습니다. 필터가 걸린 목록에서 N페이지를 모두 받아오면 느리고, 서버가 준 totals와도 어긋납니다. `chapterId` / `schoolId` / `part`를 요청 파라미터에 넣고, 사용자가 요청한 page 한 장만 쓰도록 바꿨으며, 전체 페이지를 순차 조회하던 헬퍼는 삭제했습니다.

다만 `staffRecipient`(받는 사람)는 API가 아직 지원하지 않아, 현재 페이지 데이터에만 클라이언트 필터를 유지합니다. totals는 서버 값이므로, 화면에는 필터 결과가 10건 미만처럼 보일 수 있다는 한계를 문서로 남깁니다.

등록이 실패한 뒤 재시도할 때 `postNotice`부터 전체를 다시 실행하면 공지가 중복 생성될 수 있었습니다. 또한 links/images가 비어 있어도 replace API를 호출하거나, 수정 시 내용이 바뀌지 않았는데도 NOTICE-104/105를 항상 호출하는 낭비가 있었습니다. `progress`(imageIds, noticeIds, attached, voted)로 이미 끝난 단계를 건너뛰고, 비어 있거나 변경이 없는 replace는 생략하되 첨부·링크를 비우는 동작은 반드시 호출하도록 바꿨습니다. 첨부 실패 후 재시도가 흔한 실패 모드이고, 중복 생성된 공지는 복구가 어렵기 때문입니다.

### outcome URL 제거와 오류 구분

목록이 `?publishOutcome=` 같은 search를 읽어 토스트를 띄우고, 모듈 전역 `*ToastConsumed` 플래그로 Strict Mode 이중 실행을 막던 구조는, 1단계 DEV 가드 이후에도 QA용 이중 경로로 남아 있었습니다. 해당 search·훅·mock을 제거하고, 성공 토스트는 mutation 성공 시점에만 띄우도록 정리했습니다. 이미지 로딩 QA용 `imageLoadState` 등은 DEV 전용으로 잠시 남았으며, 후속 정리 후보입니다.

axios 오류를 대개 `network_error`(“네트워크를 확인해 주세요”) 한 가지로 묶으면, 서버가 돌려준 4xx 메시지가 무시됩니다. 응답 자체가 없으면 `network_error`로, HTTP 응답이 있으면 `server_error { message }`로 나누고 UI가 문구를 분기하도록 바꿔, 권한·검증 실패를 네트워크 문제로 오인해 재시도만 반복하는 상황을 줄였습니다.

의도적으로 보류한 항목으로는 운영진 `staffRecipient` / 지부 범위의 서버 전송, `patchNotice`의 미변경 생략, 투표 mutation 오류 세분화가 있습니다.

---

## 5단계 — 화면 구조

5단계는 URL과 로컬 state와 effect가 같은 필터를 이중으로 들고, 대형 JSX·경로 정규식·deep import가 구조를 복잡하게 만들던 부분을 정리한 단계입니다. 4단계 작업과 커밋이 시간상 교차 배치된 구간이 있으므로, 아래 항목이 이슈 체크리스트상 5단계 범위입니다.

### 목록 필터를 URL 단일 출처로

공지 목록은 `useState(filters/page)`와 라우트 `search`를 양방향으로 맞추는 `useEffect`가 많았고, 지부→학교 연쇄·락·권한 보정도 필터 컴포넌트 안 effect가 약 10개에 달해, 새로고침·공유 URL과 화면 state가 어긋나기 쉬웠습니다. `Route.useSearch()`와 `navigate({ search })`를 유일한 소스로 두고, `normalizeNoticeListFilters(...)` 순수 함수가 옵션·락 대비 유효성을 한 번에 맞추도록 바꿨습니다. 조직 옵션을 로딩하는 중에는 URL 값을 지우지 않고, 옵션이 준비된 뒤에만 검증해 성급한 reset을 막았습니다. effect 체인은 실행 순서와 타이밍에 따라 버그가 나기 쉽고, URL이 지금 보고 있는 필터를 나타내야 북마크와 뒤로가기가 맞다는 이유입니다.

상벌점 목록은 chapter/school/part/query/page가 전부 컴포넌트 local state라, 새로고침하면 필터가 초기화되었습니다. `points.index`에 `validateSearch`를 추가해 필터·페이지를 search param으로 관리하고, 공지와 같이 공유 가능한 목록 URL을 맞췄습니다.

### 작성 폼 잠금과 대형 모듈 분리

create 페이지의 기수 기본값·챌린저 전용·지부/학교 락·org clear·파트 필터 등 lock 관련 `useEffect` 6~7개와, create/edit에 복붙되어 있던 이탈 확인·투표 초안 로직은 `normalizeNoticeCreateForm(form, locks, generation)` 한 경로와 `use-notice-compose-blocker` / 투표 초안 공유 훅으로 정리했습니다. effect가 form을 뒤늦게 고치면 한 프레임 동안 잘못된 값이 보이거나 무한 루프가 날 수 있고, 순수 정규화가 테스트와 추론에 유리합니다.

`AwardPointsModal`(약 600줄 이상), `notice-create-form-fields` / `notice-create-vote-panel`(각 약 850줄)은 동작을 바꾸지 않고 `award-points/`, `notice-create/` 하위 모듈로 분리해, 리뷰·충돌·이후 DS 교체 단위를 줄였습니다.

### 상벌점 상세 경로, AdminShell staticData, feature 공개 API

경로는 `/activity/points/$memberId`인데 API·쿼리는 `challengerId` 중심이었고, search에 `challengerId`를 또 실어 혼선이 났으며, 로딩 중에는 `null`을 렌더해 빈 화면이었습니다. `/activity/points/$challengerId`로 맞추고, 잘못된 id면 “찾을 수 없어요”를 보여 주며, 로딩은 `MemberDetailSkeleton`(DS `Skeleton`)을 쓰고, `challengerId`가 없는 행은 상세로 보내지 않도록 했습니다.

AdminShell이 pathname과 `RegExp`로 공지·상벌점 화면을 판별해 헤더/배경을 끄던 방식은, 경로가 rename되면 셸이 깨지기 쉽습니다. 각 라우트에 `staticData: { shell: { hideTitleBlock, shellLayout, … } }`를 두고, 셸이 `useMatches()`의 leaf 데이터를 읽도록 바꿨습니다. 레이아웃 정책을 라우트 선언에 두는 편이 `$challengerId` rename과 함께 검증하기에도 안전합니다.

routes/widgets가 `@/features/notices/model/...`, `ui/...` 등 내부 경로를 직접 import하던 약 20건은 `features/notices/index.ts`로 loader·타입·페이지를 re-export하고, ESLint `no-restricted-imports`로 `@/features/notices`만 쓰게 강제했습니다. index가 UI까지 끌어와 번들 스플리팅 이득은 줄 수 있지만, FSD에서 feature 내부는 구현 상세이므로 공개 표면을 우선했습니다. app 레이어 deep import 제한과 PascalCase rename은 이월했습니다.

---

## 6단계 — 디자인 시스템

6단계는 앱이 DS **0.11.1**과 수제 포털·Bone·내부 클래스에 묶여 있던 부분을 **0.14.2와 공개 컴포넌트**로 맞춘 단계입니다. `@umc-product/react`, `icons`, `design-tokens`를 함께 `pnpm up`했고, 이 앱은 `HeaderHomeLink context="operation"`, Toast `brand`를 쓰고 있어 0.12 브레이킹의 큰 영향 없이 `tsc`를 통과했습니다. 세 패키지 버전을 서로 다르게 올리면 스타일과 peer dependency가 깨지기 쉽고, 0.12~0.14 Field/헤더/Select의 미세 시각 변화는 실기기에서 Figma와 대조하는 것을 권장합니다. 이 대조는 로그인과 API가 필요합니다.

### Dialog·Panel·Tooltip과 딤

`app.css`에서 `.umc-dialog__backdrop`에 `!important`로 색을 덮고, 공지 create/edit/detail/vote에 `NoticeDialogDimmed` 수제 딤을 덧대던 방식은 DS 업그레이드마다 깨지기 쉬워, `--umc-dialog-backdrop-bg` CSS 변수로 통일하고 `NoticeDialogDimmed`를 삭제했습니다. Panel 위에 Dialog를 쌓을 때 쓰는 `body.award-discard-open` 조정은 CSS 변수만으로는 대체할 수 없어 유지했습니다.

상벌점 삭제의 `createPortal` 수제 모달은 DS `Dialog`로, 투표 패널은 DS `Panel`로, 역할 셀의 좌표 계산 수제 메뉴는 `Tooltip openOn="click"`으로 옮겼습니다. 투표 달력을 body 포털로 띄우면 outside-press로 Panel이 닫히므로, Panel 안 `fixed`로 두었습니다. 삭제 Dialog는 DS가 확인 시 항상 close하므로, 비동기 처리 중에는 `close-press`를 무시하고 성공 또는 `onCancel`에서만 닫도록 테스트를 고정했습니다.

### Skeleton · Divider · ErrorPage · shared/ui

로컬 `Bone`, 수제 `<hr>`, 페이지마다 달랐던 권한/네트워크/삭제됨 마크업은 DS `Skeleton` / `Divider` / `ErrorPageContainer`(+`FullPageError` 래퍼)로 통일했습니다. Skeleton 색·radius나 ErrorPage의 공사 중 일러스트가 예전 아이콘형 Figma와 다를 수 있어 디자인 확인이 필요합니다.

빈 목록·인라인 알림·테이블 바깥 틀이 파일마다 복붙되던 부분은 `EmptyState`, `InlineAlert`, `DataTableShell` / `DataTableBody`로 이관했습니다. 오류 알림에 성공용 `CheckCircleIcon`을 쓰던 곳은 `WarningIcon`으로 바꾸고, 투표 제목의 `.umc-text-field-box-field__*` 직접 조작은 DS `TextFieldBox`로 교체했습니다.

### 이월 (DS 한계)

TextArea/본문/링크/옵션 행의 `.umc-*__*` 직접 조작, PageHeader 제목 숨김 셀렉터, 삭제 Dialog 버튼 `disabled`, 이미지 라이트박스 포털 등은 DS에 대응 API·컴포넌트가 없거나 prop이 없어, 당분간 유지하거나 핸들러 가드·별도 제안이 필요합니다. 브라우저에서 Figma와 대조하는 작업은 jsdom만으로는 끝나지 않아 DEFERRED로 적었습니다.

---

## 7단계 — 품질 도구

7단계는 린트·경계·API 타입·핵심 라우트 흐름을 도구로 고정해, 1~6단계에서 맞춘 구조가 다시 무너지지 않게 한 단계입니다.

### FSD boundaries와 typed ESLint

`boundaries/dependencies`가 warn이면 CI가 통과해도 FSD 역방향·수평 import가 쌓일 수 있어 error로 격상했습니다. 전환 직전 위반이 0건이라 추가 코드 수정은 없었습니다. 3단계에서 entities를 넣은 뒤에도 규칙이 warn이면 features끼리 다시 직접 import하기 쉽다는 판단입니다.

`typescript-eslint` recommended(타입 정보를 쓰지 않는 규칙)만 쓰던 설정에 `recommendedTypeChecked`와 `projectService`를 `src/**`에 적용하고, `jsx-a11y` recommended와 `check-file` kebab-case를 넣었습니다. 테스트의 `no-unsafe-*`는 mock 때문에 노이즈가 커 범위를 줄였고, routes의 `only-throw-error`는 TanStack `redirect()` throw가 공식 패턴이라 예외로 두었으며, JSX의 `no-misused-promises`는 이벤트 핸들러와 충돌해 범위를 조정했습니다. `features/points/ui`, `widgets/admin-shell` 등 PascalCase 파일 약 33건은 warn으로 두고, rename 단독 PR 전까지 예외로 둡니다. typed lint로 `client.ts`의 `Promise.reject`를 `throw`로 바꾸고, `notice-api-error`의 `any`를 제거했으며, 불필요한 `as`를 정리했습니다.

### openapi-typescript와 통합 테스트

API 타입이 feature마다 수기(`notice-api.types.ts` 등)로 있어, OpenAPI와 어긋나도 컴파일이 모를 수 있었습니다. `pnpm gen:api` → `scripts/gen-api.mjs` → `src/types/api.d.ts` 파이프라인을 두고, 스펙은 CLI 인자, `OPENAPI_SPEC` 환경 변수, 로컬 스펙 파일 순으로 찾도록 했으며 README에 사용법을 적었습니다. 수기 타입을 `components["schemas"]`로 일괄 교체하지는 않았고 점진 이관으로 남겼습니다. `/v3/api-docs`는 401이 나므로 URL 기본값 없이 스펙 파일을 수동으로 두는 전제입니다.

단위 테스트 위주였던 상태에서 `_admin` beforeLoad(허용/redirect/logout/403/ApiError/토큰 소실/errorComponent), 공지·상벌점 `validateSearch`, 공지 URL→parse→normalize→build 흐름을 통합 테스트로 고정했습니다. 5단계에서 URL 단일 출처와 가드 경로를 바꿨으므로, 라우트 계약을 회귀에서 지키려는 목적입니다.

---

## 공지 상세 URL 파라미터에 대한 후속 논의

리팩토링 이후 공지 상세 라우트에는 DEV QA용 `imageLoadState` / `imageLoadPause`가 search에 남아 있습니다. 목록 탭 복원용 `listAudience`는 URL search에서 제거하고 history state로 옮겼습니다.

### `listAudience` / 목록 탭·페이지 (history · local state)

목록 탭(`audience`)과 페이지네이션은 URL search에 두지 않습니다. 탭은 `navigate({ state: { listAudience } })` history state로, 페이지는 목록 화면 로컬 state로 관리합니다. 필터(`q`, 지부·학교 등)만 URL에 남겨 뒤로가기 복원을 유지합니다. 상세·수정 왕복도 같은 history state로 탭을 이어 가며, 새로고침·새 탭·외부 공유 시 state가 없으면 기본 탭(`challenger`)·1페이지로 돌아갑니다.

### `imageLoadState` / `imageLoadPause` (제거·로컬 상태 전환 후보)

이 파라미터는 공지 본문·메타가 이미 로드된 상태에서, “이미지만 못 불러왔다”는 인라인 경고 UI를 Figma 상태처럼 URL로 흉내 내는 DEV QA용 상태머신입니다. 프로덕션에서는 `onlyInDev` 때문에 파싱되지 않으며, 코드에도 API 연동 시 제거 취지의 TODO가 있습니다. 실제 이미지 fetch/재시도 API가 아니라 mock이므로, 라우트 search에서 키를 빼고 컴포넌트 `useState`로 pending/loading/success를 돌리거나, 제품 UX가 필요하면 갤러리 `<img onError>`와 refetch로 로컬 status만 다루는 편이 URL 부채를 줄입니다.

---

## 단계별로 남긴 과제 (요약)

| 영역     | 남겨 둔 내용                                                   | 이유                       |
| -------- | -------------------------------------------------------------- | -------------------------- |
| 파일명   | PascalCase → kebab 일괄 rename                                 | blame·충돌 비용, 단독 PR   |
| API 필터 | `staffRecipient` 등 서버 전송                                  | API·정규화 한계            |
| OpenAPI  | `api.d.ts` 생성만, 수기 타입 점진 치환                         | 일괄 교체 리스크, 스펙 401 |
| DS       | `.umc-*__*` 일부, PageHeader 숨김, Dialog disabled, 라이트박스 | DS API/컴포넌트 부재       |
| 시각 QA  | 0.14.2 + ErrorPage 일러스트 Figma 대조                         | 로그인·API·실기기 필요     |
| 공지 URL | `imageLoad*` DEV search 제거                                   | DEV mock 정리              |
