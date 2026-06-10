import type { UserContext } from '@api/types.gen'

export type AccountAccessReason = 'inactive' | 'unverified'

/**
 * Thrown during login/bootstrap when the authenticated account exists but may
 * not enter the app because it is inactive or unverified (TEDSWS-527). The
 * LoginPage catches this and shows an explanatory alert.
 */
export class AccountAccessError extends Error {
  reason: AccountAccessReason

  constructor(reason: AccountAccessReason) {
    super(`account-${reason}`)
    this.name = 'AccountAccessError'
    this.reason = reason
  }
}

// An account may use the app only when it is both active and verified. Inactive
// takes precedence as the more blocking condition.
export const getAccountAccessReason = (
  user: Pick<UserContext, 'is_active' | 'is_verified'>
): AccountAccessReason | null => {
  if (!user.is_active) return 'inactive'
  if (!user.is_verified) return 'unverified'
  return null
}

export const accountAccessMessage = (reason: AccountAccessReason): string =>
  `The user account is ${reason}. Please contact your administrator.`

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

/**
 * Inactive/unverified accounts are rejected by the login endpoint itself
 * (e.g. HTTP 403 "User account is deactivated"), so we never get to inspect the
 * user object. Map that error to an access reason from its status/message.
 */
export const accountAccessReasonFromLoginError = (
  error: unknown
): AccountAccessReason | null => {
  if (!isObject(error)) return null

  const response = isObject(error.response) ? error.response : undefined

  let status: number | undefined
  if (typeof response?.status === 'number') status = response.status
  else if (typeof error.status === 'number') status = error.status

  let data: Record<string, unknown> | undefined
  if (isObject(response?.data)) data = response.data
  else if (isObject(error.body)) data = error.body

  const message =
    typeof data?.message === 'string' ? data.message.toLowerCase() : ''

  if (/verif/.test(message)) return 'unverified'
  if (status === 403 || /deactiv|inactive/.test(message)) return 'inactive'
  return null
}
