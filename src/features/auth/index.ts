export {
  adminSessionQueryKey,
  adminSessionQueryOptions,
  clearAdminSession,
  fetchAdminSession,
} from "./api/session"
export { AdminGateError } from "./model/admin-access"
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
export {
  clearOperatorOnlyLoginNotice,
  hasOperatorOnlyLoginNotice,
  markOperatorOnlyLoginNotice,
} from "./model/operator-only-login-notice"
export { ForbiddenNotice, OperatorOnlyNotice } from "./ui/access-notice"
