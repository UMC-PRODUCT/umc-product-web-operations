# 인증 패키지 분리 경계

이 문서는 `src/lib/auth-client`를 `@umc-product/auth-client`(가칭) 패키지로 올리기 **전에**, 무엇을 패키지에 넣고 무엇을 각 앱에 남겨야 하는지를 정리한다.

실사용 연동 절차는 [SSO 로그인 연동 가이드](./sso-integration-guide.md)를 본다. 이 문서는 **소유권·경계·업로드 전 정리 항목**에 초점을 둔다.

---

## 1. 한 줄 기준

| 구분                      | 질문                                               | 어디에 두나 |
| ------------------------- | -------------------------------------------------- | ----------- |
| **인증 (Authentication)** | 이 사람이 UMC SSO로 로그인했는가? 토큰은 유효한가? | **패키지**  |
| **인가 (Authorization)**  | 이 사람이 *이 앱 / 이 화면*에 들어와도 되는가?     | **앱**      |

패키지는 “로그인·토큰·갱신·로그아웃·PKCE·콜백 교환”만 담당한다.  
“운영진인지”, “기수 필터를 어떻게 고정할지”, “비운영진에게 어떤 문구를 보여줄지”는 앱 정책이다.

---

## 2. 현재 코드가 어디에 있는지

```
src/lib/auth-client/          ← 패키지 후보 (공통 SSO 클라이언트)
  api-error.ts
  create-auth-client.ts
  http.ts
  pkce.ts
  storage-keys.ts
  types.ts
  index.ts
  react/
    auth-provider.tsx
    dev-login-form.tsx
    index.ts
  *.test.ts(x)

src/shared/auth/              ← 앱 어댑터 (백오피스 전용 설정)
  sso-client.ts               싱글톤 생성
  resolve-sso-env.ts          origin → clientId/URL 매핑

src/shared/api/client.ts      ← 앱의 axios + Bearer/401 복구
src/shared/ui/loading-spinner.tsx  ← 앱 UI (패키지 아님)

src/routes/login.tsx          ← 앱 라우트
src/routes/auth/callback.tsx  ← 앱 라우트
src/routes/_admin/route.tsx   ← 앱 인가 가드

src/features/auth/            ← 백오피스 도메인 (운영진·기수·안내 UI)
  api/session.ts              /v2/member/me → AdminSession
  model/admin-session.ts
  model/admin-access.ts
  model/operator-only-login-notice.ts
  model/operator-gisu-context.tsx
  ui/access-notice.tsx
  api/gisu-*.ts               기수 API (인가/운영 도메인)
```

---

## 3. 패키지에 넣을 것 (`src/lib/auth-client`)

### 3.1 포함 범위

다음을 **그대로** 패키지 소스로 옮기는 것이 목표다.

| 모듈                                  | 역할                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `createAuthClient`                    | SSO 클라이언트 팩토리. PKCE, authorize, token, renew, logout, session 정리 |
| `ApiError` / `isAuthCodeRestart`      | 공통 에러 타입·콜백 재시작 코드 판별                                       |
| `types`                               | `AuthClient`, `AuthClientConfig`, `LoginMode` 등 공개 타입                 |
| `pkce`                                | code verifier/challenge                                                    |
| `http` / `readApiResult`              | SSO API envelope 파싱                                                      |
| `storage-keys`                        | `umc.sso.*` 스토리지 키 (추후 prefix 설정화 검토)                          |
| `react/AuthClientProvider`, `useAuth` | React에서 status/member/login/logout 구독 (선택 사용)                      |
| `react/DevLoginForm`                  | `loginMode: "direct"` 로컬 개발용 이메일·비밀번호 폼                       |
| 관련 단위 테스트                      | 패키지 레포로 함께 이동                                                    |

### 3.2 패키지가 책임지는 동작

1. **로그인 시작** (`startLogin`)
   - PKCE·state·returnTo를 sessionStorage에 저장
   - `auth-app`이면 인증 앱 `/authorize`로, `direct`이면 API authorize URL로 **replace** 이동
