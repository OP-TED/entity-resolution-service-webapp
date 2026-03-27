import { Text } from '@components'
import { formatTimeAgo, getConfidenceStatus } from '@utils'
import { type MenuItemProps, Flex, Tag } from 'antd'

import type { Decision } from '@api/types.gen'

type Props = {
  decision: Decision
} & MenuItemProps

export const DecisionSideMenuItem = ({ decision }: Props) => {
  const confidenceScore =
    decision?.decision_context?.alignment_options?.[0]?.confidence_score
  const confidenceClass = getConfidenceStatus(confidenceScore)

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
        {decision?.decision_context?.subject_entity_display_name}
      </Text>
    </Flex>
  )
}
