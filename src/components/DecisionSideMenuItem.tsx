import { Text } from '@components'
import { formatTimeAgo, getConfidenceStatus } from '@utils'
import { type MenuItemProps, Flex, Tag } from 'antd'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  decision: DecisionSummary
} & MenuItemProps

export const DecisionSideMenuItem = ({ decision }: Props) => {
  const confidenceScore = decision?.current_placement?.confidence_score
  const confidenceClass = getConfidenceStatus(confidenceScore)

  const entityName =
    (
      decision?.about_entity_mention?.parsed_representation as {
        name?: string
      } | null
    )?.name ?? decision?.about_entity_mention?.identified_by?.request_id

  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between">
        <Tag variant="solid" color={confidenceClass}>
          {confidenceScore?.toFixed(2)}
        </Tag>

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
