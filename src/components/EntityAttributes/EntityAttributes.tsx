import { Text } from '@components/Text'
import { compareEntityAttributes, stringifyValue } from '@utils'

import { Flex } from 'antd'
import { useMemo } from 'react'

import { AttributeValue } from './AttributeValue'
import { DiffIcon } from './DiffIcon '
import { useStyles } from './styles'

type Props = {
  parsedData?: unknown
  compareWith?: unknown
}

const formatLabel = (key: string): string => {
  return key
    .replaceAll('_', ' ')
    .replaceAll(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export const EntityAttributes = ({
  parsedData,
  compareWith,
}: Props) => {
  const { styles, cx } = useStyles()

  const isComparisonMode = compareWith != null

  const diffs = useMemo(
    () =>
      isComparisonMode
        ? compareEntityAttributes(parsedData, compareWith)
        : null,
    [isComparisonMode, parsedData, compareWith]
  )

  const renderEmpty = (text: string) => (
    <div className={styles.empty}>{text}</div>
  )

  if (!isComparisonMode || !diffs) {
    if (!parsedData || typeof parsedData !== 'object') {
      return renderEmpty('No attributes available')
    }

    const entries = Object.entries(parsedData)
    if (!entries.length) {
      return renderEmpty('No attributes available')
    }

    return (
      <div className={styles.list}>
        {entries?.map(([key, value]) => (
          <Flex key={key} gap={8} className={styles.row}>
            <Text size={14} weight={600} className={styles.labelContainer}>
              {formatLabel(key)}:
            </Text>
            <Text size={14} weight={400}>
              {stringifyValue(value)}
            </Text>
          </Flex>
        ))}
      </div>
    )
  }

  if (!diffs?.length) {
    return renderEmpty('No attributes to compare')
  }

  return (
    <div className="full-width">
      <div className={styles.list}>
        {diffs?.map((diff) => (
          <Flex
            key={diff.key}
            className={cx(
              styles.row,
              diff.type === 'added' && styles.rowAdded,
              diff.type === 'removed' && styles.rowRemoved,
              diff.type === 'modified' && styles.rowModified
            )}
          >
            <Flex gap={8} align="center" className={styles.labelContainer}>
              <DiffIcon type={diff.type} />
              <Text size={14} weight={600}>
                {formatLabel(diff.key)}:
              </Text>
            </Flex>

            <AttributeValue diff={diff} />
          </Flex>
        ))}
      </div>
    </div>
  )
}
