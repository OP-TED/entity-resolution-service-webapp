import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

import {
  acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation,
  getProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetOptions,
  rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation
} from '@api/index'
import {
  AlternativeClusters,
  EntityCard,
  ProposedCard,
  SkeletonWrapper,
  Text
} from '@components'
import { useBulkSelection } from '@context/useBulkSelection'
import { useConfirmationPreference } from '@context/useConfirmationPreference'
import {
  useDecisionsLoadingState,
  useEntityTypeDescriptors,
  useRemoveDecisionFromCache
} from '@hooks'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  compareEntityAttributes,
  formatTimeAgo,
  getConfidenceStatus,
  getDisplayNameFromParsed,
  getEntityDisplayName,
  getScoreLabel,
  getSimilarityStatus,
  showApiErrors
} from '@utils'

import {
  Alert,
  App,
  Button,
  Checkbox,
  Col,
  Flex,
  Popconfirm,
  Row,
  Tag,
  Tooltip
} from 'antd'
import { useEffect, useMemo, useState } from 'react'

import { useStyles } from './styles'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  currentDecision?: DecisionSummary
}

export const ComparisonPanel = ({ currentDecision }: Props) => {
  const { styles } = useStyles()
  const [currentEntity, setCurrentEntity] = useState<number>(1)
  const [showAlert, setShowAlert] = useState<boolean>(true)
  const { shouldSkip, setActionSkip } = useConfirmationPreference()
  const skipAccept = shouldSkip('accept')
  const skipReject = shouldSkip('reject')
  const [dontShowAccept, setDontShowAccept] = useState(false)
  const [dontShowReject, setDontShowReject] = useState(false)
  const isDecisionsMenuLoading = useDecisionsLoadingState()
  const { notification } = App.useApp()
  const removeDecisionFromCache = useRemoveDecisionFromCache()
  const { isSelectionMode, selectedCount } = useBulkSelection()
  const descriptors = useEntityTypeDescriptors()

  const currentDecisionId = currentDecision?.id

  const { data, isLoading } = useQuery({
    ...getProposedCanonicalEntityApiV1CurationDecisionsDecisionIdProposedCanonicalEntityGetOptions(
      {
        path: { decision_id: String(currentDecisionId) }
      }
    ),
    enabled: !!currentDecisionId
  })

  useEffect(() => {
    if (currentDecisionId) {
      setCurrentEntity(1)
    }
  }, [currentDecisionId])

  const { mutate: acceptDecision } = useMutation({
    ...acceptDecisionApiV1CurationDecisionsDecisionIdAcceptPostMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: () => {
      if (currentDecisionId) removeDecisionFromCache(currentDecisionId)
      notification.success({ message: 'Decision accepted' })
    }
  })

  const { mutate: rejectDecision } = useMutation({
    ...rejectDecisionApiV1CurationDecisionsDecisionIdRejectPostMutation(),
    onError: (e) =>
      showApiErrors(e, (message) => notification.error({ message })),
    onSuccess: () => {
      if (currentDecisionId) removeDecisionFromCache(currentDecisionId)
      notification.success({ message: 'Decision rejected' })
    }
  })

  const onPreviousEntity = () => {
    if (currentEntity > 1) {
      setCurrentEntity((prev) => prev - 1)
    }
  }

  const onNextEntity = () => {
    if (currentEntity < (data?.top_entities?.length ?? 0)) {
      setCurrentEntity((prev) => prev + 1)
    }
  }

  const entityData =
    currentDecision?.about_entity_mention?.parsed_representation

  const entityDisplayName = getEntityDisplayName(
    currentDecision?.about_entity_mention,
    descriptors
  )

  const currentProposedEntity = data?.top_entities?.[currentEntity - 1]
  const confidenceScore = data?.confidence_score
  const confidenceScoreFormatted = confidenceScore?.toFixed(2)
  const similarityScore = (
    currentDecision?.current_placement as { similarity_score?: number } | null
  )?.similarity_score
  const similarityScoreFormatted = similarityScore?.toFixed(2)

  const currentProposedEntityName = getDisplayNameFromParsed(
    currentProposedEntity?.parsed_representation as
      | Record<string, unknown>
      | null
      | undefined,
    currentDecision?.about_entity_mention?.identified_by?.entity_type,
    descriptors
  )

  const proposedEntityData = currentProposedEntity?.parsed_representation

  // Single source of truth for row order so the left and right cards line up
  // row-by-row. Computed from the current → proposed direction; both sides
  // render their own values in this exact sequence.
  const orderedKeys = useMemo(
    () => compareEntityAttributes(entityData, proposedEntityData).map((d) => d.key),
    [entityData, proposedEntityData]
  )

  const onClickAccept = () => {
    if (!currentDecisionId) return
    acceptDecision({ path: { decision_id: String(currentDecisionId) } })
  }

  const onClickReject = () => {
    if (!currentDecisionId) return
    rejectDecision({ path: { decision_id: String(currentDecisionId) } })
  }

  const isLoadingContent = isLoading || isDecisionsMenuLoading

  const acceptMessage =
    'This will confirm the match and assign the current entity to the proposed cluster. The system will learn from this decision to improve future matching.'

  const rejectMessage =
    'This will reject the proposed match and create a new cluster for the current entity. The system will learn from this decision to avoid similar incorrect matches.'

  if (isSelectionMode) {
    return (
      <section className={styles.comparisonPanel}>
        <Flex
          vertical
          gap={24}
          align="center"
          justify="center"
          className="h-100vh"
        >
          <Flex vertical gap={12} align="center">
            <Text size={24} weight={600} color="colorTextSecondary">
              Bulk selection mode
            </Text>
            <Text size={14} color="colorTextSecondary">
              {selectedCount === 0
                ? 'Pick decisions from the list on the left, then use the action bar at the bottom to accept or reject them together.'
                : `${selectedCount} decision${selectedCount === 1 ? '' : 's'} selected. Use the action bar at the bottom to review and apply a bulk action, or Cancel to return to single-decision review.`}
            </Text>
          </Flex>
        </Flex>
      </section>
    )
  }

  return (
    <section className={styles.comparisonPanel}>
      {currentDecision ? (
        <Flex vertical gap={12}>
          <Flex gap={12} align="center" justify="space-between">
            <SkeletonWrapper
              isLoading={isLoadingContent}
              count={1}
              height={48}
              width="50%"
            >
              <Flex gap={4} align="center" flex={1} style={{ minWidth: 0 }}>
                <Text isEllipsis size={32} weight={600}>
                  {entityDisplayName}
                </Text>

                {currentProposedEntityName && (
                  <Text size={32} weight={600}>
                    =
                  </Text>
                )}

                <Text size={32} weight={600} isEllipsis>
                  {currentProposedEntityName}
                </Text>
              </Flex>
            </SkeletonWrapper>

            <Flex gap={12} align="center" flex-shrink={0}>
              <SkeletonWrapper
                isLoading={isLoadingContent}
                borderRadius={8}
                count={1}
                height={32}
                width="140px"
              >
                <Flex gap={8} align="center">
                  <Tooltip title="Confidence">
                    <Tag
                      variant="solid"
                      color={getConfidenceStatus(confidenceScore)}
                    >
                      <Text size={12} color="colorWhite">
                        C: {confidenceScoreFormatted}
                      </Text>
                    </Tag>
                  </Tooltip>

                  {similarityScoreFormatted && (
                    <Tooltip title="Similarity">
                      <Tag
                        variant="solid"
                        color={getSimilarityStatus(similarityScore)}
                      >
                        <Text size={12} color="colorWhite">
                          S: {similarityScoreFormatted}
                        </Text>
                      </Tag>
                    </Tooltip>
                  )}
                </Flex>
              </SkeletonWrapper>

              <Flex gap={8} align="center">
                <Popconfirm
                  disabled={skipAccept}
                  title={acceptMessage}
                  description={
                    <Checkbox
                      checked={dontShowAccept}
                      onChange={(e) => setDontShowAccept(e.target.checked)}
                    >
                      Don't show again
                    </Checkbox>
                  }
                  onConfirm={() => {
                    if (dontShowAccept) setActionSkip('accept', true)
                    onClickAccept()
                  }}
                  onCancel={() => {
                    if (dontShowAccept) setActionSkip('accept', true)
                  }}
                  onOpenChange={(open) => {
                    if (open) setDontShowAccept(false)
                  }}
                  trigger="click"
                  style={{ maxWidth: '200px' }}
                >
                  <Button
                    shape="circle"
                    icon={<CheckOutlined />}
                    color="green"
                    variant="solid"
                    disabled={!currentDecisionId}
                    onClick={skipAccept ? onClickAccept : undefined}
                  />
                </Popconfirm>

                <Popconfirm
                  disabled={skipReject}
                  trigger="click"
                  title={rejectMessage}
                  description={
                    <Checkbox
                      checked={dontShowReject}
                      onChange={(e) => setDontShowReject(e.target.checked)}
                    >
                      Don't show again
                    </Checkbox>
                  }
                  onConfirm={() => {
                    if (dontShowReject) setActionSkip('reject', true)
                    onClickReject()
                  }}
                  onCancel={() => {
                    if (dontShowReject) setActionSkip('reject', true)
                  }}
                  onOpenChange={(open) => {
                    if (open) setDontShowReject(false)
                  }}
                >
                  <Button
                    shape="circle"
                    icon={<CloseOutlined />}
                    color="danger"
                    variant="solid"
                    disabled={!currentDecisionId}
                    onClick={skipReject ? onClickReject : undefined}
                  />
                </Popconfirm>
              </Flex>
            </Flex>
          </Flex>

          {/* Closable alert */}
          {showAlert && (
            <Alert
              type="warning"
              closable={{
                closeIcon: true,
                onClose: () => setShowAlert(false)
              }}
              title={
                <Flex gap={4} align="center" wrap>
                  <Text weight={600}>Why review needed: </Text>

                  <Text color="colorTextSecondary">
                    <strong> {getScoreLabel(similarityScore ?? 0)} </strong>
                    similarity but{' '}
                    <strong>{getScoreLabel(confidenceScore ?? 0)}</strong>{' '}
                    confidence due to multiple competing alternatives •
                  </Text>

                  <Text weight={600}>Cluster size: </Text>

                  <Text color="colorTextSecondary">
                    {data?.top_entities?.length} entities •
                  </Text>

                  <Text weight={600}>Last updated: </Text>

                  <Text color="colorTextSecondary">
                    {formatTimeAgo(currentDecision?.created_at ?? '')}
                  </Text>
                </Flex>
              }
            />
          )}

          <Row gutter={32}>
            <Col xs={24} lg={12}>
              <EntityCard
                entityData={entityData}
                compareWith={proposedEntityData}
                orderedKeys={orderedKeys}
              />
            </Col>

            <Col xs={24} lg={12}>
              <ProposedCard
                data={data}
                referenceEntityData={entityData}
                orderedKeys={orderedKeys}
                isLoading={isLoading}
                currentEntity={currentEntity}
                onPrevious={onPreviousEntity}
                onNext={onNextEntity}
              />
            </Col>
          </Row>

          <AlternativeClusters currentDecision={currentDecision} />
        </Flex>
      ) : (
        <Flex
          vertical
          gap={24}
          align="center"
          justify="center"
          className="h-100vh"
        >
          <Flex vertical gap={12} align="center">
            <Text size={24} weight={600} color="colorTextSecondary">
              No Decisions to Review
            </Text>
            <Text size={14} color="colorTextSecondary">
              Select a decision from the list on the left to get started, or
              adjust your filters to find decisions matching your criteria.
            </Text>
          </Flex>
        </Flex>
      )}
    </section>
  )
}
