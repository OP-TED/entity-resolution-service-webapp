import { describe, expect, it } from 'vitest'

import { DecisionsSideMenuTitle } from '../../src/components/DecisionsSideMenuTitle'
import { render, screen } from '../test-utils'

describe('DecisionsSideMenuTitle', () => {
  it('shows default ordering "created at newest" when no ordering param', () => {
    render(<DecisionsSideMenuTitle />)
    expect(screen.getByText(/created at newest/)).toBeInTheDocument()
  })

  it('shows the correct ordering label for -confidence_score', () => {
    render(<DecisionsSideMenuTitle />, {
      initialEntries: ['/?ordering=-confidence_score']
    })
    expect(screen.getByText(/confidence high to low/)).toBeInTheDocument()
  })

  it('falls back to raw ordering value for unknown ordering', () => {
    render(<DecisionsSideMenuTitle />, {
      initialEntries: ['/?ordering=custom_field']
    })
    expect(screen.getByText(/custom_field/)).toBeInTheDocument()
  })
})
