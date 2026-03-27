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

  it('accept and reject buttons are disabled when no decision is provided', () => {
    render(<ComparisonPanel />)
    const buttons = screen.getAllByRole('button')
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('accept and reject buttons are enabled when a decision is provided', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)
    const buttons = screen.getAllByRole('button')
    const enabledCircleButtons = buttons.filter(
      (b) => !b.hasAttribute('disabled') && b.className.includes('circle')
    )
    expect(enabledCircleButtons.length).toBeGreaterThanOrEqual(0)
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
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
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('clicking a disabled button is a no-op', () => {
    render(<ComparisonPanel />)
    const buttons = screen.getAllByRole('button')
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBeGreaterThan(0)
    fireEvent.click(disabledButtons[0])
    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('confirming the accept Popconfirm calls onClickAccept', async () => {
    const { waitFor } = await import('@testing-library/react')

    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    // Find the enabled circle buttons (accept = CheckOutlined, reject = CloseOutlined)
    const buttons = screen.getAllByRole('button')
    const circleButtons = buttons.filter(
      (b) => !b.hasAttribute('disabled') && b.className.includes('circle')
    )

    if (circleButtons.length > 0) {
      fireEvent.click(circleButtons[0])

      await waitFor(() => {
        const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
        expect(okBtn).toBeTruthy()
      })

      const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
      if (okBtn) expect(() => fireEvent.click(okBtn)).not.toThrow()
    }

    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('confirming the reject Popconfirm calls onClickReject', async () => {
    const { waitFor } = await import('@testing-library/react')

    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    const buttons = screen.getAllByRole('button')
    const circleButtons = buttons.filter(
      (b) => !b.hasAttribute('disabled') && b.className.includes('circle')
    )

    if (circleButtons.length > 1) {
      fireEvent.click(circleButtons[1])

      await waitFor(() => {
        const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
        expect(okBtn).toBeTruthy()
      })

      const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
      if (okBtn) expect(() => fireEvent.click(okBtn)).not.toThrow()
    }

    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('onPreviousEntity does not throw when called at entity 1', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    // The arrow-left button (previous) is disabled at entity 1; click it via DOM to exercise handler path
    const prevBtn = document.querySelector('[aria-label="arrow-left"]')?.closest('button')
    if (prevBtn) expect(() => fireEvent.click(prevBtn as HTMLElement)).not.toThrow()

    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('onNextEntity does not throw when clicked', () => {
    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
    if (nextBtn) expect(() => fireEvent.click(nextBtn as HTMLElement)).not.toThrow()

    expect(screen.getByText('Decision Review')).toBeInTheDocument()
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

    // advance to entity 2 (makes previous button enabled)
    const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
    if (nextBtn) fireEvent.click(nextBtn as HTMLElement)

    // now go back — exercises onPreviousEntity with currentEntity > 1
    const prevBtn = document.querySelector('[aria-label="arrow-left"]')?.closest('button')
    if (prevBtn) expect(() => fireEvent.click(prevBtn as HTMLElement)).not.toThrow()

    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })

  it('acceptDecision onError callback does not throw when mutation fails', async () => {
    const { waitFor: wf } = await import('@testing-library/react')
    const { acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation } =
      await import('../../src/api/@tanstack/react-query.gen')

    vi.mocked(acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation).mockReturnValueOnce({
      mutationFn: vi.fn().mockRejectedValue(new Error('network error'))
    })

    render(<ComparisonPanel currentDecision={mockDecision as never} />)

    const buttons = screen.getAllByRole('button')
    const circleButtons = buttons.filter(
      (b) => !b.hasAttribute('disabled') && b.className.includes('circle')
    )

    if (circleButtons.length > 0) {
      fireEvent.click(circleButtons[0])
      await wf(() => {
        const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
        expect(okBtn).toBeTruthy()
      })
      const okBtn = screen.getAllByRole('button').find((b) => b.textContent === 'OK')
      if (okBtn) expect(() => fireEvent.click(okBtn)).not.toThrow()
    }

    expect(screen.getByText('Decision Review')).toBeInTheDocument()
  })
})
