import {
  bulkAcceptDecisionsApiV1CurationDecisionsBulkAcceptPostMutation,
  bulkRejectDecisionsApiV1CurationDecisionsBulkRejectPostMutation,
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey
} from '@api/index'
import {
  type BulkActionResponse,
  type BulkItemResult,
  type DecisionSummary,
  BulkItemStatus
} from '@api/types.gen'
import { useBulkSelection } from '@context/useBulkSelection'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getEntityDisplayName, showApiErrors } from '@utils'

import { App } from 'antd'
import { useState } from 'react'

import { useEntityTypeDescriptors } from './useEntityTypeDescriptors'
import { useRemoveDecisionFromCache } from './useRemoveDecisionFromCache'

export type BulkAction = 'accept' | 'reject'

const ACTION_LABEL: Record<BulkAction, { verb: string; past: string }> = {
  accept: { verb: 'Accept', past: 'accepted' },
  reject: { verb: 'Reject', past: 'rejected' }
}

const STATUS_LABEL: Record<BulkItemStatus, string> = {
  [BulkItemStatus.SUCCESS]: 'Success',
  [BulkItemStatus.NOT_FOUND]: 'Not found',
  [BulkItemStatus.ALREADY_CURATED]: 'Already curated',
  [BulkItemStatus.ERROR]: 'Error'
}

const getSummarizedResults = (results: BulkItemResult[]) => {
  const successIds: string[] = []
  const skipped: BulkItemResult[] = []
  const errored: BulkItemResult[] = []
  for (const r of results) {
    if (r.status === BulkItemStatus.SUCCESS) successIds.push(r.decision_id)
    else if (r.status === BulkItemStatus.ERROR) errored.push(r)
    else skipped.push(r)
  }

  return { successIds, skipped, errored }
}

const pluralize = (count: number) => (count === 1 ? '' : 's')

const STATUS_TITLE_BUILDERS: Record<
  BulkItemStatus,
  (action: BulkAction, count: number) => string
> = {
  [BulkItemStatus.SUCCESS]: (action, count) =>
    `${count} decision${pluralize(count)} ${ACTION_LABEL[action].past}`,
  [BulkItemStatus.ALREADY_CURATED]: (_action, count) =>
    `${count} decision${pluralize(count)} already curated`,
  [BulkItemStatus.NOT_FOUND]: (_action, count) =>
    `${count} decision${pluralize(count)} not found`,
  [BulkItemStatus.ERROR]: (action, count) =>
    `Bulk ${action} failed for ${count} decision${pluralize(count)}`
}

const buildResultTitle = (
  action: BulkAction,
  results: BulkItemResult[]
): string => {
  const statuses = new Set(results.map((r) => r.status))
  if (statuses.size !== 1) {
    return `Bulk ${action} completed with mixed results`
  }

  const [onlyStatus] = statuses
  const build = STATUS_TITLE_BUILDERS[onlyStatus]

  return build
    ? build(action, results.length)
    : `Bulk ${action} completed`
}

const renderResultBreakdown = (
  results: BulkItemResult[],
  snapshot: Map<string, DecisionSummary>,
  descriptors: Record<string, string>
): React.ReactNode => {
  const buckets = new Map<BulkItemStatus, BulkItemResult[]>()
  for (const r of results) {
    const list = buckets.get(r.status) ?? []
    list.push(r)
    buckets.set(r.status, list)
  }

  return (
    <div>
      {[...buckets.entries()].map(([status, items]) => (
        <div key={status} style={{ marginBottom: 12 }}>
          <strong>
            {STATUS_LABEL[status]} ({items.length})
          </strong>
          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
            {items.map((it) => {
              const label =
                getEntityDisplayName(
                  snapshot.get(it.decision_id)?.about_entity_mention,
                  descriptors
                ) ?? it.decision_id
              const suffix =
                status !== BulkItemStatus.SUCCESS && it.detail
                  ? ` — ${it.detail}`
                  : ''

              return (
                <li
                  key={it.decision_id}
                  style={{
                    fontSize: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                  {suffix}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

type DecisionsInfiniteCache = {
  pages: Array<{ results?: Array<DecisionSummary> }>
}

export const useBulkDecisionActions = () => {
  const { notification, modal } = App.useApp()
  const queryClient = useQueryClient()
  const removeDecisionFromCache = useRemoveDecisionFromCache()
  const { selectedIds, removeIds, exitSelectionMode } = useBulkSelection()
  const descriptors = useEntityTypeDescriptors()
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null)

  const bulkAccept = useMutation(
    bulkAcceptDecisionsApiV1CurationDecisionsBulkAcceptPostMutation()
  )
  const bulkReject = useMutation(
    bulkRejectDecisionsApiV1CurationDecisionsBulkRejectPostMutation()
  )

  const isPending = bulkAccept.isPending || bulkReject.isPending

  const snapshotDecisionsByIds = (
    ids: string[]
  ): Map<string, DecisionSummary> => {
    const wanted = new Set(ids)
    const out = new Map<string, DecisionSummary>()
    const cached = queryClient.getQueriesData<DecisionsInfiniteCache>({
      queryKey: listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey()
    })
    for (const [, data] of cached) {
      if (!data?.pages) continue
      for (const page of data.pages) {
        for (const d of page.results ?? []) {
          if (d?.id && wanted.has(d.id)) out.set(d.id, d)
        }
      }
    }

    return out
  }

  const onResponse = (
    action: BulkAction,
    response: BulkActionResponse,
    snapshot: Map<string, DecisionSummary>
  ) => {
    const { successIds } = getSummarizedResults(response.results)

    if (successIds.length > 0) {
      removeDecisionFromCache(successIds)
      removeIds(successIds)
    }

    modal.info({
      title: buildResultTitle(action, response.results),
      width: 520,
      content: renderResultBreakdown(response.results, snapshot, descriptors),
      okText: 'Close',
      onOk: exitSelectionMode
    })
  }

  const onOpenConfirm = (action: BulkAction) => {
    if (selectedIds.size === 0) return
    setPendingAction(action)
  }

  const onCancelConfirm = () => {
    if (isPending) return
    setPendingAction(null)
  }

  const onConfirm = () => {
    if (!pendingAction) return
    const ids = [...selectedIds]
    if (ids.length === 0) {
      setPendingAction(null)

      return
    }
    const mutation = pendingAction === 'accept' ? bulkAccept : bulkReject
    // Snapshot now, before the mutation: successful decisions get pruned from
    // the cache during onResponse, so display data must be captured up-
    // front to render the per-item result breakdown.
    const snapshot = snapshotDecisionsByIds(ids)
    const action = pendingAction

    mutation.mutate(
      { body: { decision_ids: ids } },
      {
        onSuccess: (data) => {
          setPendingAction(null)
          onResponse(action, data, snapshot)
        },
        onError: (error) => {
          showApiErrors(error, (message) => notification.error({ message }))
        }
      }
    )
  }

  return {
    pendingAction,
    isPending,
    bulkAccept: () => onOpenConfirm('accept'),
    bulkReject: () => onOpenConfirm('reject'),
    cancelConfirm: onCancelConfirm,
    confirm: onConfirm
  }
}