2. **콜백 처리** (`handleCallback`)
   - `code`/`state` 검증 → token 교환 → access/refresh 저장 → `returnTo` 반환
   - `AUTHENTICATION-0034` / `0035`면 로그인 재시작
3. **토큰 생명주기**
   - `getAccessToken` / `getRefreshToken` / `setTokens` / `clearSession`
   - `renewAccessToken`, `recoverFromUnauthorized` (401 복구 + `onUnauthenticated` 정책)
4. **로그아웃** (`logout`)
   - refresh 폐기 API 호출 후 로컬 세션 삭제
   - `global: true`면 인증 앱 `/logout?return_to=...`로 **replace** 이동
5. **편의 API**
   - `createApiFetch()` — fetch 기반 Bearer + 401 재시도
   - `devLogin` — direct 모드 전용
   - `hasSsoSession` — SSO 세션 존재 여부 확인

### 3.3 패키지가 가정하는 고정값 (업로드 전 합의 필요)

현재 구현에 박혀 있어, 패키지 공개 전에 유지할지 설정으로 뺄지 정해야 한다.

| 항목        | 현재 값                                     | 영향                                                                            |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| 콜백 경로   | `/auth/callback` 고정                       | 앱은 반드시 이 라우트를 만들고, `redirectUri`도 이 경로와 맞춰야 함             |
| 스토리지 키 | `umc.sso.*` 고정                            | 같은 브라우저·같은 origin에서 키 충돌 가능. 멀티 앱/서브패스면 prefix 옵션 검토 |
| 히스토리    | 로그인·글로벌 로그아웃에 `location.replace` | 보호 화면이 뒤로가기로 다시 열리지 않게 하려는 의도                             |
| React peer  | React 19 가정 (이 레포 기준)                | 패키지 `peerDependencies`에 명시                                                |

### 3.4 패키지 공개 API (목표)

앱이 import 하는 표면은 최소한 아래로 유지한다.

```ts
// @umc-product/auth-client
export { createAuthClient, ApiError }
export type {
  AuthClient,
  AuthClientConfig,
  LoginMode,
  SsoMember,
  UnauthenticatedPolicy,
}

// @umc-product/auth-client/react  (또는 동일 패키지 subpath)
export { AuthClientProvider, useAuth, DevLoginForm }
```

내부 모듈(`pkce`, `storage-keys`, `http`)은 가능하면 비공개로 둔다.

---

## 4. 앱에서 따로 구현해야 하는 것

아래는 **패키지에 넣으면 안 되는** 백오피스(또는 각 제품) 코드다. 다른 앱이 이 레포를 복사해 가져가면 깨지거나, 잘못된 권한 모델이 전파된다.

### 4.1 환경·클라이언트 설정 (앱 어댑터)

