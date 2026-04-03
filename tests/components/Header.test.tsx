import { describe, expect, it, vi } from 'vitest'

import { createTestQueryClient, fireEvent, render, screen } from '../test-utils'
import { Header } from '../../src/components/Header'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  getStatisticsApiV1CurationStatsGetOptions: vi.fn(() => ({
    queryKey: ['curation-stats'],
    queryFn: vi.fn()
  }))
}))

vi.mock('../../src/context/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: null, logout: vi.fn() }))
}))

const { useAuth } = await import('../../src/context/useAuth')

describe('Header', () => {
  it('renders the main page title', () => {
    render(<Header />)
    expect(screen.getByText('Resolution Decision Review')).toBeInTheDocument()
  })

  it('shows loading skeleton while stats are loading', () => {
    render(<Header />)
    expect(screen.getByText('Resolution Decision Review')).toBeInTheDocument()
  })

  it('shows selected top, alternative, rejected, and total when stats are loaded', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['curation-stats'], {
      curation: {
        selected_top: 15,
        selected_alternative: 3,
        rejected_all: 2,
        total_decisions: 20
      }
    })

    render(<Header />, { queryClient })

    expect(screen.getByText(/15 Selected Top/)).toBeInTheDocument()
    expect(screen.getByText(/3.*Selected Alternative/)).toBeInTheDocument()
    expect(screen.getByText(/2 Rejected/)).toBeInTheDocument()
    expect(screen.getByText(/20 decisions/)).toBeInTheDocument()
  })

  it('shows zero counts when curation stats are absent', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['curation-stats'], {})

    render(<Header />, { queryClient })

    expect(screen.getByText(/0 Selected Top/)).toBeInTheDocument()
    expect(screen.getByText(/0 decisions/)).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('renders the current user email when a user exists', () => {
    const logout = vi.fn()
    vi.mocked(useAuth).mockReturnValueOnce({
      user: { email: 'user@example.com' },
      logout
    } as never)

    render(<Header />)

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('calls logout when sign out is clicked', () => {
    const logout = vi.fn()
    vi.mocked(useAuth).mockReturnValueOnce({ user: null, logout } as never)

    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledOnce()
  })
})
