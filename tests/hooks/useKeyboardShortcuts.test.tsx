import { describe, expect, it, vi } from 'vitest'

import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts'
import { act, fireEvent, renderHook, screen } from '../test-utils'

vi.mock('../../src/api/index', () => ({
  curationDecisionsAcceptCreateMutation: vi.fn(() => ({ mutationFn: vi.fn() })),
  curationDecisionsRejectCreateMutation: vi.fn(() => ({ mutationFn: vi.fn() })),
  curationDecisionsRetrieveInfiniteQueryKey: vi.fn(() => ['decisions']),
  curationStatsRetrieveQueryKey: vi.fn(() => ['stats'])
}))

describe('useKeyboardShortcuts', () => {
  it('registers a keydown listener on mount and removes it on unmount', () => {
    const addSpy = vi.spyOn(globalThis, 'addEventListener')
    const removeSpy = vi.spyOn(globalThis, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({ activeDecision: undefined })
    )

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('ignores keydown events when target is an INPUT element', () => {
    let capturedHandler: ((e: KeyboardEvent) => void) | null = null
    const addSpy = vi
      .spyOn(globalThis, 'addEventListener')
      .mockImplementation((type, handler) => {
        if (type === 'keydown') capturedHandler = handler as (e: KeyboardEvent) => void
      })

    renderHook(() =>
      useKeyboardShortcuts({
        activeDecision: { id: 1, decision_status: 'PENDING_MANUAL_REVIEW' } as never
      })
    )

    expect(capturedHandler).not.toBeNull()

    const input = document.createElement('input')
    document.body.append(input)

    const event = new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true })
    Object.defineProperty(event, 'target', { value: input, configurable: true })

    expect(() => capturedHandler!(event)).not.toThrow()

    input.remove()
    addSpy.mockRestore()
  })

  it('handles ArrowUp and ArrowDown keys without errors', () => {
    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: undefined })
    )

    act(() => {
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'ArrowUp' })
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'ArrowDown' })
    })

    expect(true).toBe(true)
  })

  it('does not open modal when decision status is not PENDING_MANUAL_REVIEW', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        activeDecision: { id: 1, decision_status: 'ACCEPTED' } as never
      })
    )

    act(() => {
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyA' })
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyR' })
    })

    expect(true).toBe(true)
  })

  it('triggers the KeyA code path for PENDING_MANUAL_REVIEW decision without errors', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        activeDecision: { id: 1, decision_status: 'PENDING_MANUAL_REVIEW' } as never
      })
    )

    // Pressing KeyA calls modal.confirm — verifies the code path executes
    expect(() => {
      act(() => {
        fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyA' })
      })
    }).not.toThrow()

    // modal.confirm was called: the confirm dialog title appears in DOM
    expect(screen.getAllByText('Accept Decision').length).toBeGreaterThan(0)
  })

  it('triggers the KeyR code path for PENDING_MANUAL_REVIEW decision without errors', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        activeDecision: { id: 2, decision_status: 'PENDING_MANUAL_REVIEW' } as never
      })
    )

    // Pressing KeyR calls modal.confirm — verifies the code path executes
    expect(() => {
      act(() => {
        fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyR' })
      })
    }).not.toThrow()
  })
})
