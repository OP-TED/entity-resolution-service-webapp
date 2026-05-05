import { CloseOutlined, RightOutlined } from '@ant-design/icons'

import {
  getProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetQueryKey,
  listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey
} from '@api/index'
import {
  type DecisionSummary,
  type GetProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetResponse
} from '@api/types.gen'
import { Text } from '@components'
import { useBulkSelection } from '@context/useBulkSelection'
import { useEntityTypeDescriptors } from '@hooks'
import { useQueryClient } from '@tanstack/react-query'
import {
  getConfidenceStatus,
  getDisplayNameFromParsed,
  getEntityDisplayName,
  getSimilarityStatus
} from '@utils'

import { Button, Empty, Flex, Modal, Tag, Tooltip } from 'antd'
import { useEffect, useMemo } from 'react'

import { useStyles } from './styles'

import type { BulkAction } from '@hooks'

type Props = {
  action: BulkAction | null
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

type DecisionsInfiniteCache = {
  pages: Array<{ results?: Array<DecisionSummary> }>
}

type ProposedResponse =
  GetProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetResponse

const ACTION_META: Record<BulkAction, { verb: string; danger: boolean }> = {
  accept: { verb: 'Accept', danger: false },
  reject: { verb: 'Reject', danger: true }
}

export const BulkConfirmModal = ({
  action,
  isPending,
  onCancel,
  onConfirm
}: Props) => {
  const { styles } = useStyles()
  const queryClient = useQueryClient()
  const { selectedIds, removeIds } = useBulkSelection()
  const descriptors = useEntityTypeDescriptors()
  const open = action !== null

  // Snapshot decisions from the cache so the row list renders even if the
  // cache page boundaries shift mid-modal (e.g. background refetch).
  const decisionsById = useMemo(() => {
    const map = new Map<string, DecisionSummary>()
    if (!open) return map
    const cached = queryClient.getQueriesData<DecisionsInfiniteCache>({
      queryKey: listDecisionsApiV1CurationDecisionsGetInfiniteQueryKey()
    })
    for (const [, data] of cached) {
      if (!data?.pages) continue
      for (const page of data.pages) {
        for (const d of page.results ?? []) {
          if (d?.id && selectedIds.has(d.id)) map.set(d.id, d)
        }
      }
    }

    return map
  }, [open, selectedIds, queryClient])

  const items = useMemo(
    () =>
      [...selectedIds]
        .map((id) => decisionsById.get(id))
        .filter((d): d is DecisionSummary => Boolean(d)),
    [selectedIds, decisionsById]
  )

  useEffect(() => {
    if (open && selectedIds.size === 0) onCancel()
  }, [open, selectedIds.size, onCancel])

  if (!action) return null
  const { verb, danger } = ACTION_META[action]
  const count = items.length

  const getProposedName = (decision: DecisionSummary) => {
    const data = queryClient.getQueryData<ProposedResponse>(
      getProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetQueryKey(
        { path: { decision_id: decision.id } }
      )
    )
    const entity = data?.top_entities?.[0]

    return getDisplayNameFromParsed(
      entity?.parsed_representation as Record<string, unknown> | null | undefined,
      decision.about_entity_mention?.identified_by?.entity_type,
      descriptors
    )
  }

  return (
    <Modal
      open={open}
      title={`${verb} ${count} decision${count === 1 ? '' : 's'}`}
      onCancel={onCancel}
      width={640}
      maskClosable={!isPending}
      closable={!isPending}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger={danger}
          loading={isPending}
          disabled={count === 0}
          onClick={onConfirm}
        >
          {verb} {count}
        </Button>
      ]}
    >
      {count === 0 ? (
        <Empty description="No decisions selected" />
      ) : (
        <>
          <div className={styles.list}>
            {items.map((d) => {
              const entityName =
                getEntityDisplayName(d.about_entity_mention, descriptors) ?? d.id
              const proposedName = getProposedName(d)
              const clusterId = (
                d.current_placement as { cluster_id?: string } | null
              )?.cluster_id
              const confidence = d.current_placement?.confidence_score
              const similarity = d.current_placement?.similarity_score

              return (
                <Flex key={d.id} gap={8} align="center" className={styles.row}>
                  <Button
                    size="small"
                    type="text"
                    icon={<CloseOutlined />}
                    aria-label={`Remove ${entityName} from batch`}
                    disabled={isPending}
                    onClick={() => removeIds([d.id])}
                  />

                  <Flex flex={1} align="center" gap={6} style={{ minWidth: 0 }}>
                    <Text isEllipsis weight={600} size={13}>
                      {entityName}
                    </Text>
                    <RightOutlined className={styles.arrow} />
                    <Text
                      isEllipsis
                      size={13}
                      color={proposedName ? undefined : 'colorTextSecondary'}
                    >
                      {proposedName ?? `Cluster ${clusterId ?? '—'}`}
                    </Text>
                  </Flex>

                  <Flex gap={4} align="center" className={styles.tags}>
                    <Tooltip title="Confidence">
                      <Tag
                        variant="solid"
                        color={getConfidenceStatus(confidence)}
                      >
                        <Text size={11} color="colorWhite">
                          C:{' '}
                          {confidence === null ? 'N/A' : confidence.toFixed(2)}
                        </Text>
                      </Tag>
                    </Tooltip>
                    {similarity != null && (
                      <Tooltip title="Similarity">
                        <Tag
                          variant="solid"
                          color={getSimilarityStatus(similarity)}
                        >
                          <Text size={11} color="colorWhite">
                            S: {similarity.toFixed(2)}
                          </Text>
                        </Tag>
                      </Tooltip>
                    )}
                  </Flex>
                </Flex>
              )
            })}
          </div>

          <div className={styles.footnote}>
            {action === 'accept'
              ? `This will confirm ${count} proposed match${count === 1 ? '' : 'es'}. The system will learn from these decisions to improve future matching.`
              : `This will reject ${count} proposed match${count === 1 ? '' : 'es'} and create new clusters for the affected entities. The system will learn from these decisions.`}
          </div>
        </>
      )}
    </Modal>
  )
}
