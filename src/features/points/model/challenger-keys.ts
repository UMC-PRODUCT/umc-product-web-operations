export const challengerKeys = {
  all: ["challengers"] as const,
  searches: () => [...challengerKeys.all, "search"] as const,
  search: (params: Record<string, unknown>) =>
    [...challengerKeys.searches(), params] as const,
  detail: (challengerId: number) => ["challenger", challengerId] as const,
  missing: () => ["challenger", "missing"] as const,
}
