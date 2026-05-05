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
  // Pre-computed key order so left and right comparison panes line up row-by-row.
  orderedKeys?: string[]
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
  orderedKeys
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

  const orderedDiffs = useMemo(() => {
    if (!diffs) return null
    if (!orderedKeys?.length) return diffs

    const byKey = new Map(diffs.map((d) => [d.key, d]))

    return orderedKeys
      .map((key) => byKey.get(key))
      .filter((d): d is NonNullable<typeof d> => d != null)
  }, [diffs, orderedKeys])

  const renderEmpty = (text: string) => (
    <div className={styles.empty}>{text}</div>
  )

  if (!isComparisonMode || !orderedDiffs) {
    if (!parsedData || typeof parsedData !== 'object') {
      return renderEmpty('No attributes available')
    }

    const data = parsedData as Record<string, unknown>
    const keys = orderedKeys?.length ? orderedKeys : Object.keys(data)

    if (!keys.length) {
      return renderEmpty('No attributes available')
    }

    return (
      <div className={styles.list}>
        {keys.map((key) => (
          <Flex key={key} gap={8} className={styles.row}>
            <Text size={14} weight={600} className={styles.labelContainer}>
              {formatLabel(key)}:
            </Text>
            <Text size={14} weight={400}>
              {stringifyValue(data[key])}
            </Text>
          </Flex>
        ))}
      </div>
    )
  }

  if (!orderedDiffs.length) {
    return renderEmpty('No attributes to compare')
  }

  return (
    <div className="full-width">
      <div className={styles.list}>
        {orderedDiffs.map((diff) => (
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
