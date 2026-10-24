import { useQuery } from "@tanstack/react-query"

import {
  fetchResourcePermission,
  hasResourcePermission,
} from "@/shared/api/resource-permission"

export function usePointDeletePermission() {
  return useQuery({
    queryKey: ["authorization", "CHALLENGER_POINT", "DELETE"],
    queryFn: async () => {
      const permission = await fetchResourcePermission({
        resourceType: "CHALLENGER_POINT",
        permissionType: "DELETE",
      })
      return hasResourcePermission(permission, "DELETE")
    },
    retry: false,
  })
}
