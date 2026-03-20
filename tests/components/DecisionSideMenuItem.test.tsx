import { describe, expect, it } from 'vitest'

import { DecisionSideMenuItem } from '../../src/components/DecisionSideMenuItem'
import { render, screen } from '../test-utils'

import type { Decision } from '../../src/api/types.gen'

const baseDecision: Decision = {
  id: 42,
  created_at: new Date(Date.now() - 60_000).toISOString(), // 1 minute ago
  decision_context: {
    subject_entity_display_name: 'Alice Corp',
    alignment_options: [
      { confidence_score: 0.85 }
    ]
  }
} as unknown as Decision

describe('DecisionSideMenuItem', () => {
  it('renders the subject entity display name', () => {
    render(<DecisionSideMenuItem decision={baseDecision} />)
    expect(screen.getByText('Alice Corp')).toBeInTheDocument()
  })

  it('renders the confidence score formatted to 2 decimal places', () => {
    render(<DecisionSideMenuItem decision={baseDecision} />)
    expect(screen.getByText('0.85')).toBeInTheDocument()
  })

  it('renders a relative time ago label', () => {
    render(<DecisionSideMenuItem decision={baseDecision} />)
    // "1 minute ago" or similar
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('renders without crashing when confidence_score is undefined', () => {
    const decision: Decision = {
      ...baseDecision,
      decision_context: {
        subject_entity_display_name: 'No Score Entity',
        alignment_options: []
      }
    } as unknown as Decision
    render(<DecisionSideMenuItem decision={decision} />)
    expect(screen.getByText('No Score Entity')).toBeInTheDocument()
  })
})
