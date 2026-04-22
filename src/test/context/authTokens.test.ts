import { afterEach, describe, expect, it } from 'vitest'

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  storeTokens
} from '../../context/authTokens'

afterEach(() => localStorage.clear())

describe('authTokens', () => {
  it('getAccessToken returns null when no token is stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('getRefreshToken returns null when no token is stored', () => {
    expect(getRefreshToken()).toBeNull()
  })

  it('storeTokens persists access and refresh tokens', () => {
    storeTokens('acc123', 'ref456')
    expect(getAccessToken()).toBe('acc123')
    expect(getRefreshToken()).toBe('ref456')
  })

  it('getAccessToken returns the correct stored access token', () => {
    storeTokens('my-access', 'my-refresh')
    expect(getAccessToken()).toBe('my-access')
  })

  it('getRefreshToken returns the correct stored refresh token', () => {
    storeTokens('my-access', 'my-refresh')
    expect(getRefreshToken()).toBe('my-refresh')
  })

  it('clearTokens removes both tokens so both getters return null', () => {
    storeTokens('acc', 'ref')
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('storeTokens overwrites previously stored tokens', () => {
    storeTokens('old-acc', 'old-ref')
    storeTokens('new-acc', 'new-ref')
    expect(getAccessToken()).toBe('new-acc')
    expect(getRefreshToken()).toBe('new-ref')
  })
})
