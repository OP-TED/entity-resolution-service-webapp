import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useAuth } from '../../src/context/useAuth'

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress React's error boundary console output for this expected throw
    const consoleError = console.error
    console.error = () => {}

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider'
    )

    console.error = consoleError
  })
})
