/* eslint-disable @typescript-eslint/no-explicit-any */

import { useBulkSelection } from '@context/useBulkSelection'
import { useBulkDecisionActions } from '@hooks/useBulkDecisionActions'
import { QueryClient } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'


import { renderHook, screen } from '../test-utils'

// The shared test client uses gcTime: 0, which collects data without observers
// the moment we await — that breaks tests that read seeded cache state after
// async work. Use a local client with a non-zero gcTime here.
const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 60_000, staleTime: 60_000 },
      mutations: { retry: false }
    }
  })

// Antd's imperative modal.info / notification.error portal to document.body.
// They are scoped to an App instance, so the same title text can appear from
// prior tests' lingering portals — assert against `getAllByText` so the match
// stays robust regardless.
const expectVisible = (text: RegExp | string) => {
  expect(screen.getAllByText(text).length).toBeGreaterThan(0)
}

const acceptMutationFn = vi.fn()
const rejectMutationFn = vi.fn()

vi.mock('@api/index', () => ({
  bulkAcceptDecisionsApiV1CurationDecisionsBulkAcceptPostMutation: vi.fn(
    () => ({ mutationFn: acceptMutationFn })
  ),
  bulkRejectDecisionsApiV1CurationDecisionsBulkRejectPostMutation: vi.fn(
    () => ({ mutationFn: rejectMutationFn })
  ),
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey: vi.fn(() => [
    'decisions-infinite'
  ]),
  getStatisticsApiV1CurationStatsGetQueryKey: vi.fn(() => ['stats'])
}))

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
  ids: string[]
) => {
  queryClient.setQueryData(['decisions-infinite'], {
    pages: [
      {
        results: ids.map((id) => makeDecision(id)),
        next_cursor: null,
        count: ids.length
      }
    ],
    pageParams: [undefined]
  })
}

const useHarness = () => {
  const selection = useBulkSelection()
  const actions = useBulkDecisionActions()

  return { selection, actions }
}

beforeEach(() => {
  acceptMutationFn.mockReset()
  rejectMutationFn.mockReset()
})

