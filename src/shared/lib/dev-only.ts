/**
 * QA·시뮬레이션용 값은 개발 모드에서만 유지한다.
 * 프로덕션에서는 URL로 가짜 성공/에러 상태를 주입하지 못하게 한다.
 */
export function onlyInDev<T>(value: T | undefined): T | undefined {
  return import.meta.env.DEV ? value : undefined
}
