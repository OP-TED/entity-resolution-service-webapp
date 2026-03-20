import {
  EditOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import { type AttributeDiff, getChangeSummary } from '@utils/comparison'

import { Divider, Flex, Space, Tag } from 'antd'

import { useStyles } from './styles'

type Props = {
  diffs: AttributeDiff[]
}

export const DiffSummary = ({ diffs }: Props) => {
  const { styles } = useStyles()
  const summary = getChangeSummary(diffs)

  const hasChanges = summary?.added || summary?.modified || summary?.removed

  if (!hasChanges) return null

  return (
    <Flex className={styles.diffSummary} gap={12} align="center" wrap="wrap">
      <Space separator={<Divider orientation="vertical" />} wrap>
        {summary?.modified > 0 && (
          <Tag
            color="orange"
            icon={<EditOutlined />}
            className={styles.summaryBadge}
          >
            {summary?.modified} Modified
          </Tag>
        )}
        {summary?.added > 0 && (
          <Tag
            color="green"
            icon={<PlusCircleOutlined />}
            className={styles.summaryBadge}
          >
            {summary?.added} Added
          </Tag>
        )}
        {summary?.removed > 0 && (
          <Tag
            color="red"
            icon={<MinusCircleOutlined />}
            className={styles.summaryBadge}
          >
            {summary?.removed} Removed
          </Tag>
        )}
      </Space>
    </Flex>
  )
}
