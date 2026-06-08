import { DecisionSideMenuItem } from '@components/DecisionSideMenuItem'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '../test-utils'

import type { DecisionSummary } from '@api/types.gen'

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
    similarity_score: 0.8
  },
  created_at: '2026-03-15T12:00:00Z'
}

describe('DecisionSideMenuItem', () => {
  describe('entity name display', () => {
    it('renders the entity display name from parsed_representation', () => {
      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.getByText('Alice Corp')).toBeInTheDocument()
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

    it('renders different names for different decisions', () => {
      const decision: DecisionSummary = {
        ...baseDecision,
        about_entity_mention: {
          ...baseDecision.about_entity_mention,
          parsed_representation: { name: 'Acme Industries' }
        }
      }
      render(<DecisionSideMenuItem decision={decision} />)
      expect(screen.getByText('Acme Industries')).toBeInTheDocument()
      expect(screen.queryByText('Alice Corp')).not.toBeInTheDocument()
    })
  })

  describe('confidence and similarity scores', () => {
    it('renders the confidence score formatted to 2 decimal places', () => {
      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.getByText('C: 0.85')).toBeInTheDocument()
    })

    it('renders the similarity score formatted to 2 decimal places', () => {
      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.getByText('S: 0.80')).toBeInTheDocument()
    })

    it('shows a numeric 0.00 for a zero/missing confidence score (TEDSWS-515)', () => {
      const decision: DecisionSummary = {
        ...baseDecision,
        current_placement: {
          cluster_id: 'cluster-1',
          confidence_score: 0,
          similarity_score: 0.8
        }
      }
      render(<DecisionSideMenuItem decision={decision} />)
      expect(screen.getByText('C: 0.00')).toBeInTheDocument()
    })

    it('renders confidence tag with success color for high score', () => {
      render(<DecisionSideMenuItem decision={baseDecision} />)
      const confidenceTag = screen.getByText('C: 0.85').closest('.ant-tag')
      expect(confidenceTag).toHaveClass('ant-tag-success')
    })

    it('renders confidence tag with warning color for medium score', () => {
      const decision: DecisionSummary = {
        ...baseDecision,
        current_placement: { cluster_id: 'c1', confidence_score: 0.55, similarity_score: 0.8 }
      }
      render(<DecisionSideMenuItem decision={decision} />)
      const confidenceTag = screen.getByText('C: 0.55').closest('.ant-tag')
      expect(confidenceTag).toHaveClass('ant-tag-warning')
    })

    it('renders confidence tag with error color for low score', () => {
      const decision: DecisionSummary = {
        ...baseDecision,
        current_placement: { cluster_id: 'c1', confidence_score: 0.2, similarity_score: 0.8 }
      }
      render(<DecisionSideMenuItem decision={decision} />)
      const confidenceTag = screen.getByText('C: 0.20').closest('.ant-tag')
      expect(confidenceTag).toHaveClass('ant-tag-error')
    })
  })

  describe('review status indicator (TEDSWS-522)', () => {
    it('shows no badge for a never-reviewed decision', () => {
      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.queryByText('Reviewed')).not.toBeInTheDocument()
      expect(screen.queryByText('Needs re-review')).not.toBeInTheDocument()
    })

    it('shows a "Reviewed" badge when reviewed since placement', () => {
      const decision: DecisionSummary = {
        ...baseDecision,
        previous_review_count: 1,
        reviewed_since_placement: true
      }
      render(<DecisionSideMenuItem decision={decision} />)
      expect(screen.getByText('Reviewed')).toBeInTheDocument()
    })

    it('shows a "Needs re-review" badge when reviewed before but not since placement', () => {
      const decision: DecisionSummary = {
        ...baseDecision,
        previous_review_count: 3,
        reviewed_since_placement: false
      }
      render(<DecisionSideMenuItem decision={decision} />)
      expect(screen.getByText('Needs re-review')).toBeInTheDocument()
    })
  })

  describe('time display', () => {
    it('renders exact "1m ago" for a decision created 60 seconds ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T12:01:00Z'))

      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.getByText('1m ago')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('renders "2h ago" for a decision created 2 hours ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T14:00:00Z'))

      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.getByText('2h ago')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('renders "3d ago" for a decision created 3 days ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))

      render(<DecisionSideMenuItem decision={baseDecision} />)
      expect(screen.getByText('3d ago')).toBeInTheDocument()

      vi.useRealTimers()
    })
  })
})
