export const gisuKeys = {
  all: ["gisu"] as const,
  list: () => [...gisuKeys.all, "list"] as const,
}
