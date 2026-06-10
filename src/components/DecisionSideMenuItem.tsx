import { CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons'
import { Text } from '@components'
import { useEntityTypeDescriptors } from '@hooks'
import {
  formatScore,
  formatTimeAgo,
  getConfidenceStatus,
  getEntityDisplayName,
  getReviewState,
  getSimilarityStatus,
  reviewBadges
} from '@utils'
import { type MenuItemProps, Checkbox, Flex, Tag, Tooltip } from 'antd'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  decision: DecisionSummary
  selectionMode?: boolean
  selected?: boolean
} & MenuItemProps

export const DecisionSideMenuItem = ({
  decision,
  selectionMode = false,
  selected = false
}: Props) => {
  const confidenceScore = decision?.current_placement?.confidence_score
  const similarityScore = decision?.current_placement?.similarity_score

  const confidenceScoreFormatted = formatScore(confidenceScore)
  const similarityScoreFormatted = formatScore(similarityScore)

  const descriptors = useEntityTypeDescriptors()
  const entityName = getEntityDisplayName(
    decision?.about_entity_mention,
    descriptors
  )

  const reviewState = getReviewState(decision)
  const reviewBadge = reviewState === 'never' ? null : reviewBadges[reviewState]

  return (
    <Flex gap={12} align="center">
      {selectionMode && (
        <Checkbox
          checked={selected}
          aria-label={`Select decision ${entityName ?? decision?.id}`}
          onClick={(e) => e.preventDefault()}
        />
      )}

      <Flex vertical gap={8} flex={1} style={{ minWidth: 0 }}>
        <Flex justify="space-between">
          <Flex gap={8} align="center">
            <Tooltip title="Confidence">
              <Tag variant="solid" color={getConfidenceStatus(confidenceScore)}>
                <Text size={12} color="colorWhite">
                  C: {confidenceScoreFormatted}
                </Text>
              </Tag>
            </Tooltip>

            <Tooltip title="Similarity">
              <Tag variant="solid" color={getSimilarityStatus(similarityScore)}>
                <Text size={12} color="colorWhite">
                  S: {similarityScoreFormatted}
                </Text>
              </Tag>
            </Tooltip>
          </Flex>

          <Text size={13} color="colorTextSecondary">
            {formatTimeAgo(decision?.created_at)}
          </Text>
        </Flex>

        <Flex gap={8} align="center" style={{ minWidth: 0 }}>
          {reviewBadge && (
            <Tooltip title={reviewBadge.detail}>
              <Tag
                color={reviewBadge.color}
                style={{ margin: 0, flexShrink: 0 }}
                data-testid={`review-badge-${reviewState}`}
                icon={
                  reviewState === 'reviewed' ? (
                    <CheckCircleOutlined />
                  ) : (
                    <HistoryOutlined />
                  )
                }
              >
                {reviewBadge.label}
              </Tag>
            </Tooltip>
          )}

          <Text isEllipsis size={14} weight={600} color="colorTextSecondary">
            {entityName}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
