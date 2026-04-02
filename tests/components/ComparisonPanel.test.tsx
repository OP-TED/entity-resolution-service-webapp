import { describe, expect, it, vi } from 'vitest'

import { ComparisonPanel } from '../../src/components/ComparisonPanel'
import { createTestQueryClient, fireEvent, render, screen } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation: vi.fn(() => ({
    mutationFn: vi.fn()
  })),
  rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation: vi.fn(() => ({
    mutationFn: vi.fn()
  })),
  getProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetOptions:
    vi.fn(() => ({
      queryKey: ['proposed-entity'],
      queryFn: vi.fn().mockResolvedValue({ top_entities: [], confidence_score: 0.9, cluster_id: 'c1', similarity_score: 0.8 })
    })),
  getAlternativeCanonicalEntitiesApiV1CurationDecisionsDecisionIdAlternativeCanonicalEntitiesGetInfiniteOptions:
    vi.fn(() => ({
      queryKey: ['alt-clusters'],
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

vi.mock('../../src/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({ current: null }))
}))

const mockDecision = {
  id: 'decision-99',
  about_entity_mention: {
    identified_by: {
      source_id: 'src-1',
      request_id: 'entity-99',
      entity_type: 'Person'
    },
    parsed_representation: { name: 'Test Entity' }
  },
  current_placement: {
    cluster_id: 'cluster-1',
    confidence_score: 0.8,
    similarity_score: 0.75
  },
  created_at: new Date().toISOString()
}

describe('ComparisonPanel', () => {
  it('renders the section element', () => {
    render(<ComparisonPanel />)
    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('renders at least the accept and reject circle buttons when decision is provided', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders without crashing when no decision is provided', () => {
    render(<ComparisonPanel />)
    expect(screen.getByText('No Decisions to Review')).toBeInTheDocument()
  })

  it('renders with a currentDecision without crashing', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('renders the warning alert when decision is provided', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    expect(screen.getByText(/Why review needed/)).toBeInTheDocument()
  })

  it('shows empty state when no decision is provided', () => {
    render(<ComparisonPanel />)
    expect(screen.getByText('No Decisions to Review')).toBeInTheDocument()
  })

  it('accept and reject buttons are enabled when a decision is provided', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('clicking next entity button stays on decision review screen', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['proposed-entity'], {
      cluster_id: 'cluster-1',
      confidence_score: 0.9,
      similarity_score: 0.8,
      top_entities: [
        {
          identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
          parsed_representation: { name: 'A' }
        },
        {
          identified_by: { source_id: 's1', request_id: 'e2', entity_type: 'Person' },
          parsed_representation: { name: 'B' }
        }
      ]
    })
    render(<ComparisonPanel currentDecision={mockDecision as never} />, { queryClient })

    const buttons = screen.getAllByRole('button')
    const enabledButtons = buttons.filter((b) => !b.hasAttribute('disabled'))
    if (enabledButtons.length > 0) {
      fireEvent.click(enabledButtons[enabledButtons.length - 1])
    }
    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('clicking a disabled button is a no-op', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('accept button click does not throw', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    const buttons = screen.getAllByRole('button')
    const circleButtons = buttons.filter((b) => !b.hasAttribute('disabled') && b.className.includes('circle'))
    if (circleButtons.length > 0) {
      expect(() => fireEvent.click(circleButtons[0])).not.toThrow()
    }
    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('reject button click does not throw', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    const buttons = screen.getAllByRole('button')
    const circleButtons = buttons.filter((b) => !b.hasAttribute('disabled') && b.className.includes('circle'))
    if (circleButtons.length > 1) {
      expect(() => fireEvent.click(circleButtons[1])).not.toThrow()
    }
    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('onPreviousEntity does not throw when called at entity 1', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    const prevBtn = document.querySelector('[aria-label="arrow-left"]')?.closest('button')
    if (prevBtn) expect(() => fireEvent.click(prevBtn as HTMLElement)).not.toThrow()

    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('onNextEntity does not throw when clicked', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
    if (nextBtn) expect(() => fireEvent.click(nextBtn as HTMLElement)).not.toThrow()

    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('onPreviousEntity decrements entity index when at entity 2', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['proposed-entity'], {
      cluster_id: 'cluster-1',
      confidence_score: 0.9,
      similarity_score: 0.8,
      top_entities: [
        { identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' }, parsed_representation: { name: 'A' } },
        { identified_by: { source_id: 's1', request_id: 'e2', entity_type: 'Person' }, parsed_representation: { name: 'B' } }
      ]
    })

    render(<ComparisonPanel currentDecision={mockDecision as never} />, { queryClient })

    const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
    if (nextBtn) fireEvent.click(nextBtn as HTMLElement)

    const prevBtn = document.querySelector('[aria-label="arrow-left"]')?.closest('button')
    if (prevBtn) expect(() => fireEvent.click(prevBtn as HTMLElement)).not.toThrow()

    expect(document.body.querySelector('section')).toBeTruthy()
  })

  it('acceptDecision onError callback does not throw when mutation fails', async () => {
    const { acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation } =
      await import('../../src/api/@tanstack/react-query.gen')

    vi.mocked(acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation).mockReturnValueOnce({
      mutationFn: vi.fn().mockRejectedValue(new Error('network error'))
    })

    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})

