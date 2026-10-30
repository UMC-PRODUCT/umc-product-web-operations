# SSO 로그인 연동 가이드

이 문서는 다른 UMC 웹 앱에서 공통 SSO 로그인을 붙일 때, **무엇을 가져가고 무엇을 앱에서 직접 만들어야 하는지**를 설명합니다.

패키지로 분리할 코드 경계·업로드 전 정리 항목은 [인증 패키지 분리 경계](./auth-client-package-boundary.md)를 먼저 보면 좋습니다.

지금 이 레포에서는 공통 로그인 코드가 `src/lib/auth-client`에 있습니다. 나중에 `@umc-product/auth-client` 같은 패키지로 분리되면 import 경로만 바뀌고, 아래 흐름과 API는 그대로 쓰는 것을 목표로 합니다. 실제 사용 예시는 이 백오피스의 `src/shared/auth`, `src/routes/login.tsx`, `src/routes/auth/callback.tsx`, `src/shared/api/client.ts`를 보면 됩니다.

---

## 먼저 이해할 것: 로그인과 권한은 다릅니다

SSO가 하는 일은 **“이 사람이 UMC 계정으로 로그인했는지”** 를 확인하는 것입니다. 토큰을 발급하고, 만료되면 갱신하고, 로그아웃하는 것까지가 공통 모듈의 범위입니다.

반대로 **“이 사람이 이 앱(또는 이 페이지)에 들어와도 되는지”** 는 앱마다 다릅니다. 운영 백오피스는 운영진만 들여보내야 하고, 멤버용 앱은 로그인한 멤버면 충분할 수 있습니다. 그 판단은 `/v2/member/me` 같은 앱·도메인 API와 화면 정책에 달려 있으므로, 공통 로그인 패키지에 넣지 않습니다.

그래서 연동할 때도 순서를 이렇게 생각하면 됩니다. 먼저 공통 클라이언트로 로그인을 붙이고, 로그인이 끝난 뒤에 자기 앱의 권한 검사를 붙입니다.

사용자가 보호된 페이지에 들어오면 앱은 세션이 있는지 봅니다. 없으면 로그인 흐름을 시작하고, 인증 서버(또는 로컬 direct 모드)를 거친 뒤 `/auth/callback`으로 돌아옵니다. 콜백에서 토큰을 받은 다음, 처음에 가려던 경로로 되돌립니다. 그 경로를 실제로 열어 주기 전이나 연 직후에, 앱이 필요하면 권한 API를 호출해 막아 주면 됩니다.

---

## 연동 전에 준비할 것

앱마다 인증 쪽에 **클라이언트 식별자(`clientId`)** 와 **허용된 redirect URI** 가 등록되어 있어야 합니다. 예를 들어 이 백오피스는 배포 환경에서 `backoffice`를 쓰고, 로컬에서는 `local`을 씁니다. 멤버 앱이라면 별도 `clientId`를 받아서 쓰면 됩니다.

지금 공통 클라이언트는 콜백 경로를 **`/auth/callback`으로 고정**해 두었습니다. 따라서 설정에 넣는 `redirectUri`는 항상 `` `${현재앱 origin}/auth/callback` `` 이어야 하고, 브라우저에 실제로 `/auth/callback` 라우트도 만들어야 합니다. 다른 경로를 쓰고 싶다면 공통 모듈을 먼저 설정 가능하게 바꾼 뒤 연동해야 합니다.

브라우저에는 refresh token과 PKCE용 값들이 `umc.sso.*` 키로 저장됩니다. 지금은 키 이름도 고정이라, 같은 브라우저에서 여러 앱을 쓰는 경우 충돌이 걱정되면 이후 패키지에서 prefix를 설정할 수 있게 확장하는 편이 좋습니다.

---

## 1단계: 앱에 SSO 클라이언트 하나 만들기

