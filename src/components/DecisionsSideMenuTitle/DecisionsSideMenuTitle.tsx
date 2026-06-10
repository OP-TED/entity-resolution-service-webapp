import { DecisionOrdering } from '@api/types.gen'
import { Text } from '@components'
import { useBulkSelection } from '@context/useBulkSelection'
import { useQueryParams } from '@hooks/useQueryParams'

import { Button, Flex } from 'antd'
import { useMemo } from 'react'

import { useStyles } from './styles'

const orderingLabels: Record<DecisionOrdering, string> = {
  [DecisionOrdering.CREATED_AT]: 'created at newest',
  [DecisionOrdering['-CREATED_AT']]: 'created at oldest',
  [DecisionOrdering.UPDATED_AT]: 'updated at newest',
  [DecisionOrdering['-UPDATED_AT']]: 'updated at oldest',
  [DecisionOrdering.CONFIDENCE_SCORE]: 'confidence low to high',
  [DecisionOrdering['-CONFIDENCE_SCORE']]: 'confidence high to low',
  [DecisionOrdering.CLUSTER_SIZE]: 'cluster size smallest',
  [DecisionOrdering['-CLUSTER_SIZE']]: 'cluster size largest'
}

type Props = {
  count?: number
}

export const DecisionsSideMenuTitle = ({ count }: Props) => {
  const params = useQueryParams()
  const { styles } = useStyles()
  const { isSelectionMode, selectedCount, enterSelectionMode, exitSelectionMode } =
    useBulkSelection()

  const orderingLabel = useMemo(() => {
    const ordering = params?.ordering
    if (!ordering) {
      return orderingLabels?.[DecisionOrdering.CREATED_AT]
    }

    return orderingLabels?.[ordering as DecisionOrdering] || ordering
  }, [params?.ordering])

  return (
    <div className={styles.header}>
      <Flex justify="space-between" align="flex-start" gap={8}>
        <Flex vertical gap={4} flex={1} style={{ minWidth: 0 }}>
          <Text color="colorTextSecondary" isEllipsis weight={600} size={16}>
            (sorted by {orderingLabel})
          </Text>
          {count !== undefined && (
            <Text color="colorTextSecondary" size={14}>
              {isSelectionMode
                ? `${selectedCount} selected · ${count} total`
                : `${count} decisions`}
            </Text>
          )}
        </Flex>

        {isSelectionMode ? (
          <Button size="small" onClick={exitSelectionMode}>
            Cancel
          </Button>
        ) : (
          <Button
            size="small"
            type="default"
            disabled={!count}
            onClick={enterSelectionMode}
          >
            Select
          </Button>
        )}
      </Flex>
    </div>
  )
}
