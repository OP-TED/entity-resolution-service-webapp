import {
  assignDecisionApiV1CurationDecisionsDecisionIdAssignPostMutation,
  getAlternativeCanonicalEntitiesApiV1CurationDecisionsDecisionIdAlternativeCanonicalEntitiesGetInfiniteOptions
} from '@api/index'
import { ProposedCard, Text } from '@components'
import { useConfirmationPreference } from '@context/useConfirmationPreference'
import { useDecisionsLoadingState } from '@hooks/useDecisionsLoadingState'
import { useRemoveDecisionFromCache } from '@hooks/useRemoveDecisionFromCache'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { getConfidenceStatus, getSimilarityStatus, showApiErrors } from '@utils'
import { App, Button, Checkbox, Collapse, Flex, Popconfirm, Tag, Tooltip } from 'antd'
import { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  currentDecision?: DecisionSummary
}

export const AlternativeClusters = ({ currentDecision }: Props) => {
  const isDecisionsMenuLoading = useDecisionsLoadingState()
  const { shouldSkip, setActionSkip } = useConfirmationPreference()
  const skipAssign = shouldSkip('assign')
  const [dontShowAssign, setDontShowAssign] = useState(false)
  const { notification } = App.useApp()
  const removeDecisionFromCache = useRemoveDecisionFromCache()

  const currentDecisionId = currentDecision?.id

  const [currentEntityIndices, setCurrentEntityIndices] = useState<
    Record<number, number>
  >({})

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      ...getAlternativeCanonicalEntitiesApiV1CurationDecisionsDecisionIdAlternativeCanonicalEntitiesGetInfiniteOptions(
        {
          path: { decision_id: String(currentDecisionId) },
          query: {
            per_page: 1
          }
        }
      ),
      getNextPageParam: (lastPage) => lastPage?.next ?? undefined,
      initialPageParam: 1,
      enabled: !!currentDecisionId
    })

  const allClusters = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data]
  )

  const { mutate } = useMutation({
    ...assignDecisionApiV1CurationDecisionsDecisionIdAssignPostMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: (_, variables) => {
      removeDecisionFromCache(variables.path.decision_id)
      notification.success({ message: 'Cluster assigned successfully' })
    }
  })

  const isLoadingContent =
    isFetchingNextPage || isDecisionsMenuLoading || isLoading

  const onConfirmSwitchCluster = (clusterIdentifier: string) => {
    if (!clusterIdentifier || !currentDecisionId) return

    mutate({
      path: {
        decision_id: String(currentDecisionId)
      },
      body: {
        cluster_id: clusterIdentifier
      }
    })
  }

  const onClickPreviousEntity = (clusterIndex: number) => {
    setCurrentEntityIndices((prev) => ({
      ...prev,
      [clusterIndex]: Math.max(1, (prev[clusterIndex] || 1) - 1)
    }))
  }

  const onClickNextEntity = (clusterIndex: number, maxEntities: number) => {
    setCurrentEntityIndices((prev) => ({
      ...prev,
      [clusterIndex]: Math.min(maxEntities, (prev[clusterIndex] || 1) + 1)
    }))
  }

  return (
    <Flex vertical gap={16}>
      {allClusters?.map((cluster, index) => (
        <Collapse
          size="large"
          key={index}
          items={[
            {
              key: cluster?.cluster_id,
              label: (
                <Flex gap={8} align="center" justify="space-between">
                  <Text size={16} weight={500}>
                    Compare with {index === 0 ? '2nd' : `${index + 2}nd`} best
                    cluster
                  </Text>
                  <Flex gap={8}>
                    <Tooltip title="Confidence">
                      <Tag
                        variant="solid"
                        color={getConfidenceStatus(cluster.confidence_score)}
                      >
                        <Text size={12} color="colorWhite">
                          C: {cluster.confidence_score?.toFixed(2)}
                        </Text>
                      </Tag>
                    </Tooltip>

                    {cluster?.similarity_score !== undefined && (
                      <Tooltip title="Similarity">
                        <Tag
                          variant="solid"
                          color={getSimilarityStatus(cluster?.similarity_score)}
                        >
                          <Text size={12} color="colorWhite">
                            S: {cluster?.similarity_score?.toFixed(2)}
                          </Text>
                        </Tag>
                      </Tooltip>
                    )}
                  </Flex>
                </Flex>
              ),
              children: (
                <Flex vertical gap={8}>
                  <ProposedCard
                    currentEntity={currentEntityIndices[index] || 1}
                    data={cluster}
                    isLoading={isLoading}
                    onPrevious={() => onClickPreviousEntity(index)}
                    onNext={() =>
                      onClickNextEntity(
                        index,
                        cluster.top_entities?.length || 1
                      )
                    }
                    title="Alternative Match"
                    isAlternative={true}
                  />

                  <Flex>
                    <Popconfirm
                      disabled={skipAssign}
                      trigger="click"
                      title="This will assign the current entity to the alternative cluster instead of the proposed match. The system will learn from this decision to improve future matching."
                      description={
                        <Checkbox
                          checked={dontShowAssign}
                          onChange={(e) =>
                            setDontShowAssign(e.target.checked)
                          }
                        >
                          Don't show again
                        </Checkbox>
                      }
                      onConfirm={() => {
                        if (dontShowAssign) setActionSkip('assign', true)
                        onConfirmSwitchCluster(cluster.cluster_id)
                      }}
                      onCancel={() => {
                        if (dontShowAssign) setActionSkip('assign', true)
                      }}
                      onOpenChange={(open) => {
                        if (open) setDontShowAssign(false)
                      }}
                      placement="topRight"
                    >
                      <Tooltip
                        title="You can assign only decisions that are pending manual review."
                        trigger="contextMenu"
                      >
                        <Button
                          variant="solid"
                          color="orange"
                          onClick={
                            skipAssign
                              ? () =>
                                  onConfirmSwitchCluster(cluster.cluster_id)
                              : undefined
                          }
                        >
                          Use this cluster instead
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </Flex>
                </Flex>
              )
            }
          ]}
        />
      ))}

      {isLoadingContent && <Skeleton count={1} height={60} width="100%" />}

      <Button
        variant="solid"
        color="primary"
        onClick={() => fetchNextPage()}
        loading={isLoadingContent}
        disabled={!hasNextPage}
      >
        Load More
      </Button>
    </Flex>
  )
}
