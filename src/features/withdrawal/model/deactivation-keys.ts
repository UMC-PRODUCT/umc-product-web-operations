export const deactivationKeys = {
  all: ["deactivations"] as const,
  lists: () => [...deactivationKeys.all, "list"] as const,
  list: (params: unknown) => [...deactivationKeys.lists(), params] as const,
  details: () => [...deactivationKeys.all, "detail"] as const,
  detail: (deactivationId: number) =>
    [...deactivationKeys.details(), deactivationId] as const,
}
