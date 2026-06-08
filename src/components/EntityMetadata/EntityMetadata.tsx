import { InfoCircleOutlined } from '@ant-design/icons'
import { Text } from '@components/Text'

import { Button, Flex, Popover, Typography } from 'antd'

import { useStyles } from './styles'

import type { EntityMentionIdentifier } from '@api/types.gen'

type Props = {
  identifier?: EntityMentionIdentifier | null
}

const MetadataRow = ({ label, value }: { label: string; value?: string }) => (
  <Flex vertical gap={2}>
    <Text size={11} weight={600} color="colorTextSecondary">
      {label}
    </Text>
    <Typography.Text
      copyable={value ? { text: value } : false}
      style={{ fontSize: 12, wordBreak: 'break-all' }}
    >
      {value || '—'}
    </Typography.Text>
  </Flex>
)

/**
 * Minimalistic, on-demand metadata indicator. Renders a small info icon that
 * reveals the entity mention's source_id, request_id and entity_type in a
 * popover, keeping the comparison panes uncluttered.
 */
export const EntityMetadata = ({ identifier }: Props) => {
  const { styles } = useStyles()

  if (!identifier) return null

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      title="Entity mention metadata"
      content={
        <Flex vertical gap={10} className={styles.content}>
          <MetadataRow label="Source ID" value={identifier.source_id} />
          <MetadataRow label="Request ID" value={identifier.request_id} />
          <MetadataRow label="Entity Type" value={identifier.entity_type} />
        </Flex>
      }
    >
      <Button
        type="text"
        size="small"
        aria-label="Show entity mention metadata"
        icon={<InfoCircleOutlined />}
        onClick={(e) => e.stopPropagation()}
      />
    </Popover>
  )
}