공통 모듈의 진입점은 `createAuthClient`입니다. 앱에서는 보통 파일을 하나 두고, 앱이 뜨는 동안 **같은 인스턴스 하나**만 쓰도록 싱글톤으로 감쌉니다. 이 레포에서는 `src/shared/auth/sso-client.ts`의 `getSsoClient()`가 그 역할입니다.

```ts
import { createAuthClient } from "@/lib/auth-client"
// 패키지화 후: import { createAuthClient } from "@umc-product/auth-client"

import type { AuthClient } from "@/lib/auth-client"

let client: AuthClient | null = null

export function getSsoClient() {
  if (!client) {
    client = createAuthClient(
      {
        apiBaseUrl: "https://api.university.neordinary.com",
        authAppUrl: "https://auth.university.neordinary.com",
        clientId: "member",
        redirectUri: `${window.location.origin}/auth/callback`,
        loginMode: "auth-app",
      },
      { onUnauthenticated: "login" },
    )
  }
  return client
}
```

설정값의 의미는 다음과 같습니다.

`apiBaseUrl`은 SSO 관련 API를 호출할 기준 주소입니다. 로컬에서 Vite 프록시로 `/api`를 넘기는 경우에는 빈 문자열을 두고 상대 경로로 호출할 수도 있습니다. `authAppUrl`은 사용자가 실제로 로그인 화면을 보는 인증 앱 주소이고, `loginMode`가 `auth-app`일 때 authorize와 글로벌 로그아웃이 이 주소를 향합니다. `clientId`는 앞에서 말한 앱 식별자입니다. `redirectUri`는 현재 창의 origin에 `/auth/callback`을 붙인 값이어야 하며, 실제 브라우저 주소와 다르면 클라이언트가 로그인을 시작하지 않고 에러를 냅니다.

`loginMode`는 두 가지입니다. 배포나 일반적인 개발에서는 `auth-app`으로 두고 인증 앱으로 보냅니다. 로컬에서 인증 앱 없이 빠르게 돌릴 때만 `direct`를 쓰고, 이메일·비밀번호 개발 로그인 폼을 띄운 뒤 SSO authorize를 이어서 태웁니다. `direct`는 로컬 전용으로 가정하는 것이 안전합니다.

두 번째 인자 `onUnauthenticated`는 API가 401을 내고 refresh도 실패했을 때 어떻게 할지를 정합니다. `login`이면 다시 로그인 흐름으로 보내고, `ignore`이면 에러만 던집니다. 실제 서비스 화면은 보통 `login`이 맞고, 테스트나 특수 화면에서만 `ignore`를 씁니다.

어느 환경에서 어떤 URL과 `clientId`를 쓸지는 **앱마다 다릅니다.** 이 백오피스의 `resolveSsoEnv`는 origin → stage(`local` / `dev` / `prod`)로 나눈 뒤, stage별 API·Auth URL 표와 앱 `clientId`를 조합합니다. 배포 URL은 코드 표에 고정하고, `.env`는 localhost 오버라이드(`VITE_AUTH_APP_URL`, `VITE_SSO_LOGIN_MODE`)와 프록시 대상만 둡니다. 다른 앱은 **자기 origin allowlist와 `clientId`** 를 새로 만들어야 하고, 이 파일을 그대로 복사하면 안 됩니다.

---

## 2단계: 로그인 페이지에서 로그인 시작하기

보호된 페이지에 세션이 없을 때, 앱은 사용자를 `/login` 같은 화면으로 보냅니다. 그때 “원래 가려던 경로”를 쿼리로 같이 넘기면 나중에 돌아올 수 있습니다. 예를 들어 `/notices`에서 막혔다면 `/login?redirect=/notices`처럼 보냅니다.

로그인 페이지에서는 그 `redirect` 값을 `returnTo`로 읽고, 값이 없거나 이상하면 앱의 기본 홈(멤버 앱이면 `/`, 이 백오피스면 `/notices` 등)을 쓰면 됩니다. `returnTo`는 반드시 앱 안 상대 경로여야 합니다. `/`로 시작하고 `//`로 시작하지 않아야 하며, 외부 URL을 넣으면 안 됩니다. 클라이언트가 안전한 값만 저장합니다.

