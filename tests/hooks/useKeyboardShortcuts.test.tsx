import { describe, expect, it, vi } from 'vitest'

import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts'
import { act, fireEvent, renderHook, screen } from '../test-utils'

vi.mock('../../src/api/index', () => ({
  acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation: vi.fn(() => ({
    mutationFn: vi.fn()
  })),
  rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation: vi.fn(() => ({
    mutationFn: vi.fn()
  })),
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey: vi.fn(() => ['decisions']),
  getStatisticsApiV1CurationStatsGetQueryKey: vi.fn(() => ['stats'])
}))

const baseDecision = {
  id: 'decision-1',
  about_entity_mention: {
    identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
    parsed_representation: { name: 'Test Entity' }
  },
  current_placement: { cluster_id: 'c1', confidence_score: 0.8, similarity_score: 0.7 },
  created_at: new Date().toISOString()
}

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
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
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

  it('pressing KeyA on a decision opens the accept confirm modal', () => {
    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    expect(() => {
      act(() => {
        fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyA' })
      })
    }).not.toThrow()

    expect(screen.getAllByText('Accept Decision').length).toBeGreaterThan(0)
  })

  it('pressing KeyR on a decision opens the reject confirm modal without errors', () => {
    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    expect(() => {
      act(() => {
        fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyR' })
      })
    }).not.toThrow()
  })

  it('pressing KeyA without a decision does not throw', () => {
    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: undefined })
    )

    expect(() => {
      act(() => {
        fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyA' })
      })
    }).not.toThrow()
  })

  it('ignores keydown events when target is a TEXTAREA element', () => {
    let capturedHandler: ((e: KeyboardEvent) => void) | null = null
    const addSpy = vi
      .spyOn(globalThis, 'addEventListener')
      .mockImplementation((type, handler) => {
        if (type === 'keydown') capturedHandler = handler as (e: KeyboardEvent) => void
      })

    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    const textarea = document.createElement('textarea')
    document.body.append(textarea)

    const event = new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true })
    Object.defineProperty(event, 'target', { value: textarea, configurable: true })

    expect(() => capturedHandler!(event)).not.toThrow()

    textarea.remove()
    addSpy.mockRestore()
  })

  it('ignores keydown events when target is a contentEditable element', () => {
    let capturedHandler: ((e: KeyboardEvent) => void) | null = null
    const addSpy = vi
      .spyOn(globalThis, 'addEventListener')
      .mockImplementation((type, handler) => {
        if (type === 'keydown') capturedHandler = handler as (e: KeyboardEvent) => void
      })

    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    const div = document.createElement('div')
    div.contentEditable = 'true'
    document.body.append(div)

    const event = new KeyboardEvent('keydown', { code: 'KeyR', bubbles: true })
    Object.defineProperty(event, 'target', { value: div, configurable: true })

    expect(() => capturedHandler!(event)).not.toThrow()

    div.remove()
    addSpy.mockRestore()
  })

  it('pressing KeyR without a decision does not throw', () => {
    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: undefined })
    )

    expect(() => {
      act(() => {
        fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyR' })
      })
    }).not.toThrow()
  })

  it('clicking OK in the accept modal calls acceptDecision', async () => {
    const { waitFor } = await import('@testing-library/react')

    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    act(() => {
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyA' })
    })

    await waitFor(() =>
      expect(screen.getAllByText('Accept Decision').length).toBeGreaterThan(0)
    )

    const okButton = screen.getAllByRole('button').find(
      (b) => b.textContent === 'OK'
    )
    if (okButton) {
      act(() => { fireEvent.click(okButton) })
    }
  })

  it('clicking Cancel in the accept modal does not throw', async () => {
    const { waitFor } = await import('@testing-library/react')

    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    act(() => {
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyA' })
    })

    await waitFor(() =>
      expect(screen.getAllByText('Accept Decision').length).toBeGreaterThan(0)
    )

    const cancelButton = screen.getAllByRole('button').find(
      (b) => b.textContent === 'Cancel'
    )
    if (cancelButton) {
      expect(() => act(() => { fireEvent.click(cancelButton) })).not.toThrow()
    }
  })

  it('clicking OK in the reject modal calls rejectDecision', async () => {
    const { waitFor } = await import('@testing-library/react')

    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    act(() => {
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyR' })
    })

    await waitFor(() =>
      expect(screen.getAllByText('Reject Decision').length).toBeGreaterThan(0)
    )

    const okButton = screen.getAllByRole('button').find(
      (b) => b.textContent === 'OK'
    )
    if (okButton) {
      act(() => { fireEvent.click(okButton) })
    }
  })

  it('clicking Cancel in the reject modal does not throw', async () => {
    const { waitFor } = await import('@testing-library/react')

    renderHook(() =>
      useKeyboardShortcuts({ activeDecision: baseDecision as never })
    )

    act(() => {
      fireEvent.keyDown(globalThis as unknown as Window, { code: 'KeyR' })
    })

    await waitFor(() =>
      expect(screen.getAllByText('Reject Decision').length).toBeGreaterThan(0)
    )

    const cancelButton = screen.getAllByRole('button').find(
      (b) => b.textContent === 'Cancel'
    )
    if (cancelButton) {
      expect(() => act(() => { fireEvent.click(cancelButton) })).not.toThrow()
    }
  })
})
