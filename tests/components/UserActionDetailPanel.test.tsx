import { describe, expect, it, vi } from 'vitest'

import { UserActionDetailPanel } from '../../src/components/UserActionDetailPanel'
import { createTestQueryClient, render, screen, waitFor } from '../test-utils'

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
    id: 1,
    email: 'admin@ers.local',
  },
  created_at: new Date(Date.now() - 60_000).toISOString()
}

const mockSelectedCluster = {
  cluster_id: 'cluster-1',
  confidence_score: 0.85,
  similarity_score: 0.8,
  top_entities: [
    {
      identified_by: { source_id: 's1', request_id: 'e1', entity_type: 'Person' },
      parsed_representation: { name: 'Alice Corp', city: 'Paris' }
    }
  ]
}

describe('UserActionDetailPanel', () => {
  it('renders empty state when no action is provided', () => {
    render(<UserActionDetailPanel />)
    expect(screen.getByText('No Action Selected')).toBeInTheDocument()
  })

  it('renders section element', () => {
    render(<UserActionDetailPanel />)
    expect(document.querySelector('section')).toBeTruthy()
  })

  it('renders entity display name', () => {
    render(<UserActionDetailPanel currentAction={mockAction as never} />)
    expect(screen.getAllByText('Alice Corp').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Accept Top action type tag', () => {
    render(<UserActionDetailPanel currentAction={mockAction as never} />)
    expect(screen.getByText('Accept Top')).toBeInTheDocument()
  })

  it('renders Accept Alternative action type tag', () => {
    render(
      <UserActionDetailPanel
        currentAction={{ ...mockAction, action_type: 'ACCEPT_ALTERNATIVE' } as never}
      />
    )
    expect(screen.getByText('Accept Alternative')).toBeInTheDocument()
  })

  it('renders Reject All action type tag', () => {
    render(
      <UserActionDetailPanel
        currentAction={{ ...mockAction, action_type: 'REJECT_ALL' } as never}
      />
    )
    expect(screen.getByText('Reject All')).toBeInTheDocument()
  })

  it('renders actor name', () => {
    render(<UserActionDetailPanel currentAction={mockAction as never} />)
    expect(screen.getByText(/admin@ers\.local/)).toBeInTheDocument()
  })

  it('renders time ago', () => {
    render(<UserActionDetailPanel currentAction={mockAction as never} />)
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('renders entity mention card', () => {
    render(<UserActionDetailPanel currentAction={mockAction as never} />)
    expect(screen.getByText('Current Entity')).toBeInTheDocument()
  })

  it('renders Candidates heading', () => {
    render(<UserActionDetailPanel currentAction={mockAction as never} />)
    expect(screen.getByText('Candidates')).toBeInTheDocument()
  })

  it('shows "No candidates available" when candidates list is empty in cache', async () => {
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

  it('shows selected cluster ProposedCard when data is in cache for ACCEPT_TOP', async () => {
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

  it('does not query selected cluster for REJECT_ALL and shows fallback card', async () => {
    const {
      getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions
    } = await import('../../src/api/@tanstack/react-query.gen')

    render(
      <UserActionDetailPanel
        currentAction={{ ...mockAction, action_type: 'REJECT_ALL', selected_cluster: null } as never}
      />
    )

    // The query should not be called for REJECT_ALL (enabled: false)
    expect(
      vi.mocked(getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions)
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true })
    )

    expect(screen.getByText('No Cluster Selected')).toBeInTheDocument()
    expect(
      screen.getByText(/All candidates were rejected/)
    ).toBeInTheDocument()
  })

  it('renders candidate collapse items from cache', async () => {
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

  it('falls back to request_id as display name when parsed_representation has no name', () => {
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
})
