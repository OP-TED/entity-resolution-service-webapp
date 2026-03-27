import { describe, expect, it } from 'vitest'

import { DecisionSideMenuItem } from '../../src/components/DecisionSideMenuItem'
import { render, screen } from '../test-utils'

import type { DecisionSummary } from '../../src/api/types.gen'

const baseDecision: DecisionSummary = {
  id: 'decision-001',
  about_entity_mention: {
    identified_by: {
      source_id: 'src-1',
      request_id: 'entity-001',
      entity_type: 'Person'
    },
    parsed_representation: { name: 'Alice Corp' }
  },
  current_placement: {
    cluster_id: 'cluster-1',
    confidence_score: 0.85,
    similarity_score: 0.80
  },
  created_at: new Date(Date.now() - 60_000).toISOString()
}

describe('DecisionSideMenuItem', () => {
  it('renders the entity display name from parsed_representation', () => {
    render(<DecisionSideMenuItem decision={baseDecision} />)
    expect(screen.getByText('Alice Corp')).toBeInTheDocument()
  })

  it('renders the confidence score formatted to 2 decimal places', () => {
    render(<DecisionSideMenuItem decision={baseDecision} />)
    expect(screen.getByText('0.85')).toBeInTheDocument()
  })

  it('renders a relative time ago label', () => {
    render(<DecisionSideMenuItem decision={baseDecision} />)
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('falls back to request_id when parsed_representation has no name', () => {
    const decision: DecisionSummary = {
      ...baseDecision,
      about_entity_mention: {
        identified_by: {
          source_id: 'src-1',
          request_id: 'entity-fallback-id',
          entity_type: 'Person'
        },
        parsed_representation: {}
      }
    }
    render(<DecisionSideMenuItem decision={decision} />)
    expect(screen.getByText('entity-fallback-id')).toBeInTheDocument()
  })
})
