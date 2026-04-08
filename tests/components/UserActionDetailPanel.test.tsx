import { describe, expect, it, vi } from 'vitest'

import { UserActionDetailPanel } from '../../src/components/UserActionDetailPanel'
import { createTestQueryClient, fireEvent, render, screen, waitFor } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions: vi.fn(
    () => ({
      queryKey: ['selected-cluster'],
      queryFn: vi.fn().mockResolvedValue(null)
    })
  ),
  getCandidatesApiV1UserActionsActionIdCandidatesGetInfiniteOptions: vi.fn(
    () => ({
      queryKey: ['candidates-infinite'],
      queryFn: vi.fn().mockResolvedValue({ results: [], next: null })
    })
  )
}))

vi.mock('../../src/hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

const mockAction = {
  id: 'action-001',
  about_entity_mention: {
    identified_by: {
      source_id: 'src-1',
      request_id: 'entity-001',
      entity_type: 'Person'
    },
    parsed_representation: { name: 'Alice Corp', city: 'Paris' }
  },
  candidates: [
    {
      cluster_id: 'cluster-1',
      confidence_score: 0.85,
      similarity_score: 0.8
    }
  ],
  selected_cluster: { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8 },
  action_type: 'ACCEPT_TOP' as const,
  actor: {
    id: 'user-123',
    email: 'admin@ers.local',
  },
  created_at: '2026-03-15T12:00:00Z'
}

const mockSelectedCluster = {
  cluster_id: 'cluster-1',
  confidence_score: 0.85,
  similarity_score: 0.8,
  top_entities: [
    {
      identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
      parsed_representation: { name: 'Alice Corp', city: 'Paris' }
    },
    {
      identified_by: { source_id: 's1', request_id: 'e2', entity_type: 'Person' },
      parsed_representation: { name: 'Bob Smith', city: 'London' }
    }
  ]
}

describe('UserActionDetailPanel', () => {
  describe('empty state', () => {
    it('shows "No Action Selected" heading', () => {
      render(<UserActionDetailPanel />)
      expect(screen.getByText('No Action Selected')).toBeInTheDocument()
    })

    it('shows helper text to select an action', () => {
      render(<UserActionDetailPanel />)
      expect(screen.getByText(/Select an action from the list/)).toBeInTheDocument()
    })

    it('renders as a section element', () => {
      render(<UserActionDetailPanel />)
      expect(document.querySelector('section')).toBeTruthy()
    })
  })

  describe('action header', () => {
    it('renders entity display name from parsed_representation', () => {
      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getAllByText('Alice Corp').length).toBeGreaterThanOrEqual(1)
    })

    it('falls back to request_id when parsed_representation has no name', () => {
      const action = {
        ...mockAction,
        about_entity_mention: {
          identified_by: { source_id: 's1', request_id: 'req-fallback', entity_type: 'Person' },
          parsed_representation: {}
        }
      }
      render(<UserActionDetailPanel currentAction={action as never} />)
      expect(screen.getByText('req-fallback')).toBeInTheDocument()
    })

    it('renders actor email', () => {
      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getByText(/admin@ers\.local/)).toBeInTheDocument()
    })

    it('shows "Unknown User" when actor email is missing', () => {
      const action = {
        ...mockAction,
        actor: { id: 'u1', email: undefined }
      }
      render(<UserActionDetailPanel currentAction={action as never} />)
      expect(screen.getByText(/Unknown User/)).toBeInTheDocument()
    })
  })

  describe('action type tags', () => {
    it.each([
      { type: 'ACCEPT_TOP' as const, label: 'Accept Top', color: 'green' },
      { type: 'ACCEPT_ALTERNATIVE' as const, label: 'Accept Alternative', color: 'blue' },
      { type: 'REJECT_ALL' as const, label: 'Reject All', color: 'red' },
    ])('renders "$label" tag with $color color for $type', ({ type, label, color }) => {
      render(
        <UserActionDetailPanel
          currentAction={{ ...mockAction, action_type: type } as never}
        />
      )
      const tag = screen.getByText(label).closest('.ant-tag')
      expect(tag).toBeInTheDocument()
      expect(tag).toHaveClass(`ant-tag-${color}`)
    })
  })

  describe('time display', () => {
    it('renders "5m ago" when 5 minutes have passed', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T12:05:00Z'))

      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getByText('5m ago')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('renders "3h ago" when 3 hours have passed', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T15:00:00Z'))

      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getByText('3h ago')).toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('entity mention card', () => {
    it('renders "Current Entity" card', () => {
      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getByText('Current Entity')).toBeInTheDocument()
    })

    it('passes entity attributes to EntityCard', () => {
      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getByText('City:')).toBeInTheDocument()
      expect(screen.getByText('Paris')).toBeInTheDocument()
    })
  })

  describe('selected cluster', () => {
    it('shows "Selected Cluster" ProposedCard when data is in cache', async () => {
      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['selected-cluster'], mockSelectedCluster)

      render(
        <UserActionDetailPanel currentAction={mockAction as never} />,
        { queryClient }
      )

      await waitFor(() => {
        expect(screen.getByText('Selected Cluster')).toBeInTheDocument()
      })
    })

    it('shows entity count label from selected cluster', async () => {
      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['selected-cluster'], mockSelectedCluster)

      render(
        <UserActionDetailPanel currentAction={mockAction as never} />,
        { queryClient }
      )

      await waitFor(() => {
        expect(screen.getByText('Selected Cluster')).toBeInTheDocument()
        expect(screen.getByText(/Entity 1 of 2/)).toBeInTheDocument()
      })
    })

    it('shows "No Cluster Selected" fallback for REJECT_ALL', () => {
      render(
        <UserActionDetailPanel
          currentAction={{ ...mockAction, action_type: 'REJECT_ALL', selected_cluster: null } as never}
        />
      )

      expect(screen.getByText('No Cluster Selected')).toBeInTheDocument()
      expect(screen.getByText(/All candidates were rejected/)).toBeInTheDocument()
    })

    it('does not query selected cluster API for REJECT_ALL', async () => {
      const {
        getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions
      } = await import('../../src/api/@tanstack/react-query.gen')

      render(
        <UserActionDetailPanel
          currentAction={{ ...mockAction, action_type: 'REJECT_ALL', selected_cluster: null } as never}
        />
      )

      expect(
        vi.mocked(getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions)
      ).not.toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      )
    })
  })

  describe('candidates', () => {
    it('renders "Candidates" heading', () => {
      render(<UserActionDetailPanel currentAction={mockAction as never} />)
      expect(screen.getByText('Candidates')).toBeInTheDocument()
    })

    it('shows "No candidates available" when candidates list is empty', async () => {
      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['candidates-infinite'], {
        pages: [{ results: [], next: null }],
        pageParams: [1]
      })

      render(
        <UserActionDetailPanel currentAction={mockAction as never} />,
        { queryClient }
      )

      await waitFor(() => {
        expect(screen.getByText('No candidates available')).toBeInTheDocument()
      })
    })

    it('renders candidate collapse items with cluster IDs', async () => {
      const { getCandidatesApiV1UserActionsActionIdCandidatesGetInfiniteOptions } =
        await import('../../src/api/@tanstack/react-query.gen')

      vi.mocked(
        getCandidatesApiV1UserActionsActionIdCandidatesGetInfiniteOptions
      ).mockReturnValueOnce({
        queryKey: ['candidates-infinite'],
        queryFn: vi.fn().mockResolvedValue({
          results: [
            { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8, top_entities: [] },
            { cluster_id: 'cluster-2', confidence_score: 0.6, similarity_score: 0.55, top_entities: [] }
          ],
          next: null
        })
      } as any)

      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['candidates-infinite'], {
        pages: [
          {
            results: [
              { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8, top_entities: [] },
              { cluster_id: 'cluster-2', confidence_score: 0.6, similarity_score: 0.55, top_entities: [] }
            ],
            next: null
          }
        ],
        pageParams: [1]
      })

      render(
        <UserActionDetailPanel currentAction={mockAction as never} />,
        { queryClient }
      )

      await waitFor(() => {
        expect(screen.getByText(/Candidate 1/)).toBeInTheDocument()
        expect(screen.getByText(/Candidate 2/)).toBeInTheDocument()
      })
    })

    it('renders confidence and similarity score tags on candidate items', async () => {
      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['candidates-infinite'], {
        pages: [
          {
            results: [
              { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8, top_entities: [] }
            ],
            next: null
          }
        ],
        pageParams: [1]
      })

      render(
        <UserActionDetailPanel currentAction={mockAction as never} />,
        { queryClient }
      )

      await waitFor(() => {
        expect(screen.getByText('C: 0.85')).toBeInTheDocument()
        expect(screen.getByText('S: 0.80')).toBeInTheDocument()
      })
    })

    it('expands candidate to show ProposedCard with entity details', async () => {
      const queryClient = createTestQueryClient()
      queryClient.setQueryData(['candidates-infinite'], {
        pages: [
          {
            results: [
              {
                cluster_id: 'cluster-1',
                confidence_score: 0.85,
                similarity_score: 0.8,
                top_entities: [
                  {
                    identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
                    parsed_representation: { name: 'Candidate Entity' }
                  }
                ]
              }
            ],
            next: null
          }
        ],
        pageParams: [1]
      })

      render(
        <UserActionDetailPanel currentAction={mockAction as never} />,
        { queryClient }
      )

      await waitFor(() => {
        expect(screen.getByText(/Candidate 1/)).toBeInTheDocument()
      })

      // Expand the candidate collapse
      fireEvent.click(screen.getByText(/Candidate 1/))

      await waitFor(() => {
        expect(screen.getByText(/Entity 1 of 1/)).toBeInTheDocument()
      })
    })
  })
})