| 파일                                 | 앱이 할 일                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/shared/auth/resolve-sso-env.ts` | **이 앱의** origin → stage → `apiBaseUrl` / `authAppUrl` / `clientId` / `loginMode`. 배포 URL은 stage 표에 고정. |
| `src/shared/auth/sso-client.ts`      | `createAuthClient` 싱글톤. `onUnauthenticated: "login" \| "ignore"` 정책도 앱이 정한다.                          |
| env (로컬만)                         | `VITE_AUTH_APP_URL`, `VITE_SSO_LOGIN_MODE`, `VITE_DEV_API_PROXY_TARGET`. 배포 빌드는 env 없이 origin만으로 해석  |

멤버 앱·다른 백오피스는 **자기 origin 표와 `clientId`를 새로 작성**해야 한다. `resolve-sso-env.ts`를 패키지에 넣거나 그대로 복사하면 안 된다.

### 4.2 라우트·화면 셸

패키지는 React Router / TanStack Router 라우트를 제공하지 않는다. 앱이 만든다.

| 라우트           | 앱 책임                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `/login`         | `startLogin` 또는 `devLogin` 호출. 로딩 UI, 에러 문구, (백오피스) 비운영진 안내 표시         |
| `/auth/callback` | `handleCallback` 1회 실행(Strict Mode 대비 Promise 캐시), 성공 시 `returnTo`로 이동, 실패 UI |
| 보호 레이아웃    | 토큰 없으면 `/login`으로 **replace** 리다이렉트. 로그인한 뒤 앱 권한 검사                    |

콜백 경로를 바꾸려면 패키지 설정을 확장한 뒤에야 가능하다. 지금은 `/auth/callback`에 맞춘다.

### 4.3 HTTP 클라이언트 연동

| 방식               | 설명                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `createApiFetch()` | 패키지 제공. fetch만 쓰는 새 앱에 적합                                                                        |
| axios 인터셉터     | **앱이 직접** 붙인다. 이 레포는 `src/shared/api/client.ts`에서 Bearer 주입 + 401 시 `recoverFromUnauthorized` |

axios 인스턴스, baseURL, `skipAuth`, renew 경로 스킵 목록은 앱 HTTP 스택의 일부이므로 패키지에 넣지 않는다.

### 4.4 인가·도메인 세션 (백오피스 `features/auth`)

전부 **앱 전용**이다.

| 구분                                                 | 내용                                | 패키지? |
| ---------------------------------------------------- | ----------------------------------- | ------- |
| `/v2/member/me` → `AdminSession`                     | 운영진 여부·스코프·역할 매핑        | ❌      |
| `isOperator` / `resolveAdminAccess`                  | 백오피스 출입 규칙                  | ❌      |
| `OperatorOnlyNotice` / `ForbiddenNotice`             | 제품 UX 문구·버튼                   | ❌      |
| `operator-only-login-notice` (sessionStorage 플래그) | 비운영진 로그아웃 후 안내           | ❌      |
| `OperatorGisuProvider` / 기수 API                    | 운영 도메인                         | ❌      |
| `_admin` beforeLoad 가드                             | 비운영진 글로벌 로그아웃 → `/login` | ❌      |

다른 앱 예시:

- **멤버 앱**: 로그인만 되면 통과. `/me`는 프로필용으로만 쓰고 “운영진” 검사는 없음.
- **다른 관리 툴**: 역할 집합이 다를 수 있음. 백오피스 `isOperator`를 재사용하지 말 것.

### 4.5 UI 장식

| 항목                                | 위치            | 패키지?                                         |
| ----------------------------------- | --------------- | ----------------------------------------------- |
| `LoadingSpinner` / `AuthBusyScreen` | `src/shared/ui` | ❌ (DS에 Spinner 없을 때 앱이 만든 민트 스피너) |
| 로그인/콜백 레이아웃                | routes          | ❌                                              |

패키지에 스피너·토스트·디자인 시스템 의존을 넣지 않는 편이 안전하다. `DevLoginForm`만 개발 편의용으로 예외적으로 포함한다.

---

## 5. 책임 나누기 다이어그램

```
[사용자]
   │
   ▼
[앱 /login] ── startLogin/devLogin ──► [패키지 AuthClient]
   │                                         │
   │                                         ▼
   │                              [인증 앱 또는 API authorize]
   │                                         │
   ▼                                         ▼
[앱 /auth/callback] ◄── code ── handleCallback (패키지)
   │                         토큰 저장
   ▼
[앱 보호 레이아웃]
   │  토큰 없음? → /login (앱)
   │  토큰 있음? → 앱 권한 API (/me 등)
   │                 ├─ 통과 → 앱 화면
   │                 └─ 거부 → 앱 UX (로그아웃·안내 등)
   ▼
