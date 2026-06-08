import {
  accountAccessMessage,
  accountAccessReasonFromLoginError,
  getAccountAccessReason
} from '@context/authErrors'
import { describe, expect, it } from 'vitest'

describe('getAccountAccessReason', () => {
  it('flags inactive (taking precedence over unverified)', () => {
    expect(
      getAccountAccessReason({ is_active: false, is_verified: false })
    ).toBe('inactive')
  })

  it('flags unverified when active but not verified', () => {
    expect(
      getAccountAccessReason({ is_active: true, is_verified: false })
    ).toBe('unverified')
  })

  it('returns null for an active, verified account', () => {
    expect(
      getAccountAccessReason({ is_active: true, is_verified: true })
    ).toBeNull()
  })
})

describe('accountAccessReasonFromLoginError', () => {
  it('maps a 403 response to inactive (axios-style error)', () => {
    expect(
      accountAccessReasonFromLoginError({
        response: { status: 403, data: { message: 'User account is deactivated' } }
      })
    ).toBe('inactive')
  })

  it('maps a "deactivated" message to inactive even without a 403 status', () => {
    expect(
      accountAccessReasonFromLoginError({
        body: { message: 'This account is inactive' }
      })
    ).toBe('inactive')
  })

  it('maps a verification message to unverified', () => {
    expect(
      accountAccessReasonFromLoginError({
        response: { status: 400, data: { message: 'LOGIN_USER_NOT_VERIFIED' } }
      })
    ).toBe('unverified')
  })

  it('returns null for ordinary credential errors', () => {
    expect(
      accountAccessReasonFromLoginError({
        response: { status: 401, data: { message: 'Invalid credentials' } }
      })
    ).toBeNull()
    expect(accountAccessReasonFromLoginError(new Error('Network Error'))).toBeNull()
    expect(accountAccessReasonFromLoginError(undefined)).toBeNull()
  })
})

describe('accountAccessMessage', () => {
  it('builds the admin-contact message per reason', () => {
    expect(accountAccessMessage('inactive')).toBe(
      'The user account is inactive. Please contact your administrator.'
    )
    expect(accountAccessMessage('unverified')).toBe(
      'The user account is unverified. Please contact your administrator.'
    )
  })
})
