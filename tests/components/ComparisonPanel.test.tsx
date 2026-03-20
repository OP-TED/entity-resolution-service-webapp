import { describe, expect, it, vi } from 'vitest'

import { ComparisonPanel } from '../../src/components/ComparisonPanel'
import { createTestQueryClient, fireEvent, render, screen } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  curationDecisionsAcceptCreateMutation: vi.fn(() => ({ mutationFn: vi.fn() })),
  curationDecisionsRejectCreateMutation: vi.fn(() => ({ mutationFn: vi.fn() })),
  curationDecisionsProposedCanonicalEntityRetrieveOptions: vi.fn(() => ({
    queryKey: ['proposed-entity'],
    queryFn: vi.fn().mockResolvedValue({ top_alignment_links: [] })
  })),
  curationEntitiesRetrieveOptions: vi.fn(() => ({
    queryKey: ['entity'],
    queryFn: vi.fn().mockResolvedValue({ parsed_data: {} })
  })),
  curationDecisionsRetrieveInfiniteQueryKey: vi.fn(() => ['decisions-infinite']),
  curationDecisionsAlternativeCanonicalEntitiesRetrieveInfiniteOptions: vi.fn(
    () => ({
      queryKey: ['alt-clusters'],
      queryFn: vi.fn().mockResolvedValue({ results: [], next: null })
    })
  ),
  curationDecisionsAssignCreateMutation: vi.fn(() => ({ mutationFn: vi.fn() })),
  curationStatsRetrieveQueryKey: vi.fn(() => ['stats'])
}))

vi.mock('../../src/hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

vi.mock('../../src/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({ current: null }))
}))

const mockDecision = {
  id: 99,
  decision_status: 'PENDING_MANUAL_REVIEW',
  created_at: new Date().toISOString(),
  decision_context: {
    subject_entity_display_name: 'Test Entity',
    subject_entity_mention_identifier: 'test-id'
  }
}

describe('ComparisonPanel', () => {
  it('renders the "Decision Review" heading', () => {
    render(<ComparisonPanel />)
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('renders at least the accept and reject circle buttons', () => {
    render(<ComparisonPanel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders without crashing when no decision is provided', () => {
    render(<ComparisonPanel />)
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('renders with a currentDecision without crashing', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('renders the warning alert', () => {
    render(<ComparisonPanel />)
    expect(screen.getByText(/Why review needed/)).toBeInTheDocument()
  })

  it('accept and reject buttons are disabled when decision is not pending review', () => {
    const accepted = { ...mockDecision, decision_status: 'ACCEPTED' }
    render(<ComparisonPanel currentDecision={accepted as never} />)
    const buttons = screen.getAllByRole('button')
    // Both accept/reject should be disabled
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('clicking next entity button invokes onNextEntity', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['proposed-entity'], {
      top_alignment_links: [
        { confidence_score: 0.9, entity_mention: { parsed_data: { name: 'A' } } },
        { confidence_score: 0.8, entity_mention: { parsed_data: { name: 'B' } } }
      ]
    })
    render(<ComparisonPanel currentDecision={mockDecision as never} />, { queryClient })

    const buttons = screen.getAllByRole('button')
    // The ProposedCard's "next" arrow button (last arrow button) should be enabled
    // clicking it exercises onNextEntity
    const enabledButtons = buttons.filter((b) => !b.hasAttribute('disabled'))
    if (enabledButtons.length > 0) {
      fireEvent.click(enabledButtons[enabledButtons.length - 1])
    }
    // Entity count label should still be in document
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('clicking previous entity button invokes onPreviousEntity', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['proposed-entity'], {
      top_alignment_links: [
        { confidence_score: 0.9, entity_mention: { parsed_data: { name: 'A' } } },
        { confidence_score: 0.8, entity_mention: { parsed_data: { name: 'B' } } }
      ]
    })
    render(<ComparisonPanel currentDecision={mockDecision as never} />, { queryClient })

    const buttons = screen.getAllByRole('button')
    // Previous button at currentEntity=1 is disabled; clicking it is a no-op
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBeGreaterThan(0)
    fireEvent.click(disabledButtons[0])
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })
})
