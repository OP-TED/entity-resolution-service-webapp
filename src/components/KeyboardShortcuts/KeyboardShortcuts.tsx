import { Text } from '@components'
import { useKeyboardShortcuts } from '@hooks'

import { Card } from 'antd'

import { useStyles } from './styles'

import type { DecisionSummary } from '@api/types.gen'

type Props = {
  activeDecision?: DecisionSummary
}

export const KeyboardShortcuts = ({ activeDecision }: Props) => {
  useKeyboardShortcuts({ activeDecision })
  const { styles } = useStyles()

  return (
    <Card
      className={styles.keyboardShortcuts}
      size="small"
      variant="borderless"
    >
      <Text weight={700} color="colorTextSecondary">
        Keyboard shortcuts:
      </Text>
      A = Accept | R = Reject | ↑↓ = Navigate queue
    </Card>
  )
}
