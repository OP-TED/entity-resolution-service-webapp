import { Text } from '@components'
import { useEntityTypeDescriptors } from '@hooks'
import {
  actionTypeColor,
  actionTypeLabel,
  formatTimeAgo,
  getEntityDisplayName
} from '@utils'
import { Flex, Tag } from 'antd'

import type { UserActionSummary } from '@api/types.gen'

type Props = {
  action: UserActionSummary
}

export const UserActionSideMenuItem = ({ action }: Props) => {
  const descriptors = useEntityTypeDescriptors()
  const entityName = getEntityDisplayName(
    action?.about_entity_mention,
    descriptors
  )

  return (
    <Flex vertical gap={8}>
      <Flex justify="space-between" align="center">
        <Tag color={actionTypeColor[action?.action_type]}>
          {actionTypeLabel[action?.action_type]}
        </Tag>

        <Text size={13} color="colorTextSecondary">
          {formatTimeAgo(action?.created_at)}
        </Text>
      </Flex>

      <Text isEllipsis size={14} weight={600} color="colorTextSecondary">
        {entityName}
      </Text>
    </Flex>
  )
}
