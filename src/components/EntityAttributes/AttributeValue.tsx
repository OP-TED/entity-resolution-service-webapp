import { type AttributeDiff, stringifyValue } from '@utils/comparison'

import { Alert, Flex } from 'antd'

import { useStyles } from './styles'

type Props = {
  diff?: AttributeDiff
}

export const AttributeValue = ({ diff }: Props) => {
  const { styles } = useStyles()

  if (diff?.type === 'modified') {
    return (
      <Flex vertical gap={8} flex={1}>
        <Alert
          title="Previous Value"
          description={stringifyValue(diff?.oldValue)}
          type="error"
          className={styles.alert}
        />

        <Alert
          title="New Value"
          description={stringifyValue(diff?.newValue)}
          type="success"
          className={styles.alert}
        />
      </Flex>
    )
  }

  return stringifyValue(diff?.currentValue)
}
