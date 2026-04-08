import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'

import { ComparisonPanel } from '../../src/components/ComparisonPanel'
import { createTestQueryClient, fireEvent, render, screen, waitFor } from '../test-utils'

const mockNotification = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn()
}))
const mockRemoveDecisionFromCache = vi.hoisted(() => vi.fn())

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

vi.mock('../../src/hooks/useRemoveDecisionFromCache', () => ({
  useRemoveDecisionFromCache: () => mockRemoveDecisionFromCache
}))

vi.mock('../../src/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({ current: null }))
}))

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()

  const Popconfirm = ({ children, onConfirm }: { children: ReactNode; onConfirm?: () => void }) => (
    <div>
      {children}
      <button type="button" aria-label="confirm-pop" onClick={onConfirm}>
        confirm
      </button>
    </div>
  )

  const Alert = ({ closable, title }: { closable?: { onClose?: () => void }; title?: ReactNode }) => (
    <div>
      <div>{title}</div>
      <button type="button" aria-label="close-alert" onClick={() => closable?.onClose?.()}>
        close
      </button>
    </div>
  )

  const AppComponent = antd.App

  return {
    ...antd,
    Popconfirm,
    Alert,
    App: Object.assign(AppComponent, {
      useApp: () => ({ notification: mockNotification })
    })
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

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
  describe('empty state', () => {
    it('shows "No Decisions to Review" when no decision is provided', () => {
      render(<ComparisonPanel />)
      expect(screen.getByText('No Decisions to Review')).toBeInTheDocument()
    })
  })

  describe('with a decision', () => {
    it('renders accept and reject confirm buttons', () => {
      render(<ComparisonPanel currentDecision={mockDecision as never} />)
      const confirmButtons = screen.getAllByRole('button', { name: 'confirm-pop' })
      expect(confirmButtons).toHaveLength(2)
    })

    it('renders the warning alert explaining why review is needed', () => {
      render(<ComparisonPanel currentDecision={mockDecision as never} />)
      expect(screen.getByText(/Why review needed/)).toBeInTheDocument()
    })

    it('closes the warning alert when close icon is clicked', () => {
      render(<ComparisonPanel currentDecision={mockDecision as never} />)

      expect(screen.getByText(/Why review needed/i)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'close-alert' }))
      expect(screen.queryByText(/Why review needed/i)).not.toBeInTheDocument()
    })
  })

  describe('entity navigation', () => {
    it('navigates between entities in the proposed cluster', () => {
      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['proposed-entity'], {
        cluster_id: 'cluster-1',
        confidence_score: 0.9,
        similarity_score: 0.8,
        top_entities: [
          {
            identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
            parsed_representation: { name: 'Entity A' }
          },
          {
            identified_by: { source_id: 's1', request_id: 'e2', entity_type: 'Person' },
            parsed_representation: { name: 'Entity B' }
          }
        ]
      })
      render(<ComparisonPanel currentDecision={mockDecision as never} />, { queryClient })

      // Should start at entity 1
      expect(screen.getByText(/Entity 1 of 2/)).toBeInTheDocument()

      // Navigate forward
      const nextBtn = document.querySelector('[aria-label="arrow-right"]')?.closest('button')
      expect(nextBtn).toBeTruthy()
      expect(nextBtn).not.toBeDisabled()
      fireEvent.click(nextBtn!)

      expect(screen.getByText(/Entity 2 of 2/)).toBeInTheDocument()

      // Navigate back
      const prevBtn = document.querySelector('[aria-label="arrow-left"]')?.closest('button')
      expect(prevBtn).toBeTruthy()
      fireEvent.click(prevBtn!)

      expect(screen.getByText(/Entity 1 of 2/)).toBeInTheDocument()
    })
  })

  describe('accept flow', () => {
    it('calls mutation, removes from cache, and shows success notification', async () => {
      const { acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation } =
        await import('../../src/api/@tanstack/react-query.gen')

      vi.mocked(acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation).mockReturnValueOnce({
        mutationFn: vi.fn().mockResolvedValue({})
      })

      render(<ComparisonPanel currentDecision={mockDecision as never} />)

      const confirms = screen.getAllByRole('button', { name: 'confirm-pop' })
      fireEvent.click(confirms[0])

      await waitFor(() => {
        expect(mockRemoveDecisionFromCache).toHaveBeenCalledWith('decision-99')
        expect(mockNotification.success).toHaveBeenCalledWith({ message: 'Decision accepted' })
      })
    })

    it('shows error notification when accept mutation fails', async () => {
      const { acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation } =
        await import('../../src/api/@tanstack/react-query.gen')

      vi.mocked(acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation).mockReturnValueOnce({
        mutationFn: vi.fn().mockRejectedValue({
          body: { detail: 'accept failed' }
        })
      })

      render(<ComparisonPanel currentDecision={mockDecision as never} />)

      const confirms = screen.getAllByRole('button', { name: 'confirm-pop' })
      fireEvent.click(confirms[0])

      await waitFor(() => {
        expect(mockNotification.error).toHaveBeenCalled()
      })
    })
  })

  describe('reject flow', () => {
    it('calls mutation, removes from cache, and shows success notification', async () => {
      const { rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation } =
        await import('../../src/api/@tanstack/react-query.gen')

      vi.mocked(rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation).mockReturnValueOnce({
        mutationFn: vi.fn().mockResolvedValue({})
      })

      render(<ComparisonPanel currentDecision={mockDecision as never} />)

      const confirms = screen.getAllByRole('button', { name: 'confirm-pop' })
      fireEvent.click(confirms[1])

      await waitFor(() => {
        expect(mockRemoveDecisionFromCache).toHaveBeenCalledWith('decision-99')
        expect(mockNotification.success).toHaveBeenCalledWith({ message: 'Decision rejected' })
      })
    })

    it('shows error notification when reject mutation fails', async () => {
      const { rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation } =
        await import('../../src/api/@tanstack/react-query.gen')

      vi.mocked(rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation).mockReturnValueOnce({
        mutationFn: vi.fn().mockRejectedValue({
          body: { detail: 'reject failed' }
        })
      })

      render(<ComparisonPanel currentDecision={mockDecision as never} />)

      const confirms = screen.getAllByRole('button', { name: 'confirm-pop' })
      fireEvent.click(confirms[1])

      await waitFor(() => {
        expect(mockNotification.error).toHaveBeenCalled()
      })
    })
  })
})
