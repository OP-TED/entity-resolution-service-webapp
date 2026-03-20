import { describe, expect, it } from 'vitest'

import { DecisionsSideMenuTitle } from '../../src/components/DecisionsSideMenuTitle'
import { render, screen } from '../test-utils'

describe('DecisionsSideMenuTitle', () => {
  it('shows "All Statuses" when no status param is set', () => {
    render(<DecisionsSideMenuTitle />)
    expect(screen.getByText(/All Statuses/)).toBeInTheDocument()
  })

  it('shows "Pending Review" for PENDING_MANUAL_REVIEW status', () => {
    render(<DecisionsSideMenuTitle />, {
      initialEntries: ['/?status=PENDING_MANUAL_REVIEW']
    })
    expect(screen.getByText(/Pending Review/)).toBeInTheDocument()
  })

  it('shows "Reviewed" for MANUALLY_REVIEWED status', () => {
    render(<DecisionsSideMenuTitle />, {
      initialEntries: ['/?status=MANUALLY_REVIEWED']
    })
    expect(screen.getByText(/Reviewed/)).toBeInTheDocument()
  })

  it('shows "Automatic Confident" for AUTOMATIC_CONFIDENT status', () => {
    render(<DecisionsSideMenuTitle />, {
      initialEntries: ['/?status=AUTOMATIC_CONFIDENT']
    })
    expect(screen.getByText(/Automatic Confident/)).toBeInTheDocument()
  })

  it('falls back to the raw status value for unknown status', () => {
    render(<DecisionsSideMenuTitle />, {
      initialEntries: ['/?status=UNKNOWN_STATUS']
    })
    expect(screen.getByText(/UNKNOWN_STATUS/)).toBeInTheDocument()
  })

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
