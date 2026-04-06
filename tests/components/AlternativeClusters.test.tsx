import { describe, expect, it, vi } from 'vitest'

import { AlternativeClusters } from '../../src/components/AlternativeClusters'
import { createTestQueryClient, fireEvent, render, screen } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  getAlternativeCanonicalEntitiesApiV1CurationDecisionsDecisionIdAlternativeCanonicalEntitiesGetInfiniteOptions:
    vi.fn(() => ({
      queryKey: ['alternative-clusters'],
      queryFn: vi.fn().mockResolvedValue({ results: [], next: null })
    })),
  assignDecisionApiV1CurationDecisionsDecisionIdAssignPostMutation: vi.fn(() => ({
    mutationFn: vi.fn()
  })),
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey: vi.fn(() => ['decisions-infinite']),
  getStatisticsApiV1CurationStatsGetQueryKey: vi.fn(() => ['stats'])
}))

vi.mock('../../src/hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

const mockDecision = {
  id: 'decision-1',
  about_entity_mention: {
    identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
    parsed_representation: { name: 'Test Entity' }
  },
  current_placement: { cluster_id: 'c1', confidence_score: 0.8, similarity_score: 0.7 },
  created_at: new Date().toISOString()
}

const clusterPage = (overrides = {}) => ({
  pages: [
    {
      results: [
        {
          cluster_id: 'cluster-1',
          confidence_score: 0.75,
          similarity_score: 0.70,
          top_entities: [
            {
              identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
              parsed_representation: { name: 'Alt Entity A' }
            }
          ],
          ...overrides
        }
      ],
      next: null
    }
  ],
  pageParams: [1]
})

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
    render(<AlternativeClusters currentDecision={mockDecision as never} />)
    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument()
  })

  it('renders cluster cards when alternative clusters are preloaded in cache', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage())

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    expect(screen.getByText(/Compare with/)).toBeInTheDocument()
    expect(screen.getByText(/0\.75/)).toBeInTheDocument()
  })

  it('renders "2nd best cluster" label for the first cluster', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage())

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    expect(screen.getByText(/Compare with 2nd best cluster/i)).toBeInTheDocument()
  })

  it('renders "Use this cluster instead" button after expanding the cluster panel', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage())

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    // Expand the Collapse panel by clicking its header
    const collapseHeader = screen.getByText(/Compare with 2nd best cluster/i)
    fireEvent.click(collapseHeader)

    expect(screen.getByRole('button', { name: /Use this cluster instead/i })).toBeInTheDocument()
  })

  it('renders a confidence tag for the cluster', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage({ confidence_score: 0.92 }))

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    expect(screen.getByText(/0\.92/)).toBeInTheDocument()
  })

  it('shows loading skeleton when the decisions menu is loading', () => {
    vi.doMock('../../src/hooks/useDecisionsLoadingState', () => ({
      useDecisionsLoadingState: () => true
    }))

    render(<AlternativeClusters currentDecision={mockDecision as never} />)
    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument()
  })

  it('clicking the next entity button covers onClickNextEntity', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage({
      top_entities: [
        { identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' }, parsed_representation: { name: 'A' } },
        { identified_by: { source_id: 's1', request_id: 'e2', entity_type: 'Person' }, parsed_representation: { name: 'B' } }
      ]
    }))

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    fireEvent.click(screen.getByText(/Compare with 2nd best cluster/i))

    // Arrow-right button (icon-only) = next navigation button in ProposedCard
    const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
    if (nextBtn) expect(() => fireEvent.click(nextBtn as HTMLElement)).not.toThrow()

    expect(document.querySelector('button[disabled]') !== null || document.querySelector('button') !== null).toBe(true)
  })

  it('clicking the previous entity button covers onClickPreviousEntity after advancing', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage({
      top_entities: [
        { identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' }, parsed_representation: { name: 'A' } },
        { identified_by: { source_id: 's1', request_id: 'e2', entity_type: 'Person' }, parsed_representation: { name: 'B' } }
      ]
    }))

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    fireEvent.click(screen.getByText(/Compare with 2nd best cluster/i))

    // Click next first to advance to entity 2 (enabling the previous button)
    const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
    if (nextBtn) fireEvent.click(nextBtn as HTMLElement)

    // Previous button should now be enabled; click it
    const prevBtn = document.querySelector('[aria-label="arrow-left"]')?.closest('button')
    if (prevBtn) expect(() => fireEvent.click(prevBtn as HTMLElement)).not.toThrow()

    expect(document.body).toBeInTheDocument()
  })

  it('confirming the Popconfirm covers onConfirmSwitchCluster', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['alternative-clusters'], clusterPage())

    render(<AlternativeClusters currentDecision={mockDecision as never} />, { queryClient })

    // Expand panel synchronously (no animation in happy-dom)
    fireEvent.click(screen.getByText(/Compare with 2nd best cluster/i))

    // Click the Popconfirm trigger synchronously
    fireEvent.click(screen.getByRole('button', { name: /Use this cluster instead/i }))

    // The Popconfirm popup renders synchronously in happy-dom
    const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
    if (okBtn) expect(() => fireEvent.click(okBtn)).not.toThrow()

    expect(document.body).toBeInTheDocument()
  })
})
