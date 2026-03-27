import { Text } from '@components'
import { useQueryParams } from '@hooks/useQueryParams'
import { useMemo } from 'react'

import { useStyles } from './styles'

const orderingLabels: Record<string, string> = {
  '+created_at': 'created at newest',
  '-created_at': 'created at oldest',
  '+updated_at': 'updated at newest',
  '-updated_at': 'updated at oldest',
  '+confidence_score': 'confidence low to high',
  '-confidence_score': 'confidence high to low'
}

export const DecisionsSideMenuTitle = () => {
  const params = useQueryParams()
  const { styles } = useStyles()

  const orderingLabel = useMemo(() => {
    const ordering = params?.ordering as string | undefined
    if (!ordering) {
      return orderingLabels?.['+created_at']
    }
    return orderingLabels[ordering] || ordering
  }, [params?.ordering])

  return (
    <div className={styles.header}>
      <Text color="colorTextSecondary" isEllipsis weight={600} size={16}>
        (sorted by {orderingLabel})
      </Text>
    </div>
  )
}
