import { describe, expect, it } from 'vitest'

import { UserActionsSideMenuTitle } from '../../components/UserActionsSideMenuTitle'
import { render, screen } from '../test-utils'

describe('UserActionsSideMenuTitle', () => {
  it('shows default ordering "created at newest" when no ordering param', () => {
    render(<UserActionsSideMenuTitle />)
    expect(screen.getByText(/created at newest/)).toBeInTheDocument()
  })

  it('shows "created at oldest" for -created_at ordering', () => {
    render(<UserActionsSideMenuTitle />, {
      initialEntries: ['/?ordering=-created_at']
    })
    expect(screen.getByText(/created at oldest/)).toBeInTheDocument()
  })

  it('falls back to raw ordering value for unknown ordering', () => {
    render(<UserActionsSideMenuTitle />, {
      initialEntries: ['/?ordering=custom_field']
    })
    expect(screen.getByText(/custom_field/)).toBeInTheDocument()
  })

  it('renders count when provided', () => {
    render(<UserActionsSideMenuTitle count={42} />)
    expect(screen.getByText('42 actions')).toBeInTheDocument()
  })

  it('does not render count when undefined', () => {
    render(<UserActionsSideMenuTitle />)
    expect(screen.queryByText(/actions/)).not.toBeInTheDocument()
  })
})