[앱 API 클라이언트] ── Bearer / 401 ──► recoverFromUnauthorized (패키지)
```

핵심: **토큰 경계까지가 패키지**, **그 다음 분기부터가 앱**.

---

## 6. 앱별 구현 체크리스트

새 앱이 패키지를 붙일 때 앱 쪽에서 채워야 하는 항목이다.

1. 인증 서버에 `clientId` + `https://<origin>/auth/callback` 등록
2. origin별 `AuthClientConfig` 작성 (이 백오피스 `resolve-sso-env` 복사 금지)
3. `createAuthClient` 싱글톤 + `onUnauthenticated` 정책
4. `/login`, `/auth/callback` 라우트 구현
5. API 레이어에 Bearer + 401 → `recoverFromUnauthorized` (또는 `createApiFetch`)
6. 보호 라우트에서 비로그인 → `/login` (**replace** 권장)
7. **앱 자체 인가** (필요 시 `/me`·역할·안내 UI). 없으면 “로그인만 되면 OK”
8. 로그아웃 UX: `logout({ global: true, returnTo })` 사용 여부·도착 URL은 앱이 결정

---

## 7. 업로드 전에 정리하면 좋은 것

패키지로 올리기 직전, 아래를 합의·정리하는 것을 권장한다.

### 7.1 반드시 확인할 것

- [ ] 공개 export 목록 확정 (`index` / `react` subpath)
- [ ] `peerDependencies`: `react`, (필요 시) `react-dom` 버전
- [ ] 콜백 경로 고정(`/auth/callback`)을 문서에 명시할지, `callbackPath` 옵션을 추가할지
- [ ] 스토리지 키 prefix 설정 필요 여부
- [ ] `AuthLocation.replace` / `assign` 테스트 더블 요구사항을 README에 명시
- [ ] 이 레포 import를 `@umc-product/auth-client`로 교체하는 마이그레이션 PR 계획

### 7.2 패키지에 넣지 말 것 (재확인)

- [ ] `resolve-sso-env` / 백오피스 origin·`clientId` 표
- [ ] `features/auth` 운영진·기수·안내 플래그
- [ ] axios `client.ts`
- [ ] `login` / `callback` / `_admin` 라우트 컴포넌트
- [ ] `LoadingSpinner` 등 제품 UI

### 7.3 이 레포에 남을 얇은 어댑터

패키지 분리 후에도 백오피스에는 대략 다음만 남는다.

```
shared/auth/resolve-sso-env.ts   # 환경 표
shared/auth/sso-client.ts        # createAuthClient 싱글톤
shared/api/client.ts             # axios 연동
routes/login.tsx
routes/auth/callback.tsx
routes/_admin/route.tsx          # 인가
features/auth/*                  # 운영 도메인
```

`src/lib/auth-client`는 패키지 의존으로 대체되고, 로컬 폴더는 삭제하거나 workspace 링크만 남긴다.

---

## 8. 기존 가이드와의 관계

| 문서                                                                           | 읽는 사람          | 내용                                             |
| ------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------ |
| [auth-client-package-boundary.md](./auth-client-package-boundary.md) (본 문서) | 패키지 작성·리뷰어 | 무엇을 분리할지, 앱 책임은 무엇인지              |
| [sso-integration-guide.md](./sso-integration-guide.md)                         | 앱 연동 개발자     | 어떻게 `createAuthClient`를 붙이는지 단계별 절차 |

연동 가이드의 “공통 vs 앱” 요약은 본 문서 기준을 따른다. 패키지명이 확정되면 두 문서의 import 경로 예시를 함께 갱신한다.

---

## 9. 요약

- **패키지**: SSO 로그인·토큰·갱신·로그아웃·PKCE·(선택) React Provider / DevLoginForm.
- **앱**: origin/`clientId` 설정, `/login`·`/callback` 라우트, HTTP 클라이언트 연동, **인가·제품 UX·도메인 API**.
- 백오피스의 `features/auth`, `_admin` 가드, 비운영진 안내는 **패키지 후보가 아니다**.
- 업로드 전 고정값(콜백 경로, 스토리지 키)과 공개 API·peer 의존성을 먼저 잠근다.
