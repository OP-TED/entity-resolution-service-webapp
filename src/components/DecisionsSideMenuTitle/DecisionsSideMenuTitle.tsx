import { Text } from '@components'
import { useQueryParams } from '@hooks/useQueryParams'
import { useMemo } from 'react'

import { useStyles } from './styles'

const statusLabels: Record<string, string> = {
  ALL_STATUSES: 'All Statuses',
  AUTOMATIC_CONFIDENT: 'Automatic Confident',
  PENDING_MANUAL_REVIEW: 'Pending Review',
  MANUALLY_REVIEWED: 'Reviewed'
}

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

  const statusLabel = useMemo(() => {
    const status = params?.status as string | undefined
    if (!status) {
      return statusLabels.ALL_STATUSES
    }
    return statusLabels[status] || status
  }, [params?.status])

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
        {statusLabel} (sorted by {orderingLabel})
      </Text>
    </div>
  )
}
