import { describe, expect, it, vi } from 'vitest'

import { AlternativeClusters } from '../../src/components/AlternativeClusters'
import { createTestQueryClient, render, screen } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  curationDecisionsAlternativeCanonicalEntitiesRetrieveInfiniteOptions: vi.fn(
    () => ({
      queryKey: ['alternative-clusters'],
      queryFn: vi.fn().mockResolvedValue({ results: [], next: null })
    })
  ),
  curationDecisionsAssignCreateMutation: vi.fn(() => ({ mutationFn: vi.fn() })),
  curationDecisionsRetrieveInfiniteQueryKey: vi.fn(() => ['decisions-infinite']),
  curationStatsRetrieveQueryKey: vi.fn(() => ['stats'])
}))

vi.mock('../../src/hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

describe('AlternativeClusters', () => {
  it('renders the "Load More" button', () => {
    render(<AlternativeClusters />)
    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument()
  })

  it('"Load More" button is disabled when there is no next page', () => {
    render(<AlternativeClusters />)
    expect(screen.getByRole('button', { name: /Load More/i })).toBeDisabled()
  })

  it('renders without crashing when no currentDecision is provided', () => {
    render(<AlternativeClusters />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders without crashing when a decision is provided', () => {
    render(
      <AlternativeClusters
        currentDecision={{ id: 1, decision_status: 'PENDING_MANUAL_REVIEW' } as never}
      />
    )
    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument()
  })

  it('renders cluster cards when alternative clusters are preloaded in cache', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], {
      pages: [
        {
          results: [
            {
              identifier: 'cluster-1',
              confidence_score: 0.75,
              top_alignment_links: [
                { entity_mention: { parsed_data: { name: 'Alt Entity A' } } }
              ]
            }
          ],
          next: null
        }
      ],
      pageParams: [1]
    })

    render(
      <AlternativeClusters
        currentDecision={{ id: 1, decision_status: 'PENDING_MANUAL_REVIEW' } as never}
      />,
      { queryClient }
    )

    // Collapse label is always visible; children are hidden until expanded
    expect(screen.getByText(/Compare with/)).toBeInTheDocument()
    expect(screen.getByText(/0\.75/)).toBeInTheDocument()
  })
})
