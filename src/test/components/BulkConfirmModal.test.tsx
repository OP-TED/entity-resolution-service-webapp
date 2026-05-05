 

import { BulkConfirmModal } from '@components/BulkConfirmModal'
import { useBulkSelection } from '@context/useBulkSelection'
import { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { fireEvent, render, screen, waitFor } from '../test-utils'

vi.mock('@api/index', () => ({
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey: vi.fn(() => [
    'decisions-infinite'
  ]),
  getProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetQueryKey:
    vi.fn(({ path }: { path: { decision_id: string } }) => [
      'proposed',
      path.decision_id
    ])
}))

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 60_000, staleTime: 60_000 },
      mutations: { retry: false }
    }
  })

const makeDecision = (id: string, name = `Entity ${id}`) => ({
  id,
  about_entity_mention: {
    identified_by: {
      source_id: 's1',
      request_id: id,
      entity_type: 'Person'
    },
    parsed_representation: { name }
  },
  current_placement: {
    cluster_id: 'c1',
    confidence_score: 0.8,
    similarity_score: 0.7
  },
  created_at: new Date().toISOString()
})

const seedDecisions = (
  queryClient: QueryClient,
  decisions: ReturnType<typeof makeDecision>[]
) => {
  queryClient.setQueryData(['decisions-infinite'], {
    pages: [
      {
        results: decisions,
        next_cursor: null,
        count: decisions.length
      }
    ],
    pageParams: [undefined]
  })
}

const PrepareSelection = ({ ids }: { ids: string[] }) => {
  const { enterSelectionMode, selectMany } = useBulkSelection()
  useEffect(() => {
    if (ids.length === 0) return
    enterSelectionMode()
    selectMany(ids)
  }, [ids, enterSelectionMode, selectMany])

  return null
}

describe('BulkConfirmModal', () => {
  it('renders nothing when action is null', () => {
    const { container } = render(
      <BulkConfirmModal
        action={null}
        isPending={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )
    expect(container.querySelector('.ant-modal-root')).toBeNull()
  })

  it('renders the accept title with selected count and entity rows', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice'), makeDecision('d2', 'Bob')])

    render(
      <>
        <PrepareSelection ids={['d1', 'd2']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() =>
      expect(screen.getByText(/Accept 2 decisions/)).toBeInTheDocument()
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    // Footer copy for accept.
    expect(
      screen.getByText(/will confirm 2 proposed matches/i)
    ).toBeInTheDocument()
  })

  it('renders the reject title with the destructive primary button + reject footer', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="reject"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() =>
      expect(screen.getByText(/Reject 1 decision/)).toBeInTheDocument()
    )
    expect(
      screen.getByText(/will reject 1 proposed match/i)
    ).toBeInTheDocument()
  })

  it('uses the proposed-canonical-entity name when available', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])
    queryClient.setQueryData(['proposed', 'd1'], {
      top_entities: [{ parsed_representation: { name: 'Proposed Org' } }]
    })

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() =>
      expect(screen.getByText('Proposed Org')).toBeInTheDocument()
    )
  })

  it('falls back to the cluster id when no proposed entity is cached', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() =>
      expect(screen.getByText(/Cluster c1/)).toBeInTheDocument()
    )
  })

  it('falls back to "Cluster —" when both the proposed name and cluster id are missing', async () => {
    const queryClient = makeClient()
    queryClient.setQueryData(['decisions-infinite'], {
      pages: [
        {
          results: [
            {
              id: 'd-orphan',
              about_entity_mention: {
                identified_by: {
                  source_id: 's1',
                  request_id: 'd-orphan',
                  entity_type: 'Person'
                }
              },
              current_placement: { confidence_score: null }
            }
          ],
          next_cursor: null,
          count: 1
        }
      ],
      pageParams: [undefined]
    })

    render(
      <>
        <PrepareSelection ids={['d-orphan']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() =>
      expect(screen.getByText(/Cluster —/)).toBeInTheDocument()
    )
    // confidence is null → renders N/A in the tag.
    expect(screen.getByText(/C: N\/A/)).toBeInTheDocument()
  })

  it('omits the similarity tag when similarity_score is null', async () => {
    const queryClient = makeClient()
    queryClient.setQueryData(['decisions-infinite'], {
      pages: [
        {
          results: [
            {
              ...makeDecision('d1', 'Alice'),
              current_placement: {
                cluster_id: 'c1',
                confidence_score: 0.5,
                similarity_score: null
              }
            }
          ],
          next_cursor: null,
          count: 1
        }
      ],
      pageParams: [undefined]
    })

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
    expect(screen.queryByText(/^S:/)).not.toBeInTheDocument()
  })

  it('clicking Cancel triggers onCancel', async () => {
    const onCancel = vi.fn()
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={onCancel}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/ }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('clicking the confirm button triggers onConfirm', async () => {
    const onConfirm = vi.fn()
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={vi.fn()}
          onConfirm={onConfirm}
        />
      </>,
      { queryClient }
    )

    await waitFor(() =>
      expect(screen.getByText(/Accept 1 decision/)).toBeInTheDocument()
    )
    // Two "Accept 1" candidates exist — pick the primary footer button (last by insertion).
    const buttons = screen.getAllByRole('button', { name: /Accept 1/i })
    fireEvent.click(buttons[buttons.length - 1])
    expect(onConfirm).toHaveBeenCalled()
  })

  it('removing the last selected row triggers onCancel via the empty-selection effect', async () => {
    const onCancel = vi.fn()
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={false}
          onCancel={onCancel}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())

    // Click the per-row remove (CloseOutlined) button.
    fireEvent.click(
      screen.getByRole('button', { name: /Remove Alice from batch/i })
    )

    await waitFor(() => expect(onCancel).toHaveBeenCalled())
  })

  it('disables the confirm button while a request is pending', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, [makeDecision('d1', 'Alice')])

    render(
      <>
        <PrepareSelection ids={['d1']} />
        <BulkConfirmModal
          action="accept"
          isPending={true}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </>,
      { queryClient }
    )

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())

    // Cancel button is disabled while pending.
    expect(screen.getByRole('button', { name: /^Cancel$/ })).toBeDisabled()
    // Per-row remove button is disabled.
    expect(
      screen.getByRole('button', { name: /Remove Alice from batch/i })
    ).toBeDisabled()
  })
})
