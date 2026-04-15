import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HistoryPage } from '../../src/pages/HistoryPage'
import { fireEvent, render, screen } from '../test-utils'

const detailPanelPropsSpy = vi.fn()

const selectedAction = {
  id: 'action-1',
  action_type: 'accept',
  actor: { id: 'user-1', email: 'reviewer@example.com' },
  decision_id: 'decision-1',
  created_at: new Date().toISOString()
}

vi.mock('@components', () => ({
  Header: () => <div>Header Mock</div>,
  UserActionsFilterBar: () => <div>History Filters Mock</div>,
  UserActionsSideMenu: ({
    activeAction,
    onSelect
  }: {
    activeAction?: { id?: string }
    onSelect: (action: unknown) => void
  }) => (
    <div>
      <div>Active action in menu: {activeAction?.id ?? 'none'}</div>
      <button onClick={() => onSelect(selectedAction)}>Select First Action</button>
    </div>
  ),
  UserActionDetailPanel: ({ currentAction }: { currentAction?: { id?: string } }) => {
    detailPanelPropsSpy(currentAction)
    return <div>Detail panel action: {currentAction?.id ?? 'none'}</div>
  }
}))

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header, filters, side menu and detail panel', () => {
    render(<HistoryPage />)

    expect(screen.getByText('Header Mock')).toBeInTheDocument()
    expect(screen.getByText('History Filters Mock')).toBeInTheDocument()
    expect(screen.getByText('Active action in menu: none')).toBeInTheDocument()
    expect(screen.getByText('Detail panel action: none')).toBeInTheDocument()
  })

  it('passes undefined currentAction to detail panel on first render', () => {
    render(<HistoryPage />)

    expect(detailPanelPropsSpy).toHaveBeenCalled()
    expect(detailPanelPropsSpy).toHaveBeenLastCalledWith(undefined)
  })

  it('updates active action when side menu selects an action', () => {
    render(<HistoryPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Select First Action' }))

    expect(screen.getByText('Active action in menu: action-1')).toBeInTheDocument()
    expect(screen.getByText('Detail panel action: action-1')).toBeInTheDocument()
    expect(detailPanelPropsSpy).toHaveBeenLastCalledWith(selectedAction)
  })
})
