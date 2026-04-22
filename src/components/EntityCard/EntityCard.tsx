import { EntityAttributes, SkeletonWrapper, Text } from '@components'
import { useDecisionsLoadingState } from '@hooks'
import { compareEntityAttributes, getChangeSummary } from '@utils'

import { Card, Flex, Tag, Tooltip } from 'antd'
import { useMemo } from 'react'

import { useStyles } from './styles'

export type Props = {
  entityData?: unknown
  compareWith?: unknown
}

const formatFieldName = (key: string): string =>
  key
    ?.replaceAll('_', ' ')
    ?.replaceAll(/([A-Z])/g, ' $1')
    ?.replace(/^./, (str) => str.toUpperCase())
    ?.trim()

export const EntityCard = ({
  entityData,
  compareWith
}: Props) => {
  const { styles } = useStyles()
  const isDecisionsMenuLoading = useDecisionsLoadingState()

  const { modifiedCount, removedCount, addedCount, modifiedFields, removedFields, addedFields } = useMemo(() => {
    if (!compareWith) {
      return {
        modifiedCount: 0,
        removedCount: 0,
        addedCount: 0,
        modifiedFields: [] as string[],
        removedFields: [] as string[],
        addedFields: [] as string[]
      }
    }

    const diffs = compareEntityAttributes(entityData, compareWith)
    const summary = getChangeSummary(diffs)

    const modifiedFields = diffs
      ?.filter((diff) => diff.type === 'modified')
      ?.map((diff) => formatFieldName(diff.key))

    const removedFields = diffs
      ?.filter((diff) => diff.type === 'removed')
      ?.map((diff) => formatFieldName(diff.key))

    const addedFields = diffs
      ?.filter((diff) => diff.type === 'added')
      ?.map((diff) => formatFieldName(diff.key))

    return {
      modifiedCount: summary.modified,
      removedCount: summary.removed,
      addedCount: summary.added,
      modifiedFields,
      removedFields,
      addedFields
    }
  }, [entityData, compareWith])

  return (
    <Card
      data-testid="current-entity-card"
      className={styles.entityCard}
      title={
        <Flex className={styles.entityCardHeader} align="center" gap={8} wrap>
          <Text weight={600}>Current Entity</Text>
          {modifiedCount > 0 && (
            <Tooltip title={modifiedFields.join(', ')}>
              <Tag color="orange" data-testid="diff-badge-modified" data-color="orange">
                {modifiedCount} Modified
              </Tag>
            </Tooltip>
          )}
          {removedCount > 0 && (
            <Tooltip title={removedFields.join(', ')}>
              <Tag color="red" data-testid="diff-badge-removed" data-color="red">
                {removedCount} Removed
              </Tag>
            </Tooltip>
          )}
          {addedCount > 0 && (
            <Tooltip title={addedFields.join(', ')}>
              <Tag color="green" data-testid="diff-badge-added" data-color="green">
                {addedCount} Added
              </Tag>
            </Tooltip>
          )}
        </Flex>
      }
    >
      <SkeletonWrapper
        isLoading={isDecisionsMenuLoading}
        count={7}
        height={30}
        width="60%"
      >
        <EntityAttributes
          parsedData={entityData}
          compareWith={compareWith}
        />
      </SkeletonWrapper>
    </Card>
  )
}
