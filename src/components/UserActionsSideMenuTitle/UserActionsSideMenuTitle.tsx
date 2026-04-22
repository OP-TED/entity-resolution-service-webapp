import { BaseOrdering } from '@api/types.gen'
import { Text } from '@components'
import { useQueryParams } from '@hooks/useQueryParams'
import { Flex } from 'antd'
import { useMemo } from 'react'

import { useStyles } from './styles'

const orderingLabels: Record<BaseOrdering, string> = {
  [BaseOrdering.CREATED_AT]: 'created at newest',
  [BaseOrdering['-CREATED_AT']]: 'created at oldest'
}

type Props = {
  count?: number
}

export const UserActionsSideMenuTitle = ({ count }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()

  const orderingLabel = useMemo(() => {
    const ordering = params?.ordering
    if (!ordering) return orderingLabels[BaseOrdering.CREATED_AT]
    return orderingLabels[ordering as BaseOrdering] || String(ordering)
  }, [params?.ordering])

  return (
    <div className={styles.header}>
      <Flex vertical gap={4}>
        <Text color="colorTextSecondary" isEllipsis weight={600} size={16}>
          (sorted by {orderingLabel})
        </Text>
        {count !== undefined && (
          <Text color="colorTextSecondary" size={14}>
            {count} actions
          </Text>
        )}
      </Flex>
    </div>
  )
}