describe('useBulkDecisionActions', () => {
  it('opens the confirm modal with pendingAction=accept on bulkAccept', () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1', 'd2'])

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1', 'd2']))
    act(() => result.current.actions.bulkAccept())

    expect(result.current.actions.pendingAction).toBe('accept')
    expect(result.current.actions.isPending).toBe(false)
  })

  it('opens the confirm modal with pendingAction=reject on bulkReject', () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkReject())

    expect(result.current.actions.pendingAction).toBe('reject')
  })

  it('does nothing when bulkAccept is called with no selection', () => {
    const { result } = renderHook(() => useHarness())

    act(() => result.current.actions.bulkAccept())

    expect(result.current.actions.pendingAction).toBeNull()
  })

  it('cancelConfirm clears pendingAction', () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkAccept())
    expect(result.current.actions.pendingAction).toBe('accept')

    act(() => result.current.actions.cancelConfirm())
    expect(result.current.actions.pendingAction).toBeNull()
  })

  it('confirm with empty selection just clears pendingAction', () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.selection.clear())
    act(() => result.current.actions.confirm())

    expect(result.current.actions.pendingAction).toBeNull()
    expect(acceptMutationFn).not.toHaveBeenCalled()
  })

  it('confirm without a pending action is a no-op', () => {
    const { result } = renderHook(() => useHarness())

    act(() => result.current.actions.confirm())

    expect(acceptMutationFn).not.toHaveBeenCalled()
    expect(rejectMutationFn).not.toHaveBeenCalled()
  })

  it('confirm sends selected ids to the accept mutation', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1', 'd2'])
    acceptMutationFn.mockResolvedValue({
      results: [
        { decision_id: 'd1', status: 'success' },
        { decision_id: 'd2', status: 'success' }
      ]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1', 'd2']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.actions.confirm())

    await waitFor(() => {
      expect(acceptMutationFn).toHaveBeenCalledTimes(1)
    })
    expect(acceptMutationFn).toHaveBeenCalledWith(
      expect.objectContaining({ body: { decision_ids: ['d1', 'd2'] } }),
      expect.anything()
    )
  })

  it('confirm sends selected ids to the reject mutation', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])
    rejectMutationFn.mockResolvedValue({
      results: [{ decision_id: 'd1', status: 'success' }]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkReject())
    act(() => result.current.actions.confirm())

    await waitFor(() => {
      expect(rejectMutationFn).toHaveBeenCalledTimes(1)
    })
  })

  it('on all-success response: shows result modal, prunes cache, deselects', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1', 'd2', 'd3'])
    acceptMutationFn.mockResolvedValue({
      results: [
        { decision_id: 'd1', status: 'success' },
        { decision_id: 'd2', status: 'success' }
      ]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1', 'd2']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.actions.confirm())

    await waitFor(() => expectVisible(/2 decisions accepted/i))

    expect(result.current.actions.pendingAction).toBeNull()
    expect(result.current.selection.selectedCount).toBe(0)

    const [, cached] = queryClient.getQueriesData<any>({
      queryKey: ['decisions-infinite']
    })[0]
    expect(cached.pages[0].results.map((d: any) => d.id)).toEqual(['d3'])
  })

  it('on mixed-status response: shows the mixed-results title, only prunes successful ids', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1', 'd2', 'd3'])
    acceptMutationFn.mockResolvedValue({
      results: [
        { decision_id: 'd1', status: 'success' },
        { decision_id: 'd2', status: 'error', detail: 'boom' },
        { decision_id: 'd3', status: 'not_found' }
      ]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1', 'd2', 'd3']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.actions.confirm())

    await waitFor(() =>
      expectVisible(/Bulk accept completed with mixed results/i)
    )

    // Only the successful id was pruned from the cache.
    const [, cached] = queryClient.getQueriesData<any>({
      queryKey: ['decisions-infinite']
    })[0]
    expect(cached.pages[0].results.map((d: any) => d.id)).toEqual(['d2', 'd3'])

    // Remaining ids stay selected so they can be retried/inspected.
    expect(result.current.selection.isSelected('d2')).toBe(true)
    expect(result.current.selection.isSelected('d3')).toBe(true)

    // The error-detail suffix is rendered.
    expectVisible(/boom/)
  })

  it('renders the not_found-only title', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1', 'd2'])
    acceptMutationFn.mockResolvedValue({
      results: [
        { decision_id: 'd1', status: 'not_found' },
        { decision_id: 'd2', status: 'not_found' }
      ]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1', 'd2']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.actions.confirm())

    await waitFor(() => expectVisible(/2 decisions not found/i))
  })

  it('renders the already-curated-only title', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])
    rejectMutationFn.mockResolvedValue({
      results: [{ decision_id: 'd1', status: 'already_curated' }]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkReject())
    act(() => result.current.actions.confirm())

    await waitFor(() => expectVisible(/1 decision already curated/i))
  })

  it('renders the error-only title with action verb', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])
    rejectMutationFn.mockResolvedValue({
      results: [{ decision_id: 'd1', status: 'error', detail: 'nope' }]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkReject())
    act(() => result.current.actions.confirm())

    await waitFor(() => expectVisible(/Bulk reject failed for 1 decision/i))
  })

  it('falls back to the decision id label when the entity has no name', async () => {
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
              current_placement: { cluster_id: 'c', confidence_score: null }
            }
          ],
          next_cursor: null,
          count: 1
        }
      ],
      pageParams: [undefined]
    })
    acceptMutationFn.mockResolvedValue({
      results: [{ decision_id: 'd-orphan', status: 'success' }]
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d-orphan']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.actions.confirm())

    // The label resolved from request_id (no parsed_representation.name) is rendered.
    await waitFor(() => expectVisible('d-orphan'))
  })

  it('shows a notification on mutation error', async () => {
    const queryClient = makeClient()
    seedDecisions(queryClient, ['d1'])
    acceptMutationFn.mockRejectedValue({
      response: { data: { detail: 'server exploded' } }
    })

    const { result } = renderHook(() => useHarness(), { queryClient })

    act(() => result.current.selection.selectMany(['d1']))
    act(() => result.current.actions.bulkAccept())
    act(() => result.current.actions.confirm())

    await waitFor(() => expectVisible(/server exploded/i))
  })
})