`loginMode`가 `auth-app`이면 로그인 페이지에 들어오자마자 `startLogin(returnTo)`만 호출하면 됩니다. 그러면 PKCE용 code verifier와 state를 만들고, 인증 앱의 authorize URL로 브라우저를 이동시킵니다. 사용자는 인증 앱에서 로그인한 뒤 다시 이 앱의 `/auth/callback`으로 돌아옵니다.

`direct` 모드(로컬)에서는 조금 다릅니다. 이미 SSO 쪽 세션 쿠키가 있으면 `hasSsoSession()`이 참이므로 곧바로 `startLogin`을 호출하면 됩니다. 세션이 없으면 개발용 이메일·비밀번호 폼을 보여 주고, 제출 시 `devLogin(email, password, returnTo)`를 호출합니다. 이 함수가 이메일 로그인을 한 뒤 이어서 authorize 흐름을 시작합니다. 폼 UI는 `src/lib/auth-client/react`의 `DevLoginForm`을 그대로 써도 됩니다.

이 레포의 전체 흐름은 `src/routes/login.tsx`에 있습니다.

```ts
const client = getSsoClient()
const returnTo = search.redirect ?? "/"

if (client.config.loginMode === "auth-app") {
  await client.startLogin(returnTo)
  return
}

if (await client.hasSsoSession()) {
  await client.startLogin(returnTo)
} else {
  // DevLoginForm → getSsoClient().devLogin(email, password, returnTo)
}
```

---

## 3단계: 콜백 페이지에서 토큰 받기

인증이 끝나면 브라우저는 `/auth/callback?code=...&state=...` 형태로 돌아옵니다. 이 라우트에서 `handleCallback(현재 URL)`을 한 번 호출하면, 저장해 둔 state와 code verifier를 검증하고 토큰 API를 호출한 뒤 access / refresh를 저장합니다. 성공하면 예전에 넣어 둔 `returnTo` 문자열을 돌려주므로, 라우터로 그 경로로 이동시키면 됩니다.

```ts
const returnTo = await getSsoClient().handleCallback(window.location.href)
router.replace(returnTo)
```

여기에는 두 가지를 조심해야 합니다.

첫째, React Strict Mode 등 때문에 effect가 두 번 실행되면 같은 authorization code로 토큰 교환을 두 번 시도할 수 있습니다. code는 보통 한 번만 쓸 수 있으므로, 같은 code에 대해서는 Promise를 하나만 돌리도록 캐시하는 편이 안전합니다. 이 레포의 `src/routes/auth/callback.tsx`에 있는 `callbackTasks` Map이 그 패턴입니다.

둘째, 특정 에러 코드(`AUTHENTICATION-0034`, `AUTHENTICATION-0035`)에서는 클라이언트가 알아서 로그인을 다시 시작할 수 있습니다. 이때는 “로그인 실패” 화면을 띄우지 말고, 리다이렉트가 일어나도록 두는 것이 맞습니다.

### 콜백 직후, 앱마다 달라지는 부분

`handleCallback`이 성공했다는 것은 **SSO 로그인에 성공했다**는 뜻이지, 백오피스 운영진이라는 뜻은 아닙니다. 그래서 권한 처리는 이 지점부터 앱이 결정합니다.

멤버 앱처럼 “로그인만 되면 되는” 제품이라면, 콜백에서 `returnTo`로 보내기만 하면 됩니다.

운영 백오피스처럼 운영진만 들여보내야 한다면, 콜백 직후에 `/v2/member/me` 같은 API로 세션을 읽고 운영진이 아니면 로그아웃하거나 권한 없음 화면을 보여 줄 수 있습니다.

