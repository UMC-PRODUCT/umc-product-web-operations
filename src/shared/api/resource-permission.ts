import { api } from "./client"
import { unwrapApiResult } from "./unwrap-api-result"

export type ResourcePermissionType =
  | "READ"
  | "WRITE"
  | "EDIT"
  | "DELETE"
  | "FORCE_DELETE"
  | "APPROVE"
  | "CHECK"
  | "MANAGE"
  | "RELEASE"

export type ResourcePermission = {
  resourceType: string
  resourceId?: number
  permissions: {
    permissionType: string
    hasPermission: boolean
  }[]
}

type FetchResourcePermissionParams = {
  resourceType: string
  permissionType?: ResourcePermissionType
  resourceId?: number
}

export async function fetchResourcePermission(
  params: FetchResourcePermissionParams,
) {
  const { data } = await api.get<unknown>(
    "/v1/authorization/resource-permission",
    { params },
  )
  return unwrapApiResult<ResourcePermission>(data)
}

export function hasResourcePermission(
  permission: ResourcePermission,
  permissionType: ResourcePermissionType,
) {
  return (
    permission.permissions?.some(
      (item) => item.permissionType === permissionType && item.hasPermission,
    ) ?? false
  )
}
