import {
  getCandidatesApiV1UserActionsActionIdCandidatesGetInfiniteOptions,
  getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions
} from '@api/index'
import { EntityCard, ProposedCard, SkeletonWrapper, Text } from '@components'
import { useEntityTypeDescriptors } from '@hooks'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  actionTypeColor,
  actionTypeLabel,
  formatTimeAgo,
  getConfidenceStatus,
  getEntityDisplayName,
  getSimilarityStatus
} from '@utils'
import { Card, Col, Collapse, Flex, Row, Tag } from 'antd'
import { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { useStyles } from './styles'

import type { UserActionSummary,  } from '@api/types.gen'

type Props = {
  currentAction?: UserActionSummary
}

export const UserActionDetailPanel = ({ currentAction }: Props) => {
  const { styles } = useStyles()
  const [selectedClusterEntity, setSelectedClusterEntity] = useState(1)
  const [candidateEntityIndices, setCandidateEntityIndices] = useState<
    Record<number, number>
  >({})
  const descriptors = useEntityTypeDescriptors()

  const actionId = currentAction?.id

  const { data: selectedClusterData, isLoading: isSelectedClusterLoading } =
    useQuery({
      ...getSelectedClusterApiV1UserActionsActionIdSelectedClusterGetOptions({
        path: { action_id: String(actionId) }
      }),
      enabled: !!actionId && currentAction?.action_type !== 'REJECT_ALL'
    })

  const {
    data: candidatesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCandidatesLoading
  } = useInfiniteQuery({
    ...getCandidatesApiV1UserActionsActionIdCandidatesGetInfiniteOptions({
      path: { action_id: String(actionId) },
      query: { per_page: 3 }
    }),
    getNextPageParam: (lastPage) => lastPage?.next ?? undefined,
    initialPageParam: 1,
    enabled: !!actionId
  })

  const allCandidates = useMemo(
    () => candidatesData?.pages.flatMap((page) => page.results) ?? [],
    [candidatesData]
  )

  useMemo(() => {
    setSelectedClusterEntity(1)
    setCandidateEntityIndices({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionId])

  if (!currentAction) {
    return (
      <section className={styles.detailPanel}>
        <Flex
          vertical
          gap={24}
          align="center"
          justify="center"
          className="h-100vh"
        >
          <Flex vertical gap={12} align="center">
            <Text size={24} weight={600} color="colorTextSecondary">
              No Action Selected
            </Text>
            <Text size={14} color="colorTextSecondary">
              Select an action from the list on the left to see its details.
            </Text>
          </Flex>
        </Flex>
      </section>
    )
  }

  const entityData = currentAction.about_entity_mention?.parsed_representation
  const entityDisplayName = getEntityDisplayName(
    currentAction.about_entity_mention,
    descriptors
  )

  return (
    <section className={styles.detailPanel}>
      <Flex vertical gap={16}>
        <Flex gap={12} align="center" justify="space-between">
          <Text isEllipsis size={32} weight={600}>
            {entityDisplayName}
          </Text>

          <Flex gap={8} align="center">
            <Tag color={actionTypeColor[currentAction.action_type]}>
              {actionTypeLabel[currentAction.action_type]}
            </Tag>

            <Text size={13} color="colorTextSecondary">
              by {currentAction?.actor?.email ?? 'Unknown User'}
            </Text>

            <Text size={13} color="colorTextSecondary">
              {formatTimeAgo(currentAction.created_at)}
            </Text>
          </Flex>
        </Flex>

        <Row gutter={32}>
          <Col xs={24} lg={12}>
            <EntityCard entityData={entityData} />
          </Col>

          <Col xs={24} lg={12}>
            <SkeletonWrapper
              isLoading={isSelectedClusterLoading}
              count={1}
              height={400}
              width="100%"
            >
              {selectedClusterData ? (
                <ProposedCard
                  currentEntity={selectedClusterEntity}
                  data={selectedClusterData}
                  referenceEntityData={entityData}
                  isLoading={isSelectedClusterLoading}
                  title="Selected Cluster"
                  onPrevious={() =>
                    setSelectedClusterEntity((p) => Math.max(1, p - 1))
                  }
                  onNext={() =>
                    setSelectedClusterEntity((p) =>
                      Math.min(
                        selectedClusterData.top_entities?.length ?? 1,
                        p + 1
                      )
                    )
                  }
                />
              ) : (
                <Card
                  className={styles.card}
                  title={<Text weight={600}>No Cluster Selected</Text>}
                >
                  <Text color="colorTextSecondary">
                    All candidates were rejected. A new cluster will be created.
                  </Text>
                </Card>
              )}
            </SkeletonWrapper>
          </Col>
        </Row>

        <Flex vertical gap={8}>
          <Text weight={600} size={16}>
            Candidates
          </Text>

          {allCandidates?.length > 0
            ? allCandidates?.map((cluster, index) => (
                <Collapse
                  size="large"
                  key={cluster.cluster_id}
                  items={[
                    {
                      key: cluster.cluster_id,
                      label: (
                        <Flex gap={8} align="center" justify="space-between">
                          <Flex gap={8} align="center">
                            <Text size={16} weight={500}>
                              Candidate {index + 1} ({cluster?.cluster_id})
                            </Text>
                          </Flex>
                          <Flex gap={8}>
                            <Tag
                              variant="solid"
                              color={getConfidenceStatus(
                                cluster.confidence_score
                              )}
                            >
                              <Text size={12} color="colorWhite">
                                C: {cluster.confidence_score?.toFixed(2)}
                              </Text>
                            </Tag>
                            {cluster.similarity_score !== undefined && (
                              <Tag
                                variant="solid"
                                color={getSimilarityStatus(
                                  cluster.similarity_score
                                )}
                              >
                                <Text size={12} color="colorWhite">
                                  S: {cluster.similarity_score?.toFixed(2)}
                                </Text>
                              </Tag>
                            )}
                          </Flex>
                        </Flex>
                      ),
                      children: (
                        <ProposedCard
                          currentEntity={candidateEntityIndices[index] ?? 1}
                          data={cluster}
                          referenceEntityData={entityData}
                          isLoading={isCandidatesLoading}
                          title={`Candidate ${index + 1}`}
                          isAlternative={
                            cluster.cluster_id !==
                            currentAction.selected_cluster?.cluster_id
                          }
                          onPrevious={() =>
                            setCandidateEntityIndices((prev) => ({
                              ...prev,
                              [index]: Math.max(1, (prev[index] ?? 1) - 1)
                            }))
                          }
                          onNext={() =>
                            setCandidateEntityIndices((prev) => ({
                              ...prev,
                              [index]: Math.min(
                                cluster.top_entities?.length ?? 1,
                                (prev[index] ?? 1) + 1
                              )
                            }))
                          }
                        />
                      )
                    }
                  ]}
                />
              ))
            : 'No candidates available'}

          {(isCandidatesLoading || isFetchingNextPage) && (
            <Skeleton count={1} height={60} width="100%" />
          )}

          {hasNextPage && (
            <Flex justify="center">
              <Text
                size={14}
                color="colorTextSecondary"
                style={{ cursor: 'pointer' }}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more candidates'}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </section>
  )
}