```ts
const returnTo = await client.handleCallback()
const session = await fetchAdminSession()

if (!isOperator(session)) {
  await client.logout({ global: true })
  showOperatorOnlyNotice()
  return
}

router.replace(returnTo)
```

이 레포는 콜백에서는 일단 `returnTo`로만 보내고, 실제 막기는 `/_admin` 레이아웃(`src/routes/_admin/route.tsx`)에서 합니다. 토큰이 없으면 로그인으로 돌리고, 세션을 가져온 뒤 운영진이 아니면 “운영진만 접근할 수 있습니다” 화면을 보여 줍니다. **언제 막을지**(콜백 직후 vs 보호 레이아웃)는 제품 UX에 맞게 고르면 되고, 중요한 점은 그 규칙을 공통 SSO 모듈이 아니라 앱 코드에 둔다는 것입니다.

같은 사람이 멤버 앱과 백오피스에 모두 로그인할 수 있습니다. 차이는 `clientId`와, 로그인 이후 각 앱이 붙인 권한 검사입니다.

---

## 4단계: API 요청에 access token 붙이기

로그인이 되어도 비즈니스 API는 알아서 인증되지 않습니다. 요청마다 access token을 `Authorization: Bearer ...`로 넣어야 합니다.

공통 모듈에는 `createApiFetch()`가 있습니다. 이 래퍼는 Bearer를 붙이고, 401이 나면 refresh로 토큰을 갱신한 뒤 한 번 더 시도합니다. 새 앱이고 fetch만 쓴다면 이 방법이 가장 단순합니다.

```ts
const apiFetch = getSsoClient().createApiFetch()
const me = await apiFetch<MyType>("/api/v2/member/me")
```

이미 axios 인스턴스가 있다면, 이 레포처럼 인터셉터로 붙이면 됩니다. 요청 직전에 `getAccessToken()`을 넣고, 응답이 401이면 `recoverFromUnauthorized()`로 새 토큰을 받은 뒤 같은 요청을 다시 보냅니다. 다만 토큰 갱신·SSO·로그아웃 URL 자체에서 401이 난 경우에는 무한 루프를 막기 위해 재시도하지 않아야 합니다. 자세한 구현은 `src/shared/api/client.ts`를 참고하면 됩니다.

`recoverFromUnauthorized`가 실패했을 때 `onUnauthenticated`가 `login`이면 로그인 흐름으로 다시 보냅니다. 그래서 API 레이어와 로그인 정책이 연결되어 있습니다.

---

## 5단계: 보호할 페이지에서 세션 검사하기

라우터의 beforeLoad / loader / 레이아웃에서 “이 화면은 로그인 필요”를 걸면 됩니다. access token과 refresh token이 둘 다 없으면 `/login`으로 보내고, 가능하면 현재 경로를 `redirect` 쿼리에 넣습니다. 이렇게 해야 로그인 후 사용자가 원래 보려던 화면으로 돌아갑니다.

그 다음에 앱 권한 API를 호출할지는 화면마다 다릅니다. 공개에 가까운 페이지는 로그인만 보면 되고, 관리 화면은 세션을 읽은 뒤 역할이 없으면 전용 안내 화면을 보여 주면 됩니다. 규칙을 페이지마다 다르게 두고 싶다면 라우트 레이아웃을 나누면 됩니다. 공통 로그인 코드 안에 “관리자면 통과” 같은 분기를 넣지 마세요. URL이나 `clientId`만 보고 권한을 추정하는 것도 다른 앱을 깨뜨리기 쉽습니다.

---

## 6단계: 로그아웃

헤더의 로그아웃 버튼 등에서는 `logout`을 호출합니다. `logout({ global: true })`는 서버에 refresh token 폐기를 시도한 뒤 로컬 세션을 지우고, 인증 앱의 로그아웃 페이지로 보내 다른 앱 세션까지 정리하는 쪽에 가깝습니다. 로컬만 끊고 싶으면 `global` 없이 호출하거나, 상황에 따라 `clearSession()`만 쓸 수도 있습니다. 이 백오피스 헤더는 글로벌 로그아웃을 사용합니다.

