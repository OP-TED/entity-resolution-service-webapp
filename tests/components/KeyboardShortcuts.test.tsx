import { describe, expect, it, vi } from 'vitest'

import { KeyboardShortcuts } from '../../src/components/KeyboardShortcuts'
import { render, screen } from '../test-utils'

// Mock the hook so the component renders without API/mutation setup
vi.mock('../../src/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn()
}))

describe('KeyboardShortcuts', () => {
  it('renders keyboard shortcuts instructions', () => {
    render(<KeyboardShortcuts />)
    expect(screen.getByText(/Keyboard shortcuts:/)).toBeInTheDocument()
  })

  it('mentions Accept shortcut', () => {
    render(<KeyboardShortcuts />)
    expect(screen.getByText(/A = Accept/)).toBeInTheDocument()
  })

  it('mentions Reject shortcut', () => {
    render(<KeyboardShortcuts />)
    expect(screen.getByText(/R = Reject/)).toBeInTheDocument()
  })

  it('mentions Navigate queue shortcut', () => {
    render(<KeyboardShortcuts />)
    expect(screen.getByText(/Navigate queue/)).toBeInTheDocument()
  })

  it('renders without crashing when activeDecision is provided', () => {
    render(
      <KeyboardShortcuts
        activeDecision={{ id: 1, decision_status: 'PENDING_MANUAL_REVIEW' } as never}
      />
    )
    expect(screen.getByText(/Keyboard shortcuts:/)).toBeInTheDocument()
  })
})
