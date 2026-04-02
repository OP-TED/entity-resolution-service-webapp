import { Text } from '@components'
import { formatTimeAgo, getConfidenceStatus, getSimilarityStatus } from '@utils'
import { type MenuItemProps, Flex, Tag } from 'antd'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  decision: DecisionSummary
} & MenuItemProps

export const DecisionSideMenuItem = ({ decision }: Props) => {
  const confidenceScore = decision?.current_placement?.confidence_score
  const similarityScore = decision?.current_placement?.similarity_score

  const confidenceScoreFormatted = confidenceScore
    ? confidenceScore.toFixed(2)
    : 'N/A'
  const similarityScoreFormatted = similarityScore
    ? similarityScore.toFixed(2)
    : 'N/A'

  const entityName =
    (
      decision?.about_entity_mention?.parsed_representation as {
        name?: string
      } | null
    )?.name ?? decision?.about_entity_mention?.identified_by?.request_id

  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between">
        <Flex gap={8} align="center">
          <Tag variant="solid"  color={getConfidenceStatus(confidenceScore)}>
            <Text size={12} color="colorWhite">
              C: {confidenceScoreFormatted}
            </Text>
          </Tag>
          {similarityScoreFormatted && (
            <Tag variant="solid" color={getSimilarityStatus(similarityScore)}>
              <Text size={12} color="colorWhite">
                S: {similarityScoreFormatted}
              </Text>
            </Tag>
          )}
        </Flex>

        <Text size={13} color="colorTextSecondary">
          {formatTimeAgo(decision?.created_at)}
        </Text>
      </Flex>

      <Text isEllipsis size={14} weight={600} color="colorTextSecondary">
        {entityName}
      </Text>
    </Flex>
  )
}
