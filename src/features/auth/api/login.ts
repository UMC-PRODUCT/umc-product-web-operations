import { setAccessToken, setRefreshToken } from "@/shared/api/access-token"
import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

type LocalLoginResponse = {
  memberId: number
  accessToken: string
  refreshToken: string
}

export async function loginByEmail(input: { email: string; password: string }) {
  const { data } = await api.post<unknown>("/v1/auth/login/email", {
    email: input.email,
    password: input.password,
    clientType: "WEB",
  })
  const result = unwrapApiResult<LocalLoginResponse>(data)
  setAccessToken(result.accessToken)
  setRefreshToken(result.refreshToken)
  return result
}
