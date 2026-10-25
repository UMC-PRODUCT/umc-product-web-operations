export { loginByEmail } from "./api/login"
export {
  adminSessionQueryKey,
  adminSessionQueryOptions,
  clearAdminSession,
  fetchAdminSession,
} from "./api/session"
export {
  isOperator,
  schoolExecutiveLock,
  toAdminSession,
  widestScope,
} from "./model/admin-session"

export type {
  AdminScope,
  AdminSession,
  RoleType,
  SchoolExecutiveLock,
} from "./model/admin-session"