React 앱 전역에서 로그인 상태를 구독하고 싶다면 `AuthClientProvider`와 `useAuth()`를 쓸 수 있습니다. Provider에 위에서 만든 클라이언트를 넘기면 `status`, `member`, `login`, `logout`을 훅으로 받습니다. 필수는 아닙니다. 이 백오피스는 Provider 없이 `getSsoClient()`를 직접 호출하는 방식입니다. 한 앱 안에서는 둘 중 한 가지로 통일하는 편이 낫습니다.

---

## 자주 쓰는 메서드가 하는 일

`startLogin(returnTo?)`은 PKCE를 준비하고 authorize 페이지로 이동합니다. `handleCallback(url?)`은 콜백 URL의 code로 토큰을 받아 저장하고, 돌아갈 경로를 돌려줍니다. `devLogin`은 `direct` 모드에서만 쓸 수 있는 개발용 이메일 로그인입니다. `hasSsoSession`은 인증 서버 쪽에 SSO 세션이 있는지 가볍게 확인합니다.

`getAccessToken`, `getRefreshToken`, `getMember`는 지금 메모리·스토리지에 있는 값을 읽습니다. `renewAccessToken`은 refresh로 access를 갱신하고, `recoverFromUnauthorized`는 API 401 복구용으로 갱신을 시도한 뒤 정책에 따라 재로그인을 걸 수 있습니다. `createApiFetch`는 그 복구 로직이 들어 있는 fetch 헬퍼입니다. `logout`은 서버 폐기와 로컬 정리를 하고, `clearSession`은 로컬만 비웁니다.

실패 시에는 `ApiError`가 던져집니다. `message`, HTTP `status`, 선택적 `code`를 가지고 있으니 콜백·로그인 UI에서 코드별로 분기할 수 있습니다.

---

## 연동이 끝났는지 확인하는 순서

인증 서버에 이 앱의 `clientId`와 `https://<앱호스트>/auth/callback`이 등록되어 있는지 확인합니다. 앱에서는 `createAuthClient`로 싱글톤을 만들고, `redirectUri`가 실제 브라우저 origin과 맞는지도 확인합니다. `/login`에서 `startLogin`(로컬이면 `devLogin`)이 호출되는지, `/auth/callback`에서 `handleCallback`이 한 번만 도는지 봅니다. API 클라이언트에 Bearer와 401 복구가 붙어 있는지, 보호 라우트에서 비로그인 사용자를 `/login?redirect=...`로 보내는지 확인합니다. 마지막으로 **그 앱만의 권한 규칙**이 콜백 이후 또는 보호 레이아웃에 있는지를 봅니다. 권한 규칙이 공통 모듈 안에 들어가 있으면 연동 방향이 잘못된 것입니다.

---

## 이 레포에서 참고할 코드

공통으로 가져갈 후보는 `src/lib/auth-client` 전체입니다. React Provider와 개발 로그인 폼은 그 안의 `react` 폴더에 있습니다.

앱이 직접 유지하는 쪽은 `src/shared/auth/sso-client.ts`(싱글톤), `src/shared/auth/resolve-sso-env.ts`(이 백오피스 origin 매핑), `src/routes/login.tsx`, `src/routes/auth/callback.tsx`, `src/shared/api/client.ts`(axios 연동)입니다. 운영진 인가와 `/me` 매핑은 `src/features/auth`와 `src/routes/_admin/route.tsx`에 있으며, 다른 앱이 그대로 가져가면 안 되는 백오피스 전용 코드입니다.

공통 모듈의 경로·스토리지 키·콜백 고정값처럼 **여러 앱에 영향을 주는 변경**은 `auth-client` 쪽에서 논의하고, 도메인 URL 표와 권한 정책은 각 앱 레포에서 관리하면 됩니다.
