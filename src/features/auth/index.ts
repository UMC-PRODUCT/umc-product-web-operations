export { loginByEmail } from "./api/login"
export {
  adminSessionQueryKey,
  adminSessionQueryOptions,
  clearAdminSession,
  fetchAdminSession,
} from "./api/session"
export { isOperator, toAdminSession, widestScope } from "./model/admin-session"

export type { AdminScope, AdminSession, RoleType } from "./model/admin-session"
