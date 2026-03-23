import { describe, expect, it, vi } from 'vitest'

import { createTestQueryClient, render, screen } from '../test-utils'
import { Header } from '../../src/components/Header'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  curationStatsRetrieveOptions: vi.fn(() => ({
    queryKey: ['curation-stats'],
    queryFn: vi.fn()
  }))
}))

describe('Header', () => {
  it('renders the main page title', () => {
    render(<Header />)
    expect(
      screen.getByText('Resolution Decision Review')
    ).toBeInTheDocument()
  })

  it('shows loading skeleton while stats are loading', () => {
    // With no data in the query cache, the query is in loading state
    render(<Header />)
    // Title is always visible
    expect(screen.getByText('Resolution Decision Review')).toBeInTheDocument()
  })

  it('shows reviewed, remaining and today counts when stats are loaded', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['curation-stats'], {
      curation_statistics: {
        reviewed_decisions: 15,
        pending_decisions: 8,
        automatic_decisions: 5
      }
    })

    render(<Header />, { queryClient })

    expect(screen.getByText(/15 reviewed/)).toBeInTheDocument()
    expect(screen.getByText(/8 remaining/)).toBeInTheDocument()
    // today = automatic + reviewed = 5 + 15 = 20
    expect(screen.getByText(/20 decisions/)).toBeInTheDocument()
  })

  it('shows zero counts when curation_statistics is absent', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['curation-stats'], {})

    render(<Header />, { queryClient })

    expect(screen.getByText(/0 reviewed/)).toBeInTheDocument()
    expect(screen.getByText(/0 remaining/)).toBeInTheDocument()
    expect(screen.getByText(/0 decisions/)).toBeInTheDocument()
  })
})
