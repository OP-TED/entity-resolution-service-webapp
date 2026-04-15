import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmationPreferenceProvider } from '../../src/context/ConfirmationPreferenceContext'
import { useConfirmationPreference } from '../../src/context/useConfirmationPreference'
import { renderHook } from '../test-utils'

beforeEach(() => {
  sessionStorage.clear()
  vi.clearAllMocks()
})

function renderPreferenceHook() {
  return renderHook(() => useConfirmationPreference(), {
    wrapper: ({ children }) => (
      <ConfirmationPreferenceProvider>{children}</ConfirmationPreferenceProvider>
    )
  })
}

describe('useConfirmationPreference', () => {
  it('throws when used outside ConfirmationPreferenceProvider', () => {
    // Suppress the React error boundary noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      renderHook(() => useConfirmationPreference(), {
        wrapper: ({ children }) => <>{children}</>
      })
    ).toThrow('useConfirmationPreference must be used within a ConfirmationPreferenceProvider')

    spy.mockRestore()
  })
})

describe('ConfirmationPreferenceProvider', () => {
  describe('initial state', () => {
    it('starts with skipAll = false', () => {
      const { result } = renderPreferenceHook()
      expect(result.current.skipAll).toBe(false)
    })

    it('starts with all action skips = false', () => {
      const { result } = renderPreferenceHook()
      expect(result.current.actionSkips).toEqual({
        accept: false,
        reject: false,
        assign: false
      })
    })

    it('shouldSkip returns false for all actions by default', () => {
      const { result } = renderPreferenceHook()
      expect(result.current.shouldSkip('accept')).toBe(false)
      expect(result.current.shouldSkip('reject')).toBe(false)
      expect(result.current.shouldSkip('assign')).toBe(false)
    })
  })

  describe('setActionSkip', () => {
    it('sets an individual action skip to true', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setActionSkip('accept', true))

      expect(result.current.actionSkips.accept).toBe(true)
      expect(result.current.shouldSkip('accept')).toBe(true)
    })

    it('does not affect other actions', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setActionSkip('reject', true))

      expect(result.current.shouldSkip('reject')).toBe(true)
      expect(result.current.shouldSkip('accept')).toBe(false)
      expect(result.current.shouldSkip('assign')).toBe(false)
    })

    it('can toggle an action skip back to false', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setActionSkip('assign', true))
      expect(result.current.shouldSkip('assign')).toBe(true)

      act(() => result.current.setActionSkip('assign', false))
      expect(result.current.shouldSkip('assign')).toBe(false)
    })
  })

  describe('setSkipAll', () => {
    it('makes shouldSkip return true for every action', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setSkipAll(true))

      expect(result.current.skipAll).toBe(true)
      expect(result.current.shouldSkip('accept')).toBe(true)
      expect(result.current.shouldSkip('reject')).toBe(true)
      expect(result.current.shouldSkip('assign')).toBe(true)
    })

    it('can be toggled back to false', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setSkipAll(true))
      act(() => result.current.setSkipAll(false))

      expect(result.current.skipAll).toBe(false)
      expect(result.current.shouldSkip('accept')).toBe(false)
    })

    it('overrides individual action skips', () => {
      const { result } = renderPreferenceHook()

      // Set individual accept to false, then skipAll to true
      act(() => result.current.setActionSkip('accept', false))
      act(() => result.current.setSkipAll(true))

      expect(result.current.shouldSkip('accept')).toBe(true)
    })
  })

  describe('sessionStorage persistence', () => {
    it('persists individual action skip to sessionStorage', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setActionSkip('accept', true))

      expect(sessionStorage.getItem('ere_skip_accept')).toBe('true')
    })

    it('removes sessionStorage key when action skip is set to false', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setActionSkip('reject', true))
      expect(sessionStorage.getItem('ere_skip_reject')).toBe('true')

      act(() => result.current.setActionSkip('reject', false))
      expect(sessionStorage.getItem('ere_skip_reject')).toBeNull()
    })

    it('persists skipAll to sessionStorage', () => {
      const { result } = renderPreferenceHook()

      act(() => result.current.setSkipAll(true))

      expect(sessionStorage.getItem('ere_skip_all')).toBe('true')
    })

    it('reads initial state from sessionStorage', () => {
      sessionStorage.setItem('ere_skip_accept', 'true')
      sessionStorage.setItem('ere_skip_all', 'true')

      const { result } = renderPreferenceHook()

      expect(result.current.skipAll).toBe(true)
      expect(result.current.actionSkips.accept).toBe(true)
      expect(result.current.actionSkips.reject).toBe(false)
    })
  })
})
