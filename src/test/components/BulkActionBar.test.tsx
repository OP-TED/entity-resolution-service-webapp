import { BulkActionBar } from '@components/BulkActionBar'
import { useBulkSelection } from '@context/useBulkSelection'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { fireEvent, render, screen } from '../test-utils'

const mockHookState = {
  isPending: false,
  pendingAction: null as null | 'accept' | 'reject',
  bulkAccept: vi.fn(),
  bulkReject: vi.fn(),
  cancelConfirm: vi.fn(),
  confirm: vi.fn()
}

vi.mock('@hooks', () => ({
  useBulkDecisionActions: () => mockHookState
}))

// Modal portal contents are not the focus here — flatten BulkConfirmModal so
// tests can assert on just the bar itself.
vi.mock('@components', async () => {
  const actual =
    await vi.importActual<typeof import('@components')>('@components')

  return {
    ...actual,
    BulkConfirmModal: () => null
  }
})

const PrepareSelection = ({ ids }: { ids: string[] }) => {
  const { enterSelectionMode, selectMany } = useBulkSelection()
  useEffect(() => {
    if (ids.length === 0) return
    enterSelectionMode()
    selectMany(ids)
  }, [ids, enterSelectionMode, selectMany])

  return null
}

const PrepareSelectionMode = () => {
  const { enterSelectionMode } = useBulkSelection()
  useEffect(() => {
    enterSelectionMode()
  }, [enterSelectionMode])

  return null
}

const setupHook = (overrides: Partial<typeof mockHookState> = {}) => {
  Object.assign(mockHookState, {
    isPending: false,
    pendingAction: null,
    bulkAccept: vi.fn(),
    bulkReject: vi.fn(),
    cancelConfirm: vi.fn(),
    confirm: vi.fn(),
    ...overrides
  })
}

describe('BulkActionBar', () => {
  it('renders nothing when not in selection mode', () => {
    setupHook()
    render(<BulkActionBar />)
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })

  it('renders nothing when in selection mode but with zero selected items', () => {
    setupHook()
    render(
      <>
        <PrepareSelectionMode />
        <BulkActionBar />
      </>
    )
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })

  it('renders the toolbar with selected count and Accept/Reject buttons', () => {
    setupHook()
    render(
      <>
        <PrepareSelection ids={['a', 'b', 'c']} />
        <BulkActionBar />
      </>
    )

    expect(screen.getByRole('toolbar', { name: /Bulk actions/i })).toBeInTheDocument()
    expect(screen.getByText('3 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Accept/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Reject/i })).toBeEnabled()
  })

  it('calls bulkAccept when the Accept button is clicked', () => {
    setupHook()
    render(
      <>
        <PrepareSelection ids={['a']} />
        <BulkActionBar />
      </>
    )
    fireEvent.click(screen.getByRole('button', { name: /Accept/i }))
    expect(mockHookState.bulkAccept).toHaveBeenCalledTimes(1)
  })

  it('calls bulkReject when the Reject button is clicked', () => {
    setupHook()
    render(
      <>
        <PrepareSelection ids={['a']} />
        <BulkActionBar />
      </>
    )
    fireEvent.click(screen.getByRole('button', { name: /Reject/i }))
    expect(mockHookState.bulkReject).toHaveBeenCalledTimes(1)
  })

  it('disables Reject and shows Accept as loading while accept is pending', () => {
    setupHook({ isPending: true, pendingAction: 'accept' })
    render(
      <>
        <PrepareSelection ids={['a']} />
        <BulkActionBar />
      </>
    )
    const reject = screen.getByRole('button', { name: /Reject/i })
    expect(reject).toBeDisabled()

    // The accept button enters loading state — antd renders an inline spinner.
    const accept = screen.getByRole('button', { name: /Accept/i })
    expect(accept.classList.toString()).toMatch(/loading/)
  })

  it('disables Accept and shows Reject as loading while reject is pending', () => {
    setupHook({ isPending: true, pendingAction: 'reject' })
    render(
      <>
        <PrepareSelection ids={['a']} />
        <BulkActionBar />
      </>
    )
    const accept = screen.getByRole('button', { name: /Accept/i })
    expect(accept).toBeDisabled()

    const reject = screen.getByRole('button', { name: /Reject/i })
    expect(reject.classList.toString()).toMatch(/loading/)
  })
})
