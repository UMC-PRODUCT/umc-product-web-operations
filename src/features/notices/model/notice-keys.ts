export const noticeKeys = {
  all: ["notices"] as const,
  lists: () => [...noticeKeys.all, "list"] as const,
  list: (parts: readonly unknown[]) =>
    [...noticeKeys.lists(), ...parts] as const,
  details: () => [...noticeKeys.all, "detail"] as const,
  detail: (noticeId: number | string) =>
    [...noticeKeys.details(), noticeId] as const,
}
