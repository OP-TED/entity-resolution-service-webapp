import { DecisionOrdering } from '@api/types.gen'
import { Text } from '@components'
import { useQueryParams } from '@hooks/useQueryParams'
import { Flex } from 'antd'
import { useMemo } from 'react'

import { useStyles } from './styles'

const orderingLabels: Record<DecisionOrdering, string> = {
  [DecisionOrdering.CREATED_AT]: 'created at newest',
  [DecisionOrdering['-CREATED_AT']]: 'created at oldest',
  [DecisionOrdering.UPDATED_AT]: 'updated at newest',
  [DecisionOrdering['-UPDATED_AT']]: 'updated at oldest',
  [DecisionOrdering.CONFIDENCE_SCORE]: 'confidence low to high',
  [DecisionOrdering['-CONFIDENCE_SCORE']]: 'confidence high to low'
}

type Props = {
  count?: number
}

export const DecisionsSideMenuTitle = ({ count }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()

  const orderingLabel = useMemo(() => {
    const ordering = params?.ordering
    if (!ordering) {
      return orderingLabels?.[DecisionOrdering.CREATED_AT]
    }
    return orderingLabels?.[ordering as DecisionOrdering] || ordering
  }, [params?.ordering])

  return (
    <div className={styles.header}>
      <Flex vertical gap={4}>
        <Text color="colorTextSecondary" isEllipsis weight={600} size={16}>
          (sorted by {orderingLabel})
        </Text>
        {count !== undefined && (
          <Text color="colorTextSecondary" size={14}>
            {count} decisions
          </Text>
        )}
      </Flex>
    </div>
  )
}
