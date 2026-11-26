# 목록 필터를 URL이 아닌 History State로 유지하는 방식

이슈 [#63](https://github.com/UMC-PRODUCT/umc-product-web-operations/issues/63) 작업 기록입니다.  
공지 목록 · 상벌점 관리 · 탈부 관리에서 **필터·검색어·페이지를 주소창에 노출하지 않으면서**, 상세/등록으로 나갔다 돌아와도 조건을 유지하는 구현을 설명합니다.

공유 URL·새로고침 복원은 제품 요구에서 제외했습니다. 같은 브라우저 탭 세션 안에서의 뒤로가기·브레드크럼·사이드 재진입 복원을 목표로 합니다.

---

## 1. 왜 URL search를 쓰지 않는가

이전에는 공지·상벌점 필터를 `?chapter=…&q=…` 형태의 **URL search**에 두었습니다.

| 장점                                           | 단점                             |
| ---------------------------------------------- | -------------------------------- |
| 새로고침·북마크·공유 시 동일 조건 복원         | 주소창에 내부 필터가 그대로 노출 |
| 브라우저 히스토리에 URL이 남아 뒤로가기가 쉬움 | QA·데모 시 지저분한 URL          |

이번 요구는 **주소창을 깨끗하게** 두는 것이 우선이라, 필터를 URL에서 제거하고 아래 두 층으로 옮겼습니다.

1. **History state** — 라우터 `navigate({ state })` / `location.state`
2. **메모리 스냅샷** — 모듈 변수에 마지막 목록 조건을 보관 (브레드크럼처럼 state가 비는 이동 대비)

DEV 전용 `?mock=…` 만 예외적으로 URL에 남길 수 있습니다.

---

## 2. 전체 구조

```
[목록 화면]
  필터 변경
    → parse/merge로 안전한 값만 남김
    → remember*ListView(스냅샷 교체)
    → navigate({ replace: true, search: { mock? }, state: { …목록조건 } })

[상세 / 등록으로 이동]
  → 현재 목록 조건을 state에 실어 전달
  → 동시에 스냅샷에도 저장

[목록으로 복귀]
  A. 브라우저 뒤로가기
     → 이전 history entry의 state가 그대로 복원
  B. 브레드크럼·사이드에서 /notices 등 직접 진입
     → location.state가 비어 있을 수 있음
     → resolve*ListViewState가 스냅샷으로 보완
  C. 등록 성공 후 navigate
     → state에 withdrawalListSearch 등을 다시 실어 보냄
```

핵심 API 이름 (feature별 동일 패턴):

| Feature | state 키 / 헬퍼                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------- |
| 공지    | `listAudience`, `listPage`, `listFilters` · `rememberNoticeListView` · `resolveNoticeListViewState` |
| 상벌점  | `pointsListSearch` · `rememberPointsListView` · `resolvePointsListViewState`                        |
| 탈부    | `withdrawalListSearch` · `rememberWithdrawalListView` · `resolveWithdrawalListViewState`            |

---

## 3. History state란

TanStack Router(및 브라우저 History API)는 각 히스토리 항목에 **URL과 별개인 `state` 객체**를 둘 수 있습니다.

- 주소창에는 `/notices`만 보여도
- 그 항목의 state에는 `{ listFilters: { chapterScope: "chapter:51" }, listPage: 2 }` 가 남을 수 있습니다.

목록 → 상세로 `push`하면 히스토리에 항목이 하나 더 쌓입니다.  
**뒤로가기**는 이전 항목으로 pop하므로, 그때의 state(필터)가 함께 돌아옵니다.  
URL search가 없어도 뒤로가기로 필터가 유지되는 이유입니다.

브레드크럼이 `href: "/notices"`처럼 **search/state 없이 새 이동**을 하면, 새 항목의 state는 비어 있습니다.  
그래서 스냅샷이 필요합니다.

---

## 4. 메모리 스냅샷

각 feature 모듈에 마지막 목록 조건을 담는 변수를 둡니다.

```ts
let noticeListViewSnapshot: NoticeLocationState = {}

export function rememberNoticeListView(state: NoticeLocationState) {
  // 반드시 교체(replace). merge 하면 안 됨.
  noticeListViewSnapshot = { ...state }
}
```

### 왜 merge가 아니라 교체인가

merge(`{ ...이전, ...다음 }`)를 쓰면, “파트 전체”처럼 필터를 비울 때 다음 state에 `listFilters` 키가 없거나 비어 있어도 **이전 `listFilters`가 스냅샷에 남습니다.**  
그 결과 UI에서 전체를 골라도 예전 지부·파트가 다시 복원되는 버그가 납니다.

교체로 두면 “이번 커밋된 목록 조건”이 스냅샷의 전부입니다. 클리어도 그대로 반영됩니다.

### resolve 규칙 (공지 예시)

1. `location.state`에 값이 있으면 우선 사용
2. `listFilters` 키가 state에 **명시**되어 있으면(빈 객체 포함) 스냅샷으로 덮어쓰지 않음 → “전체” 클리어 유지
3. state가 통째로 비면(브레드크럼 등) 스냅샷으로 보완

상벌점·탈부도 `pointsListSearch` / `withdrawalListSearch` 키 존재 여부로 같은 식으로 구분합니다.

---

## 5. Feature별 구현 요약

### 5.1 공지 (`/notices`)

- 라우트 `validateSearch`는 빈 객체 `{}` (필터를 URL에서 제거).
- 탭(`listAudience`) · 페이지(`listPage`) · 필터(`listFilters`)를 history state에 저장.
- `NoticeListPage`가 필터 변경·페이지·탭·상세 진입 시 `commitListView` → `remember` + `navigate({ state })`.
- 상세/수정/이미지 로드 플로우는 `listFilters`를 state에 계속 실어 왕복 시 유실을 막음.

관련 파일:

- `src/features/notices/model/notice-location-state.ts`
- `src/features/notices/ui/notice-list-page.tsx`
- `src/routes/_admin/notices/index.tsx`

### 5.2 상벌점 (`/activity/points`)

- URL에는 DEV `mock`만 허용.
- 목록 조건은 `PointsListSearch` (`chapter`, `school`, `part`, `q`, `page`)를 `pointsListSearch` state로 보관.
- 라우트에서 `resolvePointsListViewState` → `PointsPage`의 `search` / `onSearchChange`.
- 상세 진입 시 state + 스냅샷 저장, 목록 복귀 시 스냅샷 사용.
- 파트 파서는 툴바 value(`pm`, `web-pe`, legacy `WEB` 등) 화이트리스트를 허용해야 함.  
  (`/^[A-Z_]+$/`만 허용하면 PE 파트 선택이 즉시 버려짐.)

관련 파일:

- `src/features/points/model/points-location-state.ts`
- `src/features/points/model/points-list-search.ts`
- `src/routes/_admin/activity/points.index.tsx`

### 5.3 탈부 (`/activity/withdrawal`)

- URL에는 DEV `mock`만 허용.
- `WithdrawalListSearch`를 `withdrawalListSearch` state로 보관.
- 등록 화면 왕복 시 state(및 스냅샷)로 목록 조건 복원.
- 등록 성공 토스트 처리 후에도 `withdrawalListSearch`를 유지한 채 state를 정리.

관련 파일:

- `src/features/withdrawal/model/withdrawal-list-search.ts`
- `src/features/withdrawal/model/withdrawal-location-state.ts`
- `src/routes/_admin/activity/withdrawal.index.tsx`
- `src/features/withdrawal/ui/withdrawal-page.tsx`
- `src/features/withdrawal/ui/withdrawal-register-page.tsx`

---

## 6. 라우트 계약 테스트

`src/routes/_admin/-list-filter-search.test.ts`는 이제 다음을 검증합니다.

- 공지: 예전 필터 query를 넣어도 `validateSearch` 결과는 `{}`
- 상벌점·탈부: 필터 query는 버리고 `mock`만(개발 모드에서) 유지

값 단위 파싱은 각 feature의 `*-list-search.test.ts` / `notice-location-state.test.ts`에서 다룹니다.

---

## 7. 동작 체크리스트

- [ ] 필터를 건 뒤 주소창에 `chapter` / `q` 등이 **안** 보인다
- [ ] 상세(또는 등록) 진입 후 **뒤로가기** 시 필터·페이지 유지
- [ ] 브레드크럼으로 목록 복귀 시에도 같은 탭 세션 안에서는 유지
- [ ] 공지에서 지부/학교/파트 **전체** 선택이 이전 값을 지우는지
- [ ] 상벌점에서 PE 파트(`web-pe` 등) 선택이 유지·조회되는지
- [ ] 새로고침 시 필터가 초기화되는 것은 현재 스펙상 허용

---

## 8. 의도적으로 하지 않은 것

- 필터를 다시 URL search로 두는 것 (공유·북마크 복원)
- `sessionStorage` / `localStorage` 영속화 (탭을 닫으면 스냅샷도 사라짐)
- 브레드크럼 컴포넌트가 state를 직접 넘기도록 DS/`PageHeader`를 수정하는 것 (스냅샷으로 보완)

나중에 공유 URL이 필요해지면, history state와 병행해 search를 선택적으로 동기화하는 방식을 검토하면 됩니다.
